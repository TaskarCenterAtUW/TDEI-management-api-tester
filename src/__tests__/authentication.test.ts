import { Utility } from "../utils";
import { AuthApi, ResetCredentialModel, Token } from "tdei-management-client";
import { faker } from '@faker-js/faker';
import { TdeiObjectFaker } from "../tdei-object-faker";
import seed, { SeedDetails } from "../data.seed";

describe("Authentication service", () => {
  let seederData: SeedDetails | undefined = undefined;
  let pocConfigurationWithAuthHeader = Utility.getConfiguration();

  beforeAll(async () => {
    seederData = await seed.generate();
    const loginResponse = await Utility.login(seederData.producer_user?.email!, "Tester01*");
    pocConfigurationWithAuthHeader.baseOptions = {
      headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
    };
  }, 50000);

  describe("Authenticate", () => {
    describe("Validation", () => {
      it("When invalid user credentials provided, expect to return unauthorized request", async () => {
        //Arrange
        let configuration = Utility.getConfiguration();
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
        let configuration = Utility.getConfiguration();
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
        let configuration = Utility.getConfiguration();
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
        let configuration = Utility.getConfiguration();
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
        let authApi = new AuthApi(pocConfigurationWithAuthHeader);
        let username = seederData!.producer_user?.email!;
        //Act
        const request = authApi.resetCredentials(<ResetCredentialModel>{ username: username, password: 'Test' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When resetting the password with not satisfying password policy, expect to return bad request", async () => {
        //Arrange
        let authApi = new AuthApi(pocConfigurationWithAuthHeader);
        let username = seederData!.producer_user?.email!;
        //Act
        const request = authApi.resetCredentials(<ResetCredentialModel>{ username: username, password: 'Test' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });
    });

    describe("Functional", () => {
      it("When register user, expect to return registered user detail of type User", async () => {
        //Arrange
        let authApi = new AuthApi(pocConfigurationWithAuthHeader);
        let username = seederData!.producer_user?.email!;
        let password = "Tester01*";
        //Act
        const response = await authApi.resetCredentials(<ResetCredentialModel>{ username: username, password: password });
        //Assert
        expect(response.data).toBeTruthy();
      });
    });
  });
});



