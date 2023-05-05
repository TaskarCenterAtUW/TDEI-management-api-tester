import { TDEIROLES, Utility } from "../utils";
import { OrgRoles, Register, RoleDetails, Roles, User, UserManagementApi } from "tdei-management-client";
import { faker } from '@faker-js/faker';
import seed, { SeedDetails } from "../data.seed";
import { TdeiObjectFaker } from "../tdei-object-faker";

describe("User Management service", () => {
  let configurationWithAuthHeader = Utility.getConfiguration();
  let configurationWithoutAuthHeader = Utility.getConfiguration();
  let seederData: SeedDetails | undefined = undefined;
  beforeAll(async () => {
    seederData = await seed.generate();
    const loginResponse = await Utility.login(configurationWithAuthHeader.username!, configurationWithAuthHeader.password!);
    configurationWithAuthHeader.baseOptions = {
      headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
    };
  }, 50000);

  describe("Get Roles", () => {
    describe("Auth", () => {
      it("When no api token provided, expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const getRoles = userManagementApi.roles();
        //Assert
        await expect(getRoles).rejects.toMatchObject({ response: { status: 401 } });
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
        const request = userManagementApi.registerUser(<Register>{ password: 'Tester01*' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When password not provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ email: faker.internet.email() });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When no information provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{});
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When invalid email provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ email: 'test_user', password: 'Tester01*' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When invalid password provided, expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ email: faker.internet.email(), password: 'Tester' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
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

    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: seederData?.user?.email
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 401 } });;
      });
    });
    describe("Validation", () => {
      it("When invalid username provided, Expect to return HTTP status 404", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: faker.internet.email() //not registered email
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 404 } });;
      });

      it("When managing own account permission, Expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: configurationWithAuthHeader.username //logged in user account
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 400 } });;
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
            user_name: seederData?.user!.email
          });

        //Assert
        expect(response.status).toBe(200);
        expect(response.data.data).toBe("Successful!");
      });
    });
  });

  describe("User org Roles", () => {

    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const orgRoles = userManagementApi.orgRoles(seederData?.user?.email!);
        //Assert
        await expect(orgRoles).rejects.toMatchObject({ response: { status: 401 } });;
      });
    });

    describe("Functional", () => {
      it("When fetching logged in user org roles, Expect to return user org roles of type OrgRoles", async () => {
        //Arrange
        let configuration = Utility.getConfiguration();
        const loginResponse = await Utility.login(seederData?.user?.email!, "Tester01*");
        configuration.baseOptions = {
          headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
        };
        let userManagementApi = new UserManagementApi(configuration);
        //Act
        const response = await userManagementApi.orgRoles(seederData?.user?.id!);
        //Assert
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data![0]).toMatchObject(<OrgRoles>{
          tdei_org_id: expect.any(String),
          org_name: expect.any(String),
          roles: expect.any(Array<string>)
        });
      });
    });
  });

  describe("Revoke Permission", () => {

    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: seederData?.user?.email
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 401 } });;
      });
    });
    describe("Validation", () => {
      it("When invalid username provided, Expect to return HTTP status 404", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: faker.internet.email() //not registered email
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 404 } });;
      });

      it("When managing own account permission, Expect to return HTTP status 400", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: configurationWithAuthHeader.username //logged in user account
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 400 } });;
      });
    });

    describe("Functional", () => {
      it("When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const response = await userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_org_id: seederData?.organizationId,
            user_name: seederData?.user?.email
          });

        //Assert
        expect(response.status).toBe(200);
        expect(response.data.data).toBe("Successful!");
      });
    });
  });
});



