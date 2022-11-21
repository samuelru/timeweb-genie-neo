#!/usr/bin/env node
import Http from "./classes/Http";
import { ConfigType } from "./types/ConfigType";
import { Parser } from "./classes/Parser";
import { DateTime } from "./utils/DateTime";
import { DefaultConfig } from "./config/DefaultConfig";
import ConfigReader from "./repository/ConfigReader";
import { TablePrinter } from "./utils/TablePrinter";
import {Calculator} from "./classes/Calculator";

const scriptArgs = process.argv.slice(2);

const configReader = new ConfigReader();
const homeDirConfig = configReader.getConfigFromHomeDir();

const config = {
  ...DefaultConfig,
  ...homeDirConfig,
} as ConfigType;

const http = new Http(config);
const parser = new Parser(config);

(async () => {
  await run();
})();

async function run() {
  try {
    await http.authenticate(config.username, config.password);
  } catch (e) {
    console.error("Failed to sign in - please verify your credentials!");
    process.exit(2);
  }

  const timeCardHtml = await http.loadTimeCardHtml(
    DateTime.getDateFrom(scriptArgs[0]),
    DateTime.getDateTo(scriptArgs[1])
  );

  const dateTimes = parser.parseDateTimes(timeCardHtml);
  
  const workingTimes = Calculator.getWorkingTimes(dateTimes);

  TablePrinter.print(config, workingTimes);
}
