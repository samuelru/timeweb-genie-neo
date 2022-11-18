import { TimeTypeEnum } from "../enum/TimeTypeEnum";
import { ConfigType } from "../types/ConfigType";
import { WorkingTimesType } from "../types/WorkingTimesType";

export class ClockOutUtil {
  static getClockOutTime(config: ConfigType, entry: WorkingTimesType) {
    const { workingTimes, workingMinutes, freeMinutes } = entry;

    if (workingTimes && workingTimes.length > 0) {
      const workingTime = workingTimes[workingTimes.length - 1];
      if (workingTime.type === TimeTypeEnum.END) {
        return workingTime.time;
      }
      if (workingTime.type === TimeTypeEnum.START) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return (
          nowMinutes +
          (config.targetWorkingHours * 60 - workingMinutes) +
          (nowMinutes < 720 || workingTimes.length < 2
            ? config.targetBreakMinutes
            : 0) +
          freeMinutes
        );
      }
    }

    return 0;
  }
}
