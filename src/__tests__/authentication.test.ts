import { Utility } from "../utils";
import { AuthApi, ResetCredentialModel, Token } from "tdei-management-client";
import { faker } from '@faker-js/faker';
import { TdeiObjectFaker } from "../tdei-object-faker";
import seed, { SeedDetails } from "../data.seed";

describe("Authentication service", () => {
  let seederData: SeedDetails | undefined = undefined;
  let configuration = Utility.getAdminConfiguration();
  let pocUserConfiguration = Utility.getPocConfiguration();
  let userWithoutLogin = Utility.getPocConfiguration();
  let defaultUser = Utility.getDefaultUserConfiguration();
  let apikeyUser = Utility.getApiKeyConfiguration();

  beforeAll(async () => {
    seederData = await seed.generate();
    await Utility.setAuthToken(pocUserConfiguration);
    await Utility.setAuthToken(defaultUser);
  }, 50000);

  describe("Authenticate", () => {
    describe("Validation", () => {
      it("When invalid user credentials provided, expect to return unauthorized request", async () => {
        //Arrange
        let configuration = Utility.getAdminConfiguration();
        let generalAPI = new AuthApi(configuration);
        //Act
        const login = generalAPI.authenticate({
          username: faker.internet.email(),
          password: faker.internet.password()
        });
        //Assert
        await expect(login).rejects.toMatchObject({ response: { status: 401 } });
      });
    });

    describe("Functional", () => {
      it("When valid user credentials provided, Expect to return object of type Token containing access_token & refresh_token", async () => {
        //Arrange
        let configuration = Utility.getAdminConfiguration();
        let generalAPI = new AuthApi(configuration);
        //Act

        let response = await generalAPI.authenticate({
          username: configuration.username,
          password: configuration.password
        });

        //Assert
        expect(response.data).toMatchObject(
          <Token>
          {
            access_token: expect.any(String),
            refresh_token: expect.any(String)
          }
        );
      });
    });
  });

  describe("Refresh Token", () => {
    describe("Validation", () => {
      it("When provided invalid refresh token, expect to return server error", async () => {
        //Arrange
        let configuration = Utility.getAdminConfiguration();
        let generalAPI = new AuthApi(configuration);
        //Act
        const refreshToken = generalAPI.refreshToken("random_refresh_token");
        //Assert
        await expect(refreshToken).rejects.toMatchObject({ response: { status: 500 } });
      });
    });

    describe("Functional", () => {
      it("When provided valid refresh token, Expect to return object of type Token containing access_token & refresh_token", async () => {
        //Arrange
        let configuration = Utility.getAdminConfiguration();
        let generalAPI = new AuthApi(configuration);
        let loginResponse = await generalAPI.authenticate({
          username: configuration.username,
          password: configuration.password
        });
        //Act
        let response = await generalAPI.refreshToken(loginResponse.data.refresh_token!);
        //Assert
        expect(response.data).toMatchObject(
          <Token>
          {
            access_token: expect.any(String),
            refresh_token: expect.any(String)
          }
        );
      });
    });
  });

  describe("Reset Credentials", () => {

    describe("Validation", () => {

      it("When resetting the password with unauthenticated request, expect to return unauthenticated request", async () => {
        //Arrange
        let authApi = new AuthApi({ basePath: configuration.basePath });
        let username = seederData!.users?.poc.username!;
        //Act
        const request = authApi.resetCredentials(<ResetCredentialModel>{ username: username, password: 'Pa$s1word' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 401 } });
      });

      it("When resetting the password with not satisfying password policy, expect to return bad request", async () => {
        //Arrange
        let authApi = new AuthApi({ basePath: configuration.basePath });
        let username = seederData!.users?.poc.username!;
        //Act
        const request = authApi.resetCredentials(<ResetCredentialModel>{ username: username, password: 'Pa$s1word' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 401 } });
      });
    });

    describe("Functional", () => {
      it("When register user, expect to return registered user detail of type User", async () => {
        //Arrange
        await Utility.setAuthToken(pocUserConfiguration);
        let authApi = new AuthApi(pocUserConfiguration);
        let username = seederData!.users?.poc.username!;
        let password = "Pa$s1word";
        //Act
        const response = await authApi.resetCredentials(<ResetCredentialModel>{ username: username, password: password });
        //Assert
        expect(response.data).toBeTruthy();
      });
    });
  });

  describe("User Profile", () => {

    describe("Auth", () => {
      it("When no auth token provided, Expect to return un-authenticated request", async () => {
        //Arrange
        let userManagementApi = new AuthApi(userWithoutLogin);
        //Act
        const assignPermission = userManagementApi.getUserProfile(userWithoutLogin.username)

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 401 } });;
      });
    });

    describe("Functional", () => {
      it("As a POC, When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new AuthApi(pocUserConfiguration);
        //Act
        const response = await userManagementApi.getUserProfile(pocUserConfiguration.username);

        //Assert
        expect(response.status).toBe(200);
      });

      it("As a Default user, When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new AuthApi(defaultUser);
        //Act
        const response = await userManagementApi.getUserProfile(defaultUser.username);

        //Assert
        expect(response.status).toBe(200);
      });
    });
  });
});



