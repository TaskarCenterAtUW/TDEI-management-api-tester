import { TDEIROLES, Utility } from "../utils";
import { RoleDetails, UserManagementApi } from "tdei-management-client";
import seed, { SeedDetails } from "../data.seed";

describe("User Management Service Role Testing - Data Generator User", () => {
  let configurationWithAuthHeader = Utility.getConfiguration();
  let seederData: SeedDetails | undefined = undefined;
  beforeAll(async () => {
    seederData = await seed.generate();
    const loginResponse = await Utility.login(seederData.producer_user?.email!, "Tester01*");
    configurationWithAuthHeader.baseOptions = {
      headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
    };
  }, 50000);

  describe("Get Roles", () => {
    describe("Functional", () => {
      it("When valid api token provided, expect to return HTTP status 403", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const rolesRequest = userManagementApi.roles();
        //Assert
        await expect(rolesRequest).rejects.toMatchObject({ response: { status: 403 } });
      });
    });
  });

  describe("Assign Permission", () => {
    describe("Functional", () => {
      it("When assigning valid user permission, Expect to return HTTP status 403", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const permissionRequest = userManagementApi.permission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.producer_user!.email
          });

        //Assert
        await expect(permissionRequest).rejects.toMatchObject({ response: { status: 403 } });
      });
    });
  });

  describe("Revoke Permission", () => {

    describe("Functional", () => {
      it("When assigning valid user permission, Expect to return true", async () => {
        //Arrange
        let userManagementApi = new UserManagementApi(configurationWithAuthHeader);
        //Act
        const permissionRequest = userManagementApi.revokePermission(<RoleDetails>
          {
            roles: [TDEIROLES.FLEX_DATA_GENERATOR],
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            user_name: seederData?.producer_user?.email
          });

        //Assert
        await expect(permissionRequest).rejects.toMatchObject({ response: { status: 403 } });
      });
    });
  });
});



