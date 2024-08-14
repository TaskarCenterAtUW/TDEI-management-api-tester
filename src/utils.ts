
import { AuthApi, Configuration } from "tdei-management-client";
import { environment } from "./environment/environment";
/**
 * Utility class.
 */
export class Utility {
  static getConfiguration(): Configuration {
    return new Configuration({
      username: environment.seed.adminUser,
      password: environment.seed.adminPassword,
      basePath: environment.seed.baseUrl
    });
  }

  public static async login(username: string, password: string) {
    let configuration = Utility.getConfiguration();
    let generalAPI = new AuthApi(configuration);
    return await generalAPI.authenticate({
      username: username,
      password: password
    });
  }

  static parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  static addAuthZHeader(accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }
}

export enum TDEIROLES {
  TDEI_ADMIN = "tdei_admin",
  POC = "poc",
  FLEX_DATA_GENERATOR = "flex_data_generator",
  PATHWAYS_DATA_GENERATOR = "pathways_data_generator",
  OSW_DATA_GENERATOR = "osw_data_generator"
}