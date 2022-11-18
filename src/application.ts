#!/usr/bin/env node
import os from 'os';

import {WorkingTimesType} from "./types/WorkingTimesType";
import {TimeEntryType} from "./types/TimeEntryType";
import Http from "./classes/Http";
import {ConfigType} from "./types/ConfigType";
import {Parser} from "./classes/Parser";
import {DateTime} from "./utils/DateTime";
import {TimeTypeEnum} from "./enum/TimeTypeEnum";

const scriptArgs = process.argv.slice(2);

let config = {
  timewebUrl: '',
  username: '',
  password: '',
  justificationTypes: [
    "SMART WORKING",
    "23TELE TELEARBEIT",
    "02DIGA AUSSENDIENST",
    "04SCHU SCHULUNG PASSIV",
    "S-FEÜB FEIERTAGSÜBERSTUNDEN",
    "SCHULUNG AKTIV",
    "ZUSÄTZLICHE ARBEITSZEIT",
  ],
  justificationTypesToIgnore: [
    "06ZAOA ZEITAUSGLEICH o. ABZUG",
  ],
  targetWorkingHours: 7.5,
  targetBreakMinutes: 60,
} as ConfigType;

try {
  const homeDir = os.homedir();

  console.log("homeDir", homeDir)

  config = {
    ...config,
    ...require(`${homeDir}/.timeweb-genie.json`),
  } as ConfigType;
} catch (e) {
  console.error("Could not open ~/.timeweb-genie.json - PLease see README.md!");
  process.exit(1);
}

const http = new Http(config);

const parser = new Parser(config);

(async () => {

  console.log("config", config)

  try {
    await http.authenticate(config.username, config.password);
  } catch (e) {
    console.error("Failed to sign in - please verify your credentials!");
    process.exit(2);
  }

  let fromDate;
  let toDate;

  if (DateTime.checkDateFormat(scriptArgs[0]) && DateTime.checkDateFormat(scriptArgs[1])) {
    fromDate = scriptArgs[0];
    toDate = scriptArgs[1];
  } else {
    const now = new Date();
    fromDate = DateTime.formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
    toDate = DateTime.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  }

  const timeCardHtml = await http.loadTimeCardHtml(fromDate, toDate);
  parser.parseTimeCard(timeCardHtml);

  const totals = {
    workingMinutes: 0,
    freeMinutes: 0,
    relativeMinutes: 0,
  };

  const table = parser.getWorkingTimes().map((dateTime: WorkingTimesType) => {
    const relativeMinutes =
      dateTime.workingMinutes +
      dateTime.freeMinutes -
      config.targetWorkingHours * 60;

    totals.workingMinutes += dateTime.workingMinutes;
    totals.freeMinutes += dateTime.freeMinutes;
    totals.relativeMinutes += relativeMinutes;

    return {
      Date: dateTime.date,
      "Working Hours": DateTime.minutesToHours(dateTime.workingMinutes),
      "Working Time": DateTime.durationText(dateTime.workingMinutes),
      "Free Time": DateTime.durationText(dateTime.freeMinutes),
      "Diff Hours": DateTime.minutesToHours(relativeMinutes),
      Diff: DateTime.durationText(relativeMinutes),
      "Clock Out": DateTime.minutesToTime(getClockOutTime(dateTime)),
    };
  });

  table.push(
    // @ts-ignore
    {},
    {
      Date: "TOTAL",
      "Working Hours": DateTime.minutesToHours(totals.workingMinutes),
      "Working Time": DateTime.durationText(totals.workingMinutes),
      "Diff Hours": DateTime.minutesToHours(totals.relativeMinutes),
      Diff: DateTime.durationText(totals.relativeMinutes),
    }
  );

  console.table(table);
})();

// TODO: move to own utility lib or class?
function getClockOutTime({ workingTimes, workingMinutes, freeMinutes }: { workingTimes: TimeEntryType[] , workingMinutes: number, freeMinutes:number }) {
  let time = 0;

  if (workingTimes && workingTimes.length > 0) {
    const workingTime = workingTimes[workingTimes.length - 1];
    if (workingTime.type === TimeTypeEnum.END) {
      time = workingTime.time;
    }
    if (workingTime.type === TimeTypeEnum.START) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      time =
        nowMinutes +
        (config.targetWorkingHours * 60 - workingMinutes) +
        (nowMinutes < 720 || workingTimes.length < 2
          ? config.targetBreakMinutes
          : 0) +
        freeMinutes;
    }
  }

  return time;
}