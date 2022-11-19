import { ConfigType } from "../types/ConfigType";
import { DateTimeType } from "../types/DateTimeType";
import { TimeEntryType } from "../types/TimeEntryType";
import { WorkingTimesType } from "../types/WorkingTimesType";
import { TimeTypeEnum } from "../enum/TimeTypeEnum";
import { DefaultConfig } from "../config/DefaultConfig";

export class Parser {
  config = DefaultConfig;

  constructor(config?: ConfigType) {
    if (config) {
      this.config = config;
    }
  }

  parseTimeCard(timeCardHtml: string): WorkingTimesType[] {
    const dateTimes = this.#parseDateTimes(timeCardHtml);
    return this.#getWorkingTimes(dateTimes);
  }

  #getWorkingTimes(dateTimes: DateTimeType[]): WorkingTimesType[] {
    return dateTimes.map(({ date, workingTimes, freeTimes }) => {
      let workingMinutes = 0;
      let freeMinutes = 0;

      try {
        workingMinutes = calculateWorkingTime(workingTimes);
        freeMinutes = calculateWorkingTime(freeTimes);
      } catch (e: unknown) {
        // @ts-ignore
        console.error(e.message);
      }

      return {
        date,
        workingTimes,
        freeTimes,
        workingMinutes,
        freeMinutes,
      } as WorkingTimesType;
    });
  }

  #parseDateTimes(timeCardHtml: string): DateTimeType[] {
    let dateTimes = [] as DateTimeType[];

    const rowRegex =
      /<td[^>]+>(?:<font[^>]+>)?(\d{2}.\d{2}.\d{2})[^<]+(?:<\/font>)?<\/td>[\S\s]+?<\/tr>(?:<tr style="background-color:#EEEEEE"|<\/table>\W+<\/div>)/gi;
    let rowMatches;

    while ((rowMatches = rowRegex.exec(timeCardHtml))) {
      const date = rowMatches[1];
      const row = rowMatches[0];

      const { workingTimes, freeTimes } = this.#parseRow(row);

      if (workingTimes.length || freeTimes.length) {
        dateTimes.push({
          date,
          workingTimes,
          freeTimes,
        });
      }
    }

    return dateTimes;
  }

  #parseRow(row: string) {
    const clockedTimes = this.#parseClockedTimes(row);
    const { workingTimes, freeTimes } = this.#parseJustificationTimes(row);

    return {
      workingTimes: mergeTimes(clockedTimes, workingTimes),
      freeTimes,
    };
  }

  #parseClockedTimes(row: string) {
    let times = [];

    const colRegex = /<td[^>]+>((?:[EU]\d{2}:\d{2}[\W<br>]+)+)<\/td>/i;
    let timesColMatches = colRegex.exec(row);

    if (timesColMatches) {
      const timesCol = timesColMatches[1];
      const timesRegex = /([EU])(\d{2}:\d{2})/g;

      let timesMatches;
      while ((timesMatches = timesRegex.exec(timesCol))) {
        times.push({
          type: timesMatches[1] === "E" ? TimeTypeEnum.START : TimeTypeEnum.END,
          time: timeHHMMToMinutes(timesMatches[2]),
        });
      }
    }

    return times;
  }

  #parseJustificationTimes(row: string) {
    let workingTimes = [] as TimeEntryType[];
    let freeTimes = [] as TimeEntryType[];

    const htmlRegex = /<th[^>]*>descrizione<\/th><th[^>]*>tipo<\/th>(.*?),/i;
    const htmlMatches = htmlRegex.exec(row);

    if (htmlMatches) {
      const popupHtml = htmlMatches[1];
      const rowRegex = /<TR(.*?)<\/TR>/gi;

      let rowMatches;
      while ((rowMatches = rowRegex.exec(popupHtml))) {
        const row = rowMatches[1];

        const timesRegex = /<TD>(\d{2}:\d{2})<\/TD><TD>(\d{2}:\d{2})<\/TD>/i;
        const timesMatches = timesRegex.exec(row);

        if (this.isJustificationNotCountingAsWorkingTime(row)) {
          if (this.isWholeDay(timesMatches)) {
            this.addSubtractingDay(workingTimes);
          }
          continue;
        }

        if (timesMatches) {
          workingTimes.push(
            {
              type: TimeTypeEnum.START,
              time: timeHHMMToMinutes(timesMatches[1]),
            },
            {
              type: TimeTypeEnum.END,
              time: timeHHMMToMinutes(timesMatches[2]),
            }
          );
        }
      }
    }

    return {
      workingTimes,
      freeTimes,
    };
  }

  private isJustificationNotCountingAsWorkingTime(row: string) {
    return this.config.justificationTypesNotCountingAsWorkingTime.find((type) =>
      row.includes(type)
    );
  }

  private addSubtractingDay(workingTimes: TimeEntryType[]) {
    workingTimes.push(
      {
        type: TimeTypeEnum.START,
        time: 0,
      },
      {
        type: TimeTypeEnum.END,
        time: 0,
      }
    );
  }

  private isWholeDay(timesMatches: RegExpExecArray | null) {
    return !timesMatches;
  }
}

function timeHHMMToMinutes(time: string) {
  const parts = time.split(":");
  return +parts[0] * 60 + +parts[1];
}

function mergeTimes(
  clockedTimes: TimeEntryType[],
  workingTimes: TimeEntryType[]
) {
  const items = clockedTimes
    .concat(workingTimes)
    .sort((timeA, timeB) => timeA.time - timeB.time);

  const result = [] as TimeEntryType[];
  let previousType = "";
  for (let item of items) {
    if (previousType === item.type && previousType === TimeTypeEnum.START) {
      previousType = item.type;
      continue;
    }
    if (previousType === item.type && previousType === TimeTypeEnum.END) {
      result.pop();
    }

    previousType = item.type;
    result.push(item);
  }

  return result;
}

function calculateWorkingTime(times: TimeEntryType[]) {
  let currentType = TimeTypeEnum.END;
  let currentTime = 0;

  let time = times.reduce((workingTime, { type, time }) => {
    if (currentType === TimeTypeEnum.END && type === TimeTypeEnum.START) {
      currentTime = time;
      currentType = type;
      return workingTime;
    }
    if (currentType === TimeTypeEnum.START && type === TimeTypeEnum.END) {
      currentType = type;
      return workingTime + (time - currentTime);
    }
    throw new Error("Start and end times not matching");
  }, 0);

  // Use current time as end time, if last logged is a start time (= currently working)
  if (currentType === TimeTypeEnum.START) {
    const now = new Date();
    time +=
      now.getHours() * 60 + now.getMinutes() - times[times.length - 1].time;
  }

  return time;
}
