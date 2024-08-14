import { Utility } from '../utils';
import {
    ServiceApi, Polygon, Service,
} from 'tdei-management-client';
import seed, { SeedDetails } from '../data.seed';
import { TdeiObjectFaker } from '../tdei-object-faker';

describe('GTFS Flex service', () => {
    let configurationWithAuthHeader = Utility.getConfiguration();
    let seederData: SeedDetails | undefined = undefined;

    beforeAll(async () => {
        seederData = await seed.generate();
        const loginResponse = await Utility.login(seederData.producer_user?.email!, "Tester01*");
        configurationWithAuthHeader.baseOptions = {
            headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
        };
    }, 50000);

    describe('Create Service', () => {
        describe('Functional', () => {
            it('As a POC, When creating new service, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(configurationWithAuthHeader);
                //Act
                const serviceRequest = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.projectGroup?.tdei_project_group_id, 'flex'));
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        });
    });

    describe('Update Service', () => {

        describe('Functional', () => {
            it('As a POC, When updating new service, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject('flex');
                //Act
                const serviceRequest = gtfsFlexApi.updateService(payload!, <string>seederData?.projectGroup?.tdei_project_group_id);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        });
    });

    describe('Delete Service', () => {
        describe('Functional', () => {
            it('As a POC, When deleting service id, Expect to return forbidden request', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(configurationWithAuthHeader);
                //Act
                const serviceRequest = gtfsFlexApi.deleteService(seederData?.projectGroup?.tdei_project_group_id!, <string>seederData?.getService('flex').tdei_service_id!, true);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        })
    });

    describe('Get Services', () => {
        describe('Functional', () => {
            it('As a POC, When searched without filters, Expect to return list of Services of type Service', async () => {
                //Arrange
                const gtfsFlexApi = new ServiceApi(configurationWithAuthHeader);
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