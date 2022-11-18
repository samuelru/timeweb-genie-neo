import { TimeEntryType } from "./TimeEntryType";

export interface DateTimeType {
  date: string;
  workingTimes: TimeEntryType[];
  freeTimes: TimeEntryType[];
}
