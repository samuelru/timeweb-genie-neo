import os from "os";
import { ConfigType } from "../types/ConfigType";

export default class ConfigReader {
  homeDir = "";

  constructor() {
    this.homeDir = os.homedir();
  }

  getConfigFromHomeDir(): ConfigType {
    try {
      if (this.homeDir === "") {
        console.error(
          "Could not open ~/.timeweb-genie.json - PLease see README.md!"
        );
        process.exit(1);
      }

      return require(`${this.homeDir}/.timeweb-genie.json`);
    } catch (e) {
      console.error(
        "Could not open ~/.timeweb-genie.json - PLease see README.md!"
      );
      process.exit(1);
    }
  }
}
