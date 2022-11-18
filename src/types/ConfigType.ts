export interface ConfigType {
  timewebUrl: string;
  username: string;
  password: string;
  justificationTypes: string[];
  justificationTypesToIgnore: string[];
  targetWorkingHours: number;
  targetBreakMinutes: number;
}
