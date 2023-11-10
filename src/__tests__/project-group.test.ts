import { Utility } from "../utils";
import { AuthApi, ProjectGroupApi, ProjectGroup, ProjectGroupList, Polygon, POC } from "tdei-management-client";
import seed, { SeedDetails } from "../data.seed";
import { TdeiObjectFaker } from "../tdei-object-faker";

describe("Project Group service", () => {
  let configurationWithAuthHeader = Utility.getConfiguration();
  let configurationWithoutAuthHeader = Utility.getConfiguration();
  let seederData: SeedDetails | undefined = undefined;
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
  }, 50000);

  describe("Create Project Group", () => {
    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => {
          await oraganizationApi.createProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe("Functional", () => {
      it("When creating new project group, Expect to return newly created project group id", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        const projectGroupResponse = await oraganizationApi.createProjectGroup(TdeiObjectFaker.getProjectGroup());
        //Assert
        expect(projectGroupResponse.status).toBe(200);
        expect(projectGroupResponse.data.data?.length).toBeGreaterThan(0);

      });

      it("When creating new oraganization with same name, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.project_group_name = <string>seederData?.projectGroup?.project_group_name

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);
        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });

    describe("Validation", () => {
      it("When creating new oraganization with empty name, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.project_group_name = '';

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When creating new oraganization with empty phone, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.phone = '';

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When creating new oraganization with empty address, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.address = '';

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it('When creating new project group with invalid polygon, Expect to return HTTP Status 400', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.polygon = TdeiObjectFaker.getInvalidPolygon();

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });
  });

  describe("Update Project Group", () => {
    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => {
          await oraganizationApi.updateProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe("Functional", () => {
      it("When updating new oraganization, Expect to return newly updated project group id", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.projectGroup!;
        const projectGroupResponse = await oraganizationApi.updateProjectGroup(payload);
        //Assert
        expect(projectGroupResponse.status).toBe(200);
      });
    });

    describe("Validation", () => {
      it("When updating new oraganization with empty name, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.projectGroup!;
        payload.project_group_name = '';

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When updating new oraganization with empty phone, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.projectGroup!;
        payload.phone = '';

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When updating new oraganization with empty address, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.projectGroup!;
        payload.address = '';

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it('When updating newproject groupwith invalid polygon, Expect to return HTTP Status 400', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.projectGroup!;
        payload.polygon = TdeiObjectFaker.getInvalidPolygon();

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });
  });

  describe('Get Project Groups', () => {
    describe('Auth', () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithoutAuthHeader);
        //Act
        const projectGroupResponse = oraganizationApi.getProjectGroup();

        //Assert
        expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe('Functional', () => {
      it('When searched without filters, Expect to return list of project groups of type ProjectGroupList', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getProjectGroup();

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(oraganizationResponse.data).toBeInstanceOf(Array);
        oraganizationResponse.data.forEach(projectGroup => {
          expectPolygon(projectGroup.polygon);
          expect(projectGroup).toMatchObject(<ProjectGroupList>{
            tdei_project_group_id: expect.any(String),
            name: expect.any(String),
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.any(Object || null),
            poc: expect.anything() as POC[]
          })
        })
      });

      it('When searched with tdei_project_group_id filter, Expect to return list of project groups matching filter', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getProjectGroup(seederData?.projectGroup?.tdei_project_group_id);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        oraganizationResponse.data.forEach(projectGroup => {
          expectPolygon(projectGroup.polygon);
          expect(projectGroup).toMatchObject(<ProjectGroupList>{
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            name: expect.any(String),
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.any(Object || null),
            poc: expect.anything() as POC[]
          })
        })
      });

      it('When searched with project group name filter, Expect to return list of project groups matching fiter', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getProjectGroup(seederData?.projectGroup?.tdei_project_group_id, seederData?.projectGroup?.project_group_name);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        oraganizationResponse.data.forEach(projectGroup => {
          expectPolygon(projectGroup.polygon);
          expect(projectGroup).toMatchObject(<ProjectGroupList>{
            tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
            name: seederData?.projectGroup?.project_group_name,
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.any(Object || null),
            poc: expect.anything() as POC[]
          })
        })
      });

      it('When searched with bbox name filter, Expect to return list of project groups matching fiter', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getProjectGroup(undefined, undefined, [121, 122, 124, 145]);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
      });
    });
  });


  describe('Delete Project Group', () => {
    describe('Auth', () => {
      it('When no auth token provided, Expect to return HTTP status 401', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithoutAuthHeader);

        //Act
        const projectGroupResponse = oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 401 } });
      });

      it('When deleting project group id, Expect to return success', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(configurationWithAuthHeader);

        //Act
        const projectGroupResponse = await oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        expect(projectGroupResponse.status).toBe(200);
      });
    })
  });
});

function expectPolygon(polygon: any) {
  if (polygon) {
    let aPolygon = polygon as Polygon;
    expect(typeof aPolygon.features).not.toBeNull();
    expect(aPolygon.features?.length).toBeGreaterThan(0);

  }
}








