import { TDEIROLES, Utility } from "../utils";
import { AuthApi, Register, RoleDetails, Roles, User, UserManagementApi } from "tdei-management-client";
import { faker } from '@faker-js/faker';
import seed, { ISeedData } from "../data.seed";
import { TdeiObjectFaker } from "../tdei-object-faker";

describe("User Management service", () => {
  let configurationWithAuthHeader = Utility.getConfiguration();
  let configurationWithoutAuthHeader = Utility.getConfiguration();
  let seederData: ISeedData | undefined = undefined;
  beforeAll(async () => {
    seederData = await seed.generate();
    let generalAPI = new AuthApi(configurationWithAuthHeader);
    const loginResponse = await generalAPI.authenticate({
      username: configurationWithAuthHeader.username,
      password: configurationWithAuthHeader.password
    });
    configurationWithAuthHeader.baseOptions = {
      headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
    };
  });

  describe("Get Roles", () => {
    describe("Auth", () => {
      it("When no api token provided, expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const getRoles = async () => { await userManagementApi.roles(); }
        //Assert
        await expect(getRoles()).rejects.toMatchObject({ response: { status: 401 } });
      });
    });

    describe("Functional", () => {
      it("When valid api token provided, expect to return HTTP status 200 with one or more tdei system roles", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const rolesResponse = await userManagementApi.roles();
        //Assert
        expect(rolesResponse.status).toBe(200);
        expect(rolesResponse.data.data?.length).toBeGreaterThan(0);
      });

      it("When valid api token provided, expect return response to be of type Array of Role object", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const rolesResponse = await userManagementApi.roles();
        //Assert
        // expect(rolesResponse.data.data).toEqual(expect.arrayContaining(expect.objectContaining(
        //   <Roles>{
        //     description: expect.any(String),
        //     name: expect.any(String)
        //   }
        // )));
        expect(Array.isArray(rolesResponse.data.data)).toBe(true);
        expect(rolesResponse.data.data![0]).toMatchObject(<Roles>{
          description: expect.any(String),
          name: expect.any(String)
        });
      });
    });
  });

  describe("Register User", () => {

    describe("Validation", () => {
      it("When email not provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ password: 'Tester01*' }); }
        //Assert
        await expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When password not provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ email: faker.internet.email() }); }
        //Assert
        await expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When no information provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{}); }
        //Assert
        await expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When invalid email provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ email: 'test_user', password: 'Tester01*' }); }
        //Assert
        await expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When invalid password provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => { await userManagementApi.registerUser(<Register>{ email: faker.internet.email(), password: 'Tester' }); }
        //Assert
        await expect(request()).rejects.toMatchObject({ response: { status: 400 } });
      });
    });

    describe("Functional", () => {
      it("When register user, expect to return registered user detail of type User", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const response = await userManagementApi.registerUser(TdeiObjectFaker.getUser());
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

  describe("Assign Permission", () => {
    describe("Validation", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = async () => {
          await userManagementApi.permission(<RoleDetails>
            {
              roles: [TDEIROLES.FLEX_DATA_GENERATOR],
              tdei_org_id: seederData?.organizationId,
              user_name: seederData?.user.email
            })
        };

        //Assert
        await expect(assignPermission()).rejects.toMatchObject({ response: { status: 401 } });;
      });

      it("When invalid username provided, Expect to return HTTP status 404", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const assignPermission = async () => {
          await userManagementApi.permission(<RoleDetails>
            {
              roles: [TDEIROLES.FLEX_DATA_GENERATOR],
              tdei_org_id: seederData?.organizationId,
              user_name: faker.internet.email() //not registered email
            })
        };

        //Assert
        await expect(assignPermission()).rejects.toMatchObject({ response: { status: 404 } });;
      });

      it("When managing own account permission, Expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const assignPermission = async () => {
          await userManagementApi.permission(<RoleDetails>
            {
              roles: [TDEIROLES.FLEX_DATA_GENERATOR],
              tdei_org_id: seederData?.organizationId,
              user_name: configurationWithAuthHeader.username //logged in user account
            })
        };

        //Assert
        await expect(assignPermission()).rejects.toMatchObject({ response: { status: 400 } });;
      });
    });

    describe("Functional", () => {
      it("When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const response = await userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: seederData?.user.email
          });

        //Assert
        expect(response.data.data).toBe("Successful!");
      });
    });
  });
});
