import { Utility } from "../utils";
import seed, { SeedDetails } from "../data.seed";
import { TdeiObjectFaker } from "../tdei-object-faker";
import { AuthApi, POC, Polygon, ProjectGroup, ProjectGroupApi, ProjectGroupList } from "tdei-management-client";

describe("Project Group service", () => {
  let adminConfiguration = Utility.getAdminConfiguration();
  let noAuthUser = Utility.getAdminConfiguration();
  let pocUserConfiguration = Utility.getPocConfiguration();
  let defaultUser = Utility.getDefaultUserConfiguration();
  let apikeyUser = Utility.getApiKeyConfiguration();
  let seederData: SeedDetails | undefined = undefined;
  beforeAll(async () => {
    seederData = await seed.generate();
    await Utility.setAuthToken(adminConfiguration);
    await Utility.setAuthToken(pocUserConfiguration);
    await Utility.setAuthToken(defaultUser);
  }, 50000);

  describe("Create Project Group", () => {
    describe("Auth", () => {
      it("When no auth token provided, Expect to return unauthorized error", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(noAuthUser);
        //Act
        const request = async () => {
          await oraganizationApi.createProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      });

      it("As API key user, When creating project group, Expect to return unauthorized error", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(apikeyUser);
        //Act
        const request = async () => {
          await oraganizationApi.createProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      });

      it("As a POC, When creating project group, Expect to return unauthorized error", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(pocUserConfiguration);
        //Act
        const request = async () => {
          await oraganizationApi.createProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      });

      it("As a Default user, When creating project group, Expect to return unauthorized error", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);
        //Act
        const request = async () => {
          await oraganizationApi.createProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      });
    });

    describe("Functional", () => {
      it("As an Admin, When creating new project group, Expect to return newly created project group id", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        const projectGroupResponse = await oraganizationApi.createProjectGroup(TdeiObjectFaker.getProjectGroup());
        //Assert
        expect(projectGroupResponse.status).toBe(200);
        expect(projectGroupResponse.data.data?.length).toBeGreaterThan(0);

      });
    });

    describe("Validation", () => {
      it("As an Admin, When creating new oraganization with empty name, Expect to return bad request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.project_group_name = '';

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("As an Admin, When creating new oraganization with empty address, Expect to return bad request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        let payload = TdeiObjectFaker.getProjectGroup();
        payload.address = '';

        const oraganizationResponse = oraganizationApi.createProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it('As an Admin, When creating new project group with invalid polygon, Expect to return bad request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
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
      it("When no auth token provided, Expect to return unauthorized request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(noAuthUser);
        //Act
        const request = async () => {
          await oraganizationApi.updateProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      }, 20000);

      it("As an POC user, When updating project group, Expect to return unauthorized request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(pocUserConfiguration);
        //Act
        const request = async () => {
          await oraganizationApi.updateProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      }, 20000);

      it("As an API key user, When updating project group, Expect to return unauthorized request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(apikeyUser);
        //Act
        const request = async () => {
          await oraganizationApi.updateProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      }, 20000);

      it("As an Default user, When updating project group, Expect to return unauthorized request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);
        //Act
        const request = async () => {
          await oraganizationApi.updateProjectGroup(<ProjectGroup>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 403 } })
      }, 20000);
    });

    describe("Functional", () => {
      it("As an Admin, When updating new oraganization, Expect to return newly updated project group id", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        let payload = seederData?.projectGroup!;
        const projectGroupResponse = await oraganizationApi.updateProjectGroup(payload);
        //Assert
        expect(projectGroupResponse.status).toBe(200);
      });
    });

    describe("Validation", () => {
      it("As an Admin, When updating new oraganization with empty name, Expect to return bad request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        let payload = Object.assign({}, seederData?.projectGroup!);
        payload.project_group_name = '';

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("As an Admin, When updating new oraganization with empty address, Expect to return bad request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        let payload = Object.assign({}, seederData?.projectGroup!);
        payload.address = '';

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it('As an Admin, When updating new project group with invalid polygon, Expect to return bad request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);
        //Act
        let payload = Object.assign({}, seederData?.projectGroup!);
        payload.polygon = TdeiObjectFaker.getInvalidPolygon();

        const oraganizationResponse = oraganizationApi.updateProjectGroup(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });
  });

  describe('Get Project Groups', () => {
    describe('Auth', () => {
      it("When no auth token provided, Expect to return unauthorized request", async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(noAuthUser);
        //Act
        const projectGroupResponse = oraganizationApi.getProjectGroup();

        //Assert
        expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe('Functional', () => {
      it('As a Default user, When searched without filters, Expect to return list of project groups of type ProjectGroupList', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);

        //Act
        const oraganizationResponse = await oraganizationApi.getProjectGroup();

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(oraganizationResponse.data).toBeInstanceOf(Array);
        oraganizationResponse.data.forEach(projectGroup => {
          expectPolygon(projectGroup.polygon);
          expect(projectGroup).toMatchObject(<ProjectGroupList>{
            tdei_project_group_id: expect.any(String),
            project_group_name: expect.any(String),
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.any(Object || null),
            poc: expect.anything() as POC[]
          })
        })
      });

      it('As a Default user, When searched with tdei_project_group_id filter, Expect to return list of project groups matching filter', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);

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
            project_group_name: expect.any(String),
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.any(Object || null),
            poc: expect.any(Array)
          })
        })
      });

      it('As a Default user, When searched with project group name filter, Expect to return list of project groups matching fiter', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);
        let tdei_project_group_id = seederData?.projectGroup?.tdei_project_group_id;
        let project_group_name = seederData?.projectGroup?.project_group_name;
        //Act
        const oraganizationResponse = await oraganizationApi.getProjectGroup(undefined, project_group_name);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        oraganizationResponse.data.forEach(projectGroup => {
          expectPolygon(projectGroup.polygon);
          expect(projectGroup).toMatchObject(<ProjectGroupList>{
            tdei_project_group_id: tdei_project_group_id,
            project_group_name: project_group_name,
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.any(Object || null),
            poc: expect.anything() as POC[]
          })
        })
      });
    });
  });

  describe('Delete Project Group', () => {
    describe('Auth', () => {
      it('When no auth token provided, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(noAuthUser);

        //Act
        const projectGroupResponse = oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });

      it('As a API key user, When requested, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(apikeyUser);

        //Act
        const projectGroupResponse = oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });

      it('As a Default user, When requested, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);

        //Act
        const projectGroupResponse = oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });

      it('As a POC, When requested, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(pocUserConfiguration);

        //Act
        const projectGroupResponse = oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });
    });

    describe('Functional', () => {
      it('As an Admin, When deleting project group id, Expect to return success', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);

        //Act
        const projectGroupResponse = await oraganizationApi.deleteProjectGroup(seederData?.projectGroup?.tdei_project_group_id!, true);

        //Assert
        expect(projectGroupResponse.status).toBe(200);
      });
    });
  });

  describe('Get Project Group Users', () => {
    describe('Auth', () => {
      it('When no auth token provided, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(noAuthUser);

        //Act
        const projectGroupResponse = oraganizationApi.getProjectGroupUsers(seederData?.projectGroup?.tdei_project_group_id!);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });

      it('As a API key user, When requested, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(apikeyUser);

        //Act
        const projectGroupResponse = oraganizationApi.getProjectGroupUsers(seederData?.projectGroup?.tdei_project_group_id!);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });

      it('As a Default user, When requested, Expect to return unauthorized request', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(defaultUser);

        //Act
        const projectGroupResponse = oraganizationApi.getProjectGroupUsers(seederData?.projectGroup?.tdei_project_group_id!);

        //Assert
        await expect(projectGroupResponse).rejects.toMatchObject({ response: { status: 403 } });
      });
    });

    describe('Functional', () => {
      it('As an Admin, When requested, Expect to return success', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(adminConfiguration);

        //Act
        const projectGroupResponse = await oraganizationApi.getProjectGroupUsers(seederData?.projectGroup?.tdei_project_group_id!);

        //Assert
        expect(projectGroupResponse.status).toBe(200);
      });

      it('As a POC, When requested, Expect to return success', async () => {
        //Arrange
        let oraganizationApi = new ProjectGroupApi(pocUserConfiguration);

        //Act
        const projectGroupResponse = await oraganizationApi.getProjectGroupUsers(seederData?.projectGroup?.tdei_project_group_id!);

        //Assert
        expect(projectGroupResponse.status).toBe(200);
      });
    });
  });
});

function expectPolygon(polygon: any) {
  if (polygon) {
    let aPolygon = polygon as Polygon;
    expect(typeof aPolygon.features).not.toBeNull();
    expect(aPolygon.features?.length).toBeGreaterThan(0);

  }
}








