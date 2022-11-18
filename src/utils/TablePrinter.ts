import { ConfigType } from "../types/ConfigType";
import { WorkingTimesType } from "../types/WorkingTimesType";
import { DateTime } from "./DateTime";
import { ClockOutUtil } from "./ClockOutUtil";

export class TablePrinter {
  static print(config: ConfigType, result: WorkingTimesType[]) {
    const totals = {
      workingMinutes: 0,
      freeMinutes: 0,
      relativeMinutes: 0,
    };

    const table = result.map((dateTime: WorkingTimesType) => {
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
        "Clock Out": DateTime.minutesToTime(
          ClockOutUtil.getClockOutTime(config, dateTime)
        ),
      };
    });

    // @ts-ignore
    table.push({}); //empty line

    table.push({
      Date: "TOTAL",
      "Working Hours": DateTime.minutesToHours(totals.workingMinutes),
      "Working Time": DateTime.durationText(totals.workingMinutes),
      "Free Time": "",
      "Diff Hours": DateTime.minutesToHours(totals.relativeMinutes),
      Diff: DateTime.durationText(totals.relativeMinutes),
      "Clock Out": "",
    });

    console.table(table);
  }
}
