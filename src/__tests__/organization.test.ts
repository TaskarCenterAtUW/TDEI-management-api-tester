import { Utility } from "../utils";
import { AuthApi, OrganizationApi, Organization, OrganizationList, Polygon, POC } from "tdei-management-client";
import seed, { SeedDetails } from "../data.seed";
import { TdeiObjectFaker } from "../tdei-object-faker";

describe("Organization service", () => {
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

  describe("Create Organization", () => {
    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => {
          await oraganizationApi.createOrganization(<Organization>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe("Functional", () => {
      it("When creating new oraganization, Expect to return newly created org id", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        const organizationResponse = await oraganizationApi.createOrganization(TdeiObjectFaker.getOrganization());
        //Assert
        expect(organizationResponse.status).toBe(200);
        expect(organizationResponse.data.data?.length).toBeGreaterThan(0);

      });

      it("When creating new oraganization with same name, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getOrganization();
        payload.org_name = <string>seederData?.organization?.org_name

        const oraganizationResponse = oraganizationApi.createOrganization(payload);
        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });

    describe("Validation", () => {
      it("When creating new oraganization with empty name, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getOrganization();
        payload.org_name = '';

        const oraganizationResponse = oraganizationApi.createOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When creating new oraganization with empty phone, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getOrganization();
        payload.phone = '';

        const oraganizationResponse = oraganizationApi.createOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When creating new oraganization with empty address, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getOrganization();
        payload.address = '';

        const oraganizationResponse = oraganizationApi.createOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it('When creating new organization with invalid polygon, Expect to return HTTP Status 400', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = TdeiObjectFaker.getOrganization();
        payload.polygon = TdeiObjectFaker.getInvalidPolygon();

        const oraganizationResponse = oraganizationApi.createOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });
  });

  describe("Update Organization", () => {
    describe("Auth", () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithoutAuthHeader);
        //Act
        const request = async () => {
          await oraganizationApi.updateOrganization(<Organization>{})
        }
        //Assert
        expect(request()).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe("Functional", () => {
      it("When updating new oraganization, Expect to return newly updated org id", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.organization!;
        const organizationResponse = await oraganizationApi.updateOrganization(payload);
        //Assert
        expect(organizationResponse.status).toBe(200);
      });
    });

    describe("Validation", () => {
      it("When updating new oraganization with empty name, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.organization!;
        payload.org_name = '';

        const oraganizationResponse = oraganizationApi.updateOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When updating new oraganization with empty phone, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.organization!;
        payload.phone = '';

        const oraganizationResponse = oraganizationApi.updateOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("When updating new oraganization with empty address, Expect to return HTTP Status 400", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.organization!;
        payload.address = '';

        const oraganizationResponse = oraganizationApi.updateOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });

      it('When updating new organization with invalid polygon, Expect to return HTTP Status 400', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);
        //Act
        let payload = seederData?.organization!;
        payload.polygon = TdeiObjectFaker.getInvalidPolygon();

        const oraganizationResponse = oraganizationApi.updateOrganization(payload);

        //Assert
        await expect(oraganizationResponse).rejects.toMatchObject({ response: { status: 400 } });
      });
    });
  });

  describe('Get Organizations', () => {
    describe('Auth', () => {
      it("When no auth token provided, Expect to return HTTP status 401", async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithoutAuthHeader);
        //Act
        const organizationResponse = oraganizationApi.getOrganization();

        //Assert
        expect(organizationResponse).rejects.toMatchObject({ response: { status: 401 } })
      });
    });

    describe('Functional', () => {
      it('When searched without filters, Expect to return list of organizations of type OrganizationList', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getOrganization();

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(oraganizationResponse.data).toBeInstanceOf(Array);
        oraganizationResponse.data.forEach(org => {
          expect(org).toMatchObject(<OrganizationList>{

            tdei_org_id: expect.any(String),
            name: expect.any(String),
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.anything() as null | Polygon,
            poc: expect.anything() as POC[]
          })
        })
      });

      it('When searched with tdei_org_id filter, Expect to return list of organizations matching filter', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getOrganization(seederData?.organization?.tdei_org_id);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        oraganizationResponse.data.forEach(org => {
          expect(org).toMatchObject(<OrganizationList>{

            tdei_org_id: seederData?.organization?.tdei_org_id,
            name: expect.any(String),
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.anything() as null | Polygon,
            poc: expect.anything() as POC[]
          })
        })
      });

      it('When searched with organization name filter, Expect to return list of organizations matching fiter', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getOrganization(seederData?.organization?.tdei_org_id, seederData?.organization?.org_name);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        oraganizationResponse.data.forEach(org => {
          expect(org).toMatchObject(<OrganizationList>{

            tdei_org_id: seederData?.organization?.tdei_org_id,
            name: seederData?.organization?.org_name,
            phone: expect.any(String),
            url: expect.any(String),
            address: expect.any(String),
            polygon: expect.anything() as null | Polygon,
            poc: expect.anything() as POC[]
          })
        })
      });

      it('When searched with bbox name filter, Expect to return list of organizations matching fiter', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);

        //Act
        const oraganizationResponse = await oraganizationApi.getOrganization(undefined, undefined, [121, 122, 124, 145]);

        const data = oraganizationResponse.data;

        //Assert
        expect(oraganizationResponse.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
      });
    });
  });


  describe('Delete Organization', () => {
    describe('Auth', () => {
      it('When no auth token provided, Expect to return HTTP status 401', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithoutAuthHeader);

        //Act
        const organizationResponse = oraganizationApi.deleteOrganization(seederData?.organization?.tdei_org_id!, true);

        //Assert
        await expect(organizationResponse).rejects.toMatchObject({ response: { status: 401 } });
      });

      it('When deleting org id, Expect to return success', async () => {
        //Arrange
        let oraganizationApi = new OrganizationApi(configurationWithAuthHeader);

        //Act
        const organizationResponse = await oraganizationApi.deleteOrganization(seederData?.organization?.tdei_org_id!, true);

        //Assert
        expect(organizationResponse.status).toBe(200);
      });
    })
  });
});










