import { Utility } from '../utils';
import {
    ServiceApi, Polygon, Service,
} from 'tdei-management-client';
import seed, { SeedDetails } from '../data.seed';
import { TdeiObjectFaker } from '../tdei-object-faker';

describe('TDEI Service', () => {
    let adminConfiguration = Utility.getAdminConfiguration();
    let pocUserConfiguration = Utility.getPocConfiguration();
    let defaultUser = Utility.getDefaultUserConfiguration();
    let apikeyUser = Utility.getApiKeyConfiguration();
    let userWithoutLogin = Utility.getPocConfiguration();
    let seederData: SeedDetails | undefined = undefined;

    beforeAll(async () => {
        seederData = await seed.generate();
        await Utility.setAuthToken(adminConfiguration);
        await Utility.setAuthToken(pocUserConfiguration);
        await Utility.setAuthToken(defaultUser);
    }, 50000);

    describe('Create Service', () => {
        describe('Functional', () => {
            it('No Auth, When no auth token provided, Expect to return unauthorized request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(userWithoutLogin);
                //Act
                const serviceResponse = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex'));
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a Member, When creating new service, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(defaultUser);
                //Act
                const serviceRequest = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex'));
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a API Key user, When creating new service, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(apikeyUser);
                //Act
                const serviceRequest = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex'));
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a POC, When creating new service, Expect to create service successfully', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                //Act
                const serviceRequest = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex'));
                //Assert
                expect((await serviceRequest).status).toBe(200);
            });

            it('As an Admin, When creating new service, Expect to create service successfully', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceRequest = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex'));
                //Assert
                expect((await serviceRequest).status).toBe(200);
            });

            it('As a POC, When creating new service with same service_name, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex');
                payload.service_name = <string>seederData?.getService('flex').service_name;
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new service with empty service_name, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex');
                payload.service_name = '';
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new service with empty tdei_project_group_id, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex');
                payload.tdei_project_group_id = '';
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new service with invalid polygon, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex');
                payload.polygon = TdeiObjectFaker.getInvalidPolygon();
                //Act
                const serviceResponse = gtfsFlexApi.createService(payload);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });
        });
    });

    describe('Update Service', () => {

        describe('Functional', () => {
            it('When no auth token provided, Expect to return unauthorized request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(userWithoutLogin);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a Member, When updating any service, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(defaultUser);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceRequest = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a API key user, When updating any service, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(apikeyUser);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceRequest = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a POC, When updating any service, Expect to update service successfully', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceRequest = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                expect((await serviceRequest).status).toBe(200);
            });

            it('As an Admin, When updating any service, Expect to update service successfully', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceRequest = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                expect((await serviceRequest).status).toBe(200);
            });

            it('When updating new service with empty service_name, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = seederData?.updateServiceObject('flex');
                payload!.service_name = '';
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When updating new service with empty tdei_project_group_id, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload!, <string>'');
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 404 } });
            });

            it('When updating new service with empty tdei_service_id, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = seederData?.updateServiceObject('flex');
                payload!.tdei_service_id = '';
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When updating new service with invalid polygon, Expect to return bad request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                let payload = seederData?.updateServiceObject('flex');
                payload!.polygon = TdeiObjectFaker.getInvalidPolygon();
                //Act
                const serviceResponse = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

        });
    });

    describe('Delete Service', () => {
        describe('Functional', () => {
            it('As a Member, When deleting service id, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(defaultUser);
                //Act
                const serviceRequest = gtfsFlexApi.deleteService(seederData?.projectGroup?.tdei_project_group_id!, <string>seederData?.getService('osw').tdei_service_id!, true);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a API Key user, When deleting service id, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(apikeyUser);
                //Act
                const serviceRequest = gtfsFlexApi.deleteService(seederData?.projectGroup?.tdei_project_group_id!, <string>seederData?.getService('flex').tdei_service_id!, true);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });

            it('As a POC, When deleting service id, Expect to delete service successfully', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(pocUserConfiguration);
                //Act
                const serviceRequest = gtfsFlexApi.deleteService(seederData?.projectGroup?.tdei_project_group_id!, <string>seederData?.getService('flex').tdei_service_id!, true);
                //Assert
                expect((await serviceRequest).status).toBe(200);
            });
            it('As an Admin, When deleting service id, Expect to delete service successfully', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceRequest = gtfsFlexApi.deleteService(seederData?.projectGroup?.tdei_project_group_id!, <string>seederData?.getService('flex').tdei_service_id!, true);
                //Assert
                expect((await serviceRequest).status).toBe(200);
            });
        })
    });

    describe('Get Services', () => {
        describe('Functional', () => {
            it('As a POC, When searched without filters, Expect to return list of Services of type Service', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceResponse = await gtfsFlexApi.getService();
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(serviceResponse.data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('As an Admin, When searched without filters, Expect to return list of Services of type Service', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceResponse = await gtfsFlexApi.getService();
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(serviceResponse.data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('As a API key user, When searched without filters, Expect to return list of Services of type Service', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceResponse = await gtfsFlexApi.getService();
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(serviceResponse.data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('As a Default user, When searched without filters, Expect to return list of Services of type Service', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceResponse = await gtfsFlexApi.getService();
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(serviceResponse.data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with tdei_project_group_id filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceResponse = await gtfsFlexApi.getService(undefined, undefined, undefined, seederData?.projectGroup?.tdei_project_group_id);
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);

                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: seederData?.projectGroup?.tdei_project_group_id,
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with service name filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                //Act
                const serviceResponse = await gtfsFlexApi.getService(undefined, <string>seederData?.getService('flex').service_name);
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: seederData?.getService('flex').service_name,
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with tdei_service_id filter, Expect to return list of Services matching filter', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(adminConfiguration);
                const tdei_service_id = <string>seederData?.getService('flex').tdei_service_id;
                //Act
                const serviceResponse = await gtfsFlexApi.getService(tdei_service_id)
                const data = serviceResponse.data;
                //Assert
                expect(serviceResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                serviceResponse.data.forEach(service => {
                    expectPolygon(service.polygon);
                    expect(service).toMatchObject(<Service>{
                        tdei_project_group_id: expect.any(String),
                        tdei_service_id: seederData?.getService('flex').tdei_service_id,
                        service_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
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