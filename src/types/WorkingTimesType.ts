import {TimeEntryType} from "./TimeEntryType";

export interface WorkingTimesType {
    date: string,
    workingTimes: TimeEntryType[],
    freeTimes: TimeEntryType[],
    workingMinutes: number,
    freeMinutes: number,
}