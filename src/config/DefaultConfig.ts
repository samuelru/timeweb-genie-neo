import { ConfigType } from "../types/ConfigType";

export const DefaultConfig: ConfigType = {
  timewebUrl: "",
  username: "",
  password: "",
  justificationTypes: [
    "SMART WORKING",
    "23TELE TELEARBEIT",
    "02DIGA AUSSENDIENST",
    "04SCHU SCHULUNG PASSIV",
    "S-FEÜB FEIERTAGSÜBERSTUNDEN",
    "SCHULUNG AKTIV",
    "ZUSÄTZLICHE ARBEITSZEIT",
  ],
  justificationTypesToIgnore: ["06ZAOA ZEITAUSGLEICH o. ABZUG"],
  targetWorkingHours: 7.5,
  targetBreakMinutes: 60,
};
