import {Utility} from '../utils';
import {
    GTFSPathwaysStationApi,
    AuthApi,
} from 'tdei-management-client';
import seed, {ISeedData} from '../data.seed';
import {faker} from "@faker-js/faker";
import {TdeiObjectFaker} from '../tdei-object-faker';

describe('GTFS Pathways service', () => {
    let configurationWithAuthHeader = Utility.getConfiguration();
    let configurationWithoutAuthHeader = Utility.getConfiguration();
    let seederData: ISeedData | undefined = undefined;
    beforeAll(async () => {
        seederData = await seed.generate();
        let generalAPI = new AuthApi(configurationWithAuthHeader)
        const loginResponse = await generalAPI.authenticate({
            username: configurationWithAuthHeader.username,
            password: configurationWithAuthHeader.password
        })
        configurationWithAuthHeader.baseOptions = {
            headers: {...Utility.addAuthZHeader(loginResponse.data.access_token)}
        };
    }, 50000);

    describe('Create Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);
                const stationResponse = async () => {
                    await gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organizationId))
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 401}});
            });
        });

        describe('Functional', () => {
            it('When creating new station, Expect to return newly created station id', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const stationResponse = await gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organizationId));
                expect(stationResponse.status).toBe(200);
                expect(stationResponse.data.data?.length).toBeGreaterThan(0);
            });

            it('When creating new station with same station_name, Expect to return HTTP Status 400', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let stationPayload = TdeiObjectFaker.getStation(seederData?.organizationId)
                const firstStationResponse = await gtfsPathwaysApi.createStation(stationPayload);
                expect(firstStationResponse.status).toBe(200);
                expect(firstStationResponse.data.data?.length).toBeGreaterThan(0);
                const secondStationResponse = async () => {
                    await gtfsPathwaysApi.createStation(stationPayload);
                }
                await expect(secondStationResponse()).rejects.toMatchObject({response: {status: 400}});
            });
        });

        describe('Validation', () => {
            it('When creating new station with empty station_name, Expect to return HTTP Status 400', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let stationPayload = TdeiObjectFaker.getStation(seederData?.organizationId)
                stationPayload.station_name = ''
                const stationResponse = async () => {
                    await gtfsPathwaysApi.createStation(stationPayload);
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 400}});
            });

            it('When creating new station with empty tdei_org_id, Expect to return HTTP Status 400', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let stationPayload = TdeiObjectFaker.getStation(seederData?.organizationId)
                stationPayload.tdei_org_id = ''
                const stationResponse = async () => {
                    await gtfsPathwaysApi.createStation(stationPayload);
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 400}});
            });

            it.todo('When creating new station with invalid polygon, Expect to return HTTP Status 400');
        });
    });

    describe('Update Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                let validGtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const validStationResponse = await validGtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organizationId));

                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);
                const stationResponse = async () => {
                    let payload = TdeiObjectFaker.getUpdateStation(validStationResponse?.data?.data)
                    await gtfsPathwaysApi.updateStation(payload, <string>seederData?.organizationId)
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 401}});
            });
        });

        describe('Functional', () => {
            it('When updating new station, Expect to return newly Updated station id', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const validStationResponse = await gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organizationId));
                let payload = TdeiObjectFaker.getUpdateStation(validStationResponse?.data?.data)
                const stationResponse = await gtfsPathwaysApi.updateStation(payload, <string>seederData?.organizationId);
                expect(stationResponse.status).toBe(200);
            });
        });

        describe('Validation', () => {
            it('When updating new station with empty station_name, Expect to return HTTP Status 400', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const validStationResponse = await gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organizationId));
                const stationResponse = async () => {
                    let payload = TdeiObjectFaker.getUpdateStation(validStationResponse?.data?.data)
                    payload.station_name = ''
                    await gtfsPathwaysApi.updateStation(payload, <string>seederData?.organizationId);
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 400}});
            });

            it('When updating new station with empty tdei_org_id, Expect to return HTTP Status 400', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const validStationResponse = await gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organizationId));
                const stationResponse = async () => {
                    let payload = TdeiObjectFaker.getUpdateStation(validStationResponse?.data?.data)
                    payload.station_name = ''
                    await gtfsPathwaysApi.updateStation(payload, <string>'');
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 404}});
            });

            it('When updating new station with empty tdei_station_id, Expect to return HTTP Status 400', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const stationResponse = async () => {
                    let payload = TdeiObjectFaker.getUpdateStation('')
                    await gtfsPathwaysApi.updateStation(payload, <string>'');
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 404}});
            });

            it.todo('When updating new station with invalid polygon, Expect to return HTTP Status 400');
        });
    });

    describe('Get Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);
                const stationResponse = async () => {
                    await gtfsPathwaysApi.getStation()
                }
                await expect(stationResponse()).rejects.toMatchObject({response: {status: 401}});
            });
        })

        describe('Functional', () => {
            it('When searched without filters, Expect to return list of Stations of type Station', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const stationResponse = await gtfsPathwaysApi.getStation()
                expect(stationResponse.status).toBe(200);
                expect(stationResponse.data).toBeInstanceOf(Array);
            });

            it('When searched with tdei_org_id filter, Expect to return list of Stations matching filter', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const stationResponse = await gtfsPathwaysApi.getStation(undefined, undefined, seederData?.organizationId)
                const data = stationResponse.data
                expect(stationResponse.status).toBe(200);
                expect(Array.isArray(data)).toBe(true);
                expect(data).toBeInstanceOf(Array);
                expect(data[0].tdei_org_id).toEqual(seederData?.organizationId);
            });

            it('When searched with station name filter, Expect to return list of Stations matching filter', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getStation(seederData?.organizationId)
                const station_name = faker.name.firstName() + '_Station'
                payload.station_name = station_name
                await gtfsPathwaysApi.createStation(payload);
                const stationResponse = await gtfsPathwaysApi.getStation(undefined, station_name)
                const data = stationResponse.data
                expect(stationResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                expect(data[0].station_name).toEqual(station_name);
            });

            it('When searched with tdei_station_id filter, Expect to return list of Stations matching filter', async () => {
                let gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const payload = TdeiObjectFaker.getStation(seederData?.organizationId)
                const resp = await gtfsPathwaysApi.createStation(payload);
                const tdei_station_id = resp.data.data
                const stationResponse = await gtfsPathwaysApi.getStation(tdei_station_id)
                const data = stationResponse.data
                expect(stationResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                expect(data[0].tdei_station_id).toEqual(tdei_station_id);
            });

            it('When searched with bbox name filter, Expect to return list of Stations matching filter', async () => {

            });
        })
    })

    describe('Delete Station', () => {
        describe('Auth', () => {
            it.todo('When no auth token provided, Expect to return HTTP status 401')

            it.todo('When deleting station id, Expect to return success')
        })
    })
});

