import { ConfigType } from "../types/ConfigType";
import { WorkingTimesType } from "../types/WorkingTimesType";
import { DateTime } from "./DateTime";
import { ClockOutUtil } from "./ClockOutUtil";
import { Memes } from "./Memes";

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

    if (table.length >= 3) {
      const lastDay = table[table.length - 3];

      let result = "";
      const percent = (lastDay["Working Hours"] / 7.5) * 100;
      for (let i = 0; i < Math.max(100, percent); i++) {
        if (i <= Math.min(percent, 100)) {
          result += "█";
        } else if (i > 100) {
          result += "⣿";
        } else {
          result += "░";
        }
      }

      console.log("Last day:");
      console.log(
        `${result} ${lastDay["Diff Hours"] > 0 ? "+" : ""} ${lastDay.Diff}`
      );
      console.log();

      if (lastDay["Diff Hours"] > 0) {
        Memes.happy();

        console.log(`Yeah, you have done a good job today!`);
      }
    }
  }
}
