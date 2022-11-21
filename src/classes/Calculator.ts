import {DateTimeType} from "../types/DateTimeType";
import {WorkingTimesType} from "../types/WorkingTimesType";
import {TimeEntryType} from "../types/TimeEntryType";
import {TimeTypeEnum} from "../enum/TimeTypeEnum";

export class Calculator {
    static getWorkingTimes(dateTimes: DateTimeType[]): WorkingTimesType[] {
        return dateTimes.map(({ date, workingTimes, freeTimes }) => {
            let workingMinutes = 0;
            let freeMinutes = 0;

            try {
                workingMinutes = this.#calculateWorkingTime(workingTimes);
                freeMinutes = this.#calculateWorkingTime(freeTimes);
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

    static #calculateWorkingTime(times: TimeEntryType[]) {
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
}