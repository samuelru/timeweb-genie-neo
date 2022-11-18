import axios from "axios";
import https from "https";
import http from "node:http";
import {ConfigType} from "../types/ConfigType";

export default class Http {

  timewebUrl: string;
  httpsAgent: http.Agent;
  cookies: string[];

  constructor(config: ConfigType) {
    this.timewebUrl = config.timewebUrl;

    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    this.cookies = [];
  }

  async authenticate(username: string, password: string) {

    let data = this.#encodeFormData({
      AZIONE: "RICHIESTAAUTENTIFICAZIONE",
      USERNAME: username,
      PASSWORD: password,
    });

    const response = await axios({
      url: this.timewebUrl,
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: data,
      httpsAgent: this.httpsAgent,
    });

    if (/name='USERNAME'/.test(response.data)) {
      throw new Error("Login failed");
    }

    // @ts-ignore
    this.cookies = response.headers["set-cookie"];
  }

  async loadTimeCardHtml(fromDate: string, toDate: string) {
    if (!this.cookies) {
      throw new Error("Not authenticated!");
    }

    const responseTimeCard = await axios({
      url: this.timewebUrl,
      method: "POST",
      headers: {
        Cookie: this.#parseCookies(this.cookies),
      },
      data: this.#encodeFormData({
        AZIONE: "CARTELLINO",
        DATAINIZIO: fromDate,
        DATAFINE: toDate,
      }),
      httpsAgent: this.httpsAgent,
    });

    return responseTimeCard.data;
  }

  #parseCookies(cookies: string[]) {
    return cookies
        .map((entry) => {
          const parts = entry.split(";");
          return parts[0];
        })
        .join(";");
  }

  #encodeFormData(data: Object) {
    return Object.keys(data).reduce(
        // @ts-ignore
        (str, key) => str + `&${key}=${encodeURIComponent(data[key])}`,
        ""
    );
  }

};


