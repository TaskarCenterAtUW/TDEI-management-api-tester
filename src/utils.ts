
import { AuthApi, Configuration } from "tdei-management-client";
import { environment } from "./environment/environment";
import apiInput from "../api.input.json";
import path from "path";
import * as fs from "fs";
import { SeedDetails } from "./data.seed";
/**
 * Utility class.
 */
export class Utility {
  static async setAuthToken(configuration: Configuration) {
    let authAPI = new AuthApi(configuration);
    const loginResponse = await authAPI.authenticate({
      username: configuration.username,
      password: configuration.password
    });
    configuration.baseOptions = {
      headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
    };
  }

  static get seedData() {
    const seedData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../seed.data.json'), 'utf-8'));
    return new SeedDetails(seedData);
  }

  static getApiInput() {
    return apiInput[`${environment.environment}`];
  }

  static getAdminConfiguration(): Configuration {
    return new Configuration({
      username: environment.seed.adminUser,
      password: environment.seed.adminPassword,
      basePath: environment.seed.baseUrl
    });
  }

  static getApiKeyConfiguration() {
    let configuration = new Configuration({
      basePath: environment.system.baseUrl,
      apiKey: this.seedData.api_key
    });
    return configuration;
  }

  static getPocConfiguration(): Configuration {
    return new Configuration({
      username: this.seedData?.users?.poc.username,
      password: this.seedData?.users?.poc.password,
      basePath: environment.system.baseUrl
    });
  }

  static getDefaultUserConfiguration(): Configuration {
    return new Configuration({
      username: this.seedData?.users?.default_user.username,
      password: this.seedData?.users?.default_user.password,
      basePath: environment.system.baseUrl
    });
  }

  public static async login(username: string, password: string) {
    let generalAPI = new AuthApi(new Configuration({
      basePath: environment.seed.baseUrl
    }));
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
  OSW_DATA_GENERATOR = "osw_data_generator",
  MEMBER = "member"
}