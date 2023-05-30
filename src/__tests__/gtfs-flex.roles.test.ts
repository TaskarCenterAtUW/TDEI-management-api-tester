import { Utility } from '../utils';
import {
    GTFSFlexServiceApi, Polygon, Service,
} from 'tdei-management-client';
import seed, { SeedDetails } from '../data.seed';
import { TdeiObjectFaker } from '../tdei-object-faker';

jest.setTimeout(10000); 

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
            it('When creating new service, Expect to return HTTP Status 403', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceRequest = gtfsFlexApi.createService(TdeiObjectFaker.getService(<string>seederData?.organization?.tdei_org_id));
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        });
    });

    describe('Update Service', () => {

        describe('Functional', () => {
            it('When updating new service, Expect to return HTTP Status 403', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                let payload = seederData?.updateServiceObject!;
                //Act
                const serviceRequest = gtfsFlexApi.updateService(payload, <string>seederData?.organization?.tdei_org_id);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        });
    });

    describe('Delete Service', () => {
        describe('Functional', () => {
            it('When deleting service id, Expect to return HTTP Status 403', async () => {
                //Arrange
                const gtfsFlexApi = new GTFSFlexServiceApi(configurationWithAuthHeader);
                //Act
                const serviceRequest = gtfsFlexApi.deleteService(seederData?.organization?.tdei_org_id!, <string>seederData?.service?.tdei_service_id!, true);
                //Assert
                await expect(serviceRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        })
    });

    describe('Get Services', () => {
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
                    expect(service).toMatchObject(<Service>{
                        tdei_org_id: expect.any(String),
                        tdei_service_id: expect.any(String),
                        service_name: expect.any(String),
                        polygon: expect.anything() as null | Polygon
                    })
                })
            });
        })
    })
});

