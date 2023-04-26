import { Utility } from "../utils";
import { AuthApi, Register, RegisterResponse, Roles, User, UserManagementApi } from "tdei-management-client";
import { faker } from '@faker-js/faker';

describe("User Management service", () => {
  let configuration = Utility.getConfiguration();
  let configurationWithoutAuthHeader = Utility.getConfiguration();

  beforeAll(async () => {
    let generalAPI = new AuthApi(configuration);
    const loginResponse = await generalAPI.authenticate({
      username: configuration.username,
      password: configuration.password
    });
    configuration.baseOptions = {
      headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
    };
  });

  describe("Get Roles", () => {
    it("When no api token provided, expect to return HTTP status 401", async () => {
      //Arrange
      let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
      //Act
      const getRoles = async () => { await userManagementApi.roles(); }
      //Assert
      expect(getRoles()).rejects.toMatchObject({ response: { status: 401 } });;
    });

    it("When valid api token provided, expect to return HTTP status 200 with one or more tdei system roles", async () => {
      //Arrange
      let userManagementApi = new UserManagementApi(configuration);
      //Act
      const rolesResponse = await userManagementApi.roles();
      //Assert
      expect(rolesResponse.status).toBe(200);
      expect(rolesResponse.data.data?.length).toBeGreaterThan(0);
    });

    it("When valid api token provided, expect return response to be of type Array of Role object", async () => {
      //Arrange
      let userManagementApi = new UserManagementApi(configuration);
      //Act
      const rolesResponse = await userManagementApi.roles();
      //Assert
      expect(Array.isArray(rolesResponse.data.data)).toBe(true);
      expect(rolesResponse.data.data![0]).toMatchObject(<Roles>{ description: expect.any(String), name: expect.any(String) });
    });
  });

  describe("Register User", () => {
    it("When no information provided, expect to return HTTP status 400", async () => {
      //Arrange
      let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
      //Act
      const request = async () => { await userManagementApi.registerUser(<Register>{}); }
      //Assert
      expect(request()).rejects.toMatchObject({ response: { status: 400 } });
    });

    describe("Email check", () => {
      it("When email not provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ password: 'Tester01*' }); }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When invalid email provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ email: 'test_user', password: 'Tester01*' }); }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });
    });

    describe("Password check", () => {
      it("When password not provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ email: faker.internet.email() }); }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When invalid password provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ email: faker.internet.email(), password: 'Tester' }); }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });
    });

    it("When register user, expect to return registered user detail of type User", async () => {
      //Arrange
      let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
      //Act
      const response = await userManagementApi.registerUser(<Register>{
        email: faker.internet.email(),
        password: "Tester01*",
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phone: faker.phone.number()
      });
      //Assert
      expect(response.data.data).toMatchObject(<User>{
        email: expect.any(String),
        firstName: expect.any(String),
        id: expect.any(String),
        lastName: expect.any(String),
        phone: expect.any(String)
      });
    });
  });
});
