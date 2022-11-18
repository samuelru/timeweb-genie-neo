#!/usr/bin/env node
import Http from "./classes/Http";
import { ConfigType } from "./types/ConfigType";
import { Parser } from "./classes/Parser";
import { DateTime } from "./utils/DateTime";
import { DefaultConfig } from "./config/DefaultConfig";
import ConfigReader from "./repository/ConfigReader";
import { TablePrinter } from "./utils/TablePrinter";

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
  try {
    await http.authenticate(config.username, config.password);
  } catch (e) {
    console.error("Failed to sign in - please verify your credentials!");
    process.exit(2);
  }

  let fromDate;
  let toDate;

  if (
    DateTime.checkDateFormat(scriptArgs[0]) &&
    DateTime.checkDateFormat(scriptArgs[1])
  ) {
    fromDate = scriptArgs[0];
    toDate = scriptArgs[1];
  } else {
    const now = new Date();
    fromDate = DateTime.formatDate(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );
    toDate = DateTime.formatDate(
      new Date(now.getFullYear(), now.getMonth() + 1, 0)
    );
  }

  const timeCardHtml = await http.loadTimeCardHtml(fromDate, toDate);

  const workingTimes = parser.parseTimeCard(timeCardHtml);

  TablePrinter.print(config, workingTimes);
})();
