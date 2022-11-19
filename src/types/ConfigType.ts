export interface ConfigType {
  timewebUrl: string;
  username: string;
  password: string;
  justificationTypesNotCountingAsWorkingTime: string[];
  targetWorkingHours: number;
  targetBreakMinutes: number;
}
