import { Utility } from "../utils";
import { AuthApi, Token } from "tdei-management-client";
import { faker } from '@faker-js/faker';

describe("Authentication service", () => {
  beforeAll(async () => {
  }, 50000);

  describe("Authenticate", () => {
    describe("Validation", () => {
      it("When invalid user credentials provided, expect to return HTTP status 401", async () => {
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
      it("When provided invalid refresh token, expect to return HTTP status 500", async () => {
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

});



