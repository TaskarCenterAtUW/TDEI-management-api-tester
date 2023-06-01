import { Utility } from '../utils';
import {
    GTFSFlexServiceApi,
    AuthApi,
    Service,
    Polygon,
} from 'tdei-management-client';
import seed, { SeedDetails } from '../data.seed';
import { TdeiObjectFaker } from '../tdei-object-faker';

describe('GTFS Flex service', () => {
    let configurationWithAuthHeader = Utility.getConfiguration();
    let configurationWithoutAuthHeader = Utility.getConfiguration();
    let seederData: SeedDetails | undefined = undefined;
    beforeAll(async () => {
        seederData = await seed.generate();
        let generalAPI = new AuthApi(configurationWithAuthHeader)
        const loginResponse = await generalAPI.authenticate({
            username: configurationWithAuthHeader.username,
            password: configurationWithAuthHeader.password
        });
        configurationWithAuthHeader.baseOptions = {
            headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
        };
    }, 50000);

    describe('Create Service', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithoutAuthHeader);
                //Act
                const serviceResponse = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id));
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 401 } });
            });
        });

        describe('Functional', () => {
            it('When creating new service, Expect to return newly created service id', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceResponse = await gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id));
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(serviceResponse.data.data?.length).toBeGreaterThan(0);
            });

            it('When creating new service with same service_name, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id);
                payload.service_name = <string>seederData?.service?.service_name;
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });
        });

        describe('Validation', () => {
            it('When creating new service with empty service_name, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id);
                payload.service_name = '';
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new service with empty tdei_org_id, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id);
                payload.tdei_org_id = '';
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new service with invalid polygon, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id);
                payload.polygon = TdeiObjectFaker.getInvalidPolygon();
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });
        });
    });

    describe('Update Service', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithoutAuthHeader);
                let payload = seederData?.updateServiceObject!;
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload, <string>seederData?.organization?.tdei_org_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 401 } });
            });
        });

        describe('Functional', () => {
            it('When updating new service, Expect to return newly Updated service id', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject!;
                //Act
                const serviceResponse = await gtfsFlexApi.updateService(payload, <string>seederData?.organization?.tdei_org_id);
                //Assert
                expect(serviceResponse.status).toBe(200);
            });
        });

        describe('Validation', () => {
            it('When updating new service with empty service_name, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject!;
                payload.service_name = '';
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload, <string>seederData?.organization?.tdei_org_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When updating new service with empty tdei_org_id, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject!;
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload, <string>'');
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 404 } });
            });

            it('When updating new service with empty tdei_service_id, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject!;
                payload.tdei_service_id = '';
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload, <string>seederData?.organization?.tdei_org_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When updating new service with invalid polygon, Expect to return HTTP Status 400', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject!;
                payload.polygon = TdeiObjectFaker.getInvalidPolygon();
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload, <string>seederData?.organization?.tdei_org_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

        });
    });

    describe('Get Services', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithoutAuthHeader);
                //Act
                const serviceResponse = gtfsFlexApi.getService();
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 401 } });
            });
        })

        describe('Functional', () => {
            it('When searched without filters, Expect to return list of Services of type Service', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceResponse = await gtfsFlexApi.getService();
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(serviceResponse.data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                   expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_org_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with tdei_org_id filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceResponse = await gtfsFlexApi.getService(undefined, undefined, seederData?.organization?.tdei_org_id);
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
            
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_org_id: seederData?.organization?.tdei_org_id,
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with service name filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceResponse = await gtfsFlexApi.getService(undefined, <string>seederData?.service?.service_name);
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_org_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: seederData?.service?.service_name,
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with tdei_service_id filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                const tdei_service_id = <string>seederData?.service?.tdei_service_id;
                //Act
                const serviceResponse = await gtfsFlexApi.getService(tdei_service_id)
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_org_id: expect.any(String),
                        tdei_service_id: seederData?.service?.tdei_service_id,
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with bbox name filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                const tdei_service_id = <string>seederData?.service?.tdei_service_id;
                //Act
                const serviceResponse = await gtfsFlexApi.getService(undefined, undefined, undefined, [121, 154, 134, 198]);
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
            });
        })
    });

    describe('Delete Service', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithoutAuthHeader);
                //Act
                const serviceResponse = gtfsFlexApi.deleteService(seederData?.organization?.tdei_org_id!, <string>seederData?.service?.tdei_service_id!, true);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 401 } });
            });

            it('When deleting service id, Expect to return success', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceResponse = await gtfsFlexApi.deleteService(seederData?.organization?.tdei_org_id!, <string>seederData?.service?.tdei_service_id!, true);
                //Assert
                expect(serviceResponse.status).toBe(200);
            });
        })
    })
});

function expectPolygon(polygon: any) {
    if (polygon) {
        let aPolygon = polygon as Polygon;
        expect(typeof aPolygon.features).not.toBeNull();
        expect(aPolygon.features?.length).toBeGreaterThan(0);
  
    }
  }