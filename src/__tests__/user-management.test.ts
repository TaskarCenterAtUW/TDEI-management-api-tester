import { TDEIROLES, Utility } from "../utils";
import { ProjectGroupRoles, Register, RoleDetails, Roles, User, UserManagementApi } from "tdei-management-client";
import { faker } from '@faker-js/faker';
import seed, { SeedDetails } from "../data.seed";
import { TdeiObjectFaker } from "../tdei-object-faker";
import { jwtDecode } from "jwt-decode";

describe("User Management service", () => {
  let adminConfiguration = Utility.getAdminConfiguration();
  let pocUserConfiguration = Utility.getPocConfiguration();
  let configurationWithoutAuthHeader = Utility.getAdminConfiguration();
  let defaultUser = Utility.getDefaultUserConfiguration();
  let apikeyUser = Utility.getApiKeyConfiguration();
  let seederData: SeedDetails | undefined = undefined;
  beforeAll(async () => {
    seederData = await seed.generate();
    await Utility.setAuthToken(adminConfiguration);
    await Utility.setAuthToken(pocUserConfiguration);
    await Utility.setAuthToken(defaultUser);
  }, 50000);

  describe("Get Roles", () => {
    describe("Auth", () => {
      it("When no api token provided, expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const getRoles = userManagementApi.roles();
        //Assert
        await expect(getRoles).rejects.toMatchObject({ response: { status: 403 } });
      });

      it("As a API key user, When requested, expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(apikeyUser);
        //Act
        const getRoles = userManagementApi.roles();
        //Assert
        await expect(getRoles).rejects.toMatchObject({ response: { status: 403 } });
      });

      it("As a POC user, When requested, expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const getRoles = userManagementApi.roles();
        //Assert
        expect((await getRoles).status).toBe(200);
      });

      it("As a Default user, When requested, expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(defaultUser);
        //Act
        const getRoles = userManagementApi.roles();
        //Assert
        await expect(getRoles).rejects.toMatchObject({ response: { status: 403 } });
      });
    });

    describe("Functional", () => {
      it("As an Admin, When requested, expect to return HTTP status 200 with one or more tdei system roles", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(adminConfiguration);
        //Act
        const rolesResponse = await userManagementApi.roles();
        //Assert
        expect(rolesResponse.status).toBe(200);
        expect(rolesResponse.data.data?.length).toBeGreaterThan(0);
      });

      it("As an POC, When requested, expect return response to be of type Array of Role object", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const rolesResponse = await userManagementApi.roles();
        //Assert
        expect(Array.isArray(rolesResponse.data.data)).toBe(true);
        rolesResponse.data.data?.forEach(role => {
          expect(role).toMatchObject(<Roles>{
            description: expect.any(String),
            name: expect.any(String)
          })
        })
      });
    });
  });

  describe("Register User", () => {

    describe("Validation", () => {
      it("When email not provided, expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ password: 'Pa$s1word' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When password not provided, expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ email: faker.internet.email() });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When no information provided, expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{});
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });
      it("When invalid email provided, expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ email: 'test_user', password: 'Pa$s1word' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When required first name is missing, expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const request = userManagementApi.registerUser(<Register>{ email: 'test_user@test.com', password: 'Pa$s1word' });
        //Assert
        await expect(request).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When invalid password provided not satisfying password policy, expect to return bad request", async () => {
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
      it("When no auth token provided, Expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As a API key user, When no auth token provided, Expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(apikeyUser);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As a Default user, When no auth token provided, Expect to return forbidden error", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(defaultUser);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });
    });
    describe("Validation", () => {
      it("As a POC, When invalid username provided, Expect to return HTTP status 404", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: faker.internet.email() //not registered email
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 404 } });;
      });

      it("As a POC, When managing own account permission, Expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const assignPermission = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: pocUserConfiguration.username //logged in user account
          })
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 400 } });;
      });
    });

    describe("Functional", () => {
      it("As a Admin, When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(adminConfiguration);
        //Act
        const response = await userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.POC, TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          });

        //Assert
        expect(response.status).toBe(200);
        expect(response.data.data).toBe("Successful!");
      });
    });
  });

  describe("User Project Group Roles", () => {

    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const projectGroupRoles = userManagementApi.projectGroupRoles(seederData?.users?.poc.username!);
        //Assert
        await expect(projectGroupRoles).rejects.toMatchObject({ response: { status: 401 } });;
      });
    });

    describe("Functional", () => {
      it("As a POC, When fetching logged in user project group roles, Expect to return user project group roles of type ProjectGroupRoles", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        let authToken = pocUserConfiguration.baseOptions.headers.Authorization.split(' ')[1];
        var decoded: any = authToken != null ? jwtDecode(authToken) : undefined;

        //Act
        const response = await userManagementApi.projectGroupRoles(decoded.sub);
        //Assert
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data![0]).toMatchObject(<ProjectGroupRoles>{
          tdei_project_group_id: expect.any(String),
          project_group_name: expect.any(String),
          roles: expect.any(Array<string>)
        });
      });

      it("As a Default user, When fetching logged in user project group roles, Expect to return user project group roles of type ProjectGroupRoles", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(defaultUser);
        let authToken = defaultUser.baseOptions.headers.Authorization.split(' ')[1];
        var decoded: any = authToken != null ? jwtDecode(authToken) : undefined;

        //Act
        const response = await userManagementApi.projectGroupRoles(decoded.sub);
        //Assert
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data![0]).toMatchObject(<ProjectGroupRoles>{
          tdei_project_group_id: expect.any(String),
          project_group_name: expect.any(String),
          roles: expect.any(Array<string>)
        });
      });
    });
  });

  describe("Revoke Permission", () => {

    describe("Auth", () => {
      it("When no auth token provided, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As an API key user, When requested, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(apikeyUser);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As a Default user, When requested, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.poc.username
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });
    });
    describe("Validation", () => {
      it("As a POC, When invalid username provided, Expect to return HTTP status 404", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: faker.internet.email() //not registered email
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 404 } });;
      });

      it("As a POC, When managing own account permission, Expect to return bad request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const assignPermission = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: pocUserConfiguration.username //logged in user account
          })

        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 400 } });;
      });
    });

    describe("Functional", () => {
      it("As a POC, When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const response = await userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.MEMBER],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.users?.default_user.username
          });

        //Assert
        expect(response.status).toBe(200);
        expect(response.data.data).toBe("Successful!");
      });
    });
  });

  describe("Download users csv", () => {

    describe("Auth", () => {
      it("When no auth token provided, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.downloadUsers();
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As an API key user, When requested, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(apikeyUser);
        //Act
        const assignPermission = userManagementApi.downloadUsers();
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As a Default user, When requested, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithoutAuthHeader);
        //Act
        const assignPermission = userManagementApi.downloadUsers();
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });

      it("As a POC, When requested, Expect to return forbidden request", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(pocUserConfiguration);
        //Act
        const assignPermission = userManagementApi.downloadUsers();
        //Assert
        await expect(assignPermission).rejects.toMatchObject({ response: { status: 403 } });;
      });
    });

    describe("Functional", () => {
      it("As an Admin, When requested, Expect to stream user csv file", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(adminConfiguration);
        //Act
        const response = await userManagementApi.downloadUsers();
        //Assert
        expect(response.status).toBe(200);
      });
    });
  });
});

