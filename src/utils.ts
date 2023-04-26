
import { Configuration } from "tdei-management-client";
import config from "./test-harness.json";
/**
 * Utility class.
 */
export class Utility {
  static getConfiguration(): Configuration {
    return new Configuration({
      username: config.system.username,
      password: config.system.password,
      basePath: config.system.baseUrl
    });
  }

  static addAuthZHeader(accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }

}