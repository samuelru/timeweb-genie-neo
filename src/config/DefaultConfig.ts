import { ConfigType } from "../types/ConfigType";

export const DefaultConfig: ConfigType = {
  timewebUrl: "",
  username: "",
  password: "",
  justificationTypesNotCountingAsWorkingTime: ["06ZAOA ZEITAUSGLEICH o. ABZUG"],
  targetWorkingHours: 7.5,
  targetBreakMinutes: 60,
};
