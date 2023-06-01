import { Utility } from '../utils';
import {
    GTFSPathwaysStationApi,
    AuthApi,
    Polygon,
    Station,
} from 'tdei-management-client';
import seed, { SeedDetails } from '../data.seed';
import { TdeiObjectFaker } from '../tdei-object-faker';

describe('GTFS Pathways service', () => {
    let configurationWithAuthHeader = Utility.getConfiguration();
    let configurationWithoutAuthHeader = Utility.getConfiguration();
    let seederData: SeedDetails | undefined = undefined;
    beforeAll(async () => {
        seederData = await seed.generate();
        let generalAPI = new AuthApi(configurationWithAuthHeader)
        const loginResponse = await generalAPI.authenticate({
            username: configurationWithAuthHeader.username,
            password: configurationWithAuthHeader.password
        })
        configurationWithAuthHeader.baseOptions = {
            headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
        };
    }, 50000);

    describe('Create Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);

                const stationResponse = gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id));

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 401 } });
            });
        });

        describe('Functional', () => {
            it('When creating new station, Expect to return newly created station id', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id));

                expect(stationResponse.status).toBe(200);
                expect(stationResponse.data.data?.length).toBeGreaterThan(0);
            });

            it('When creating new station with same station_name, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id);
                payload.station_name = <string>seederData?.station?.station_name;

                const stationResponse = gtfsPathwaysApi.createStation(payload);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });
        });

        describe('Validation', () => {
            it('When creating new station with empty station_name, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id);
                payload.station_name = '';

                const stationResponse = gtfsPathwaysApi.createStation(payload);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new station with empty tdei_org_id, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id);
                payload.tdei_org_id = '';

                const stationResponse = gtfsPathwaysApi.createStation(payload);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When creating new station with invalid polygon, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id);
                payload.polygon = TdeiObjectFaker.getInvalidPolygon();

                const stationResponse = gtfsPathwaysApi.createStation(payload);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });
        });
    });

    describe('Update Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);
                let payload = seederData?.updateStationObject!;

                const stationResponse = gtfsPathwaysApi.updateStation(payload, <string>seederData?.organization?.tdei_org_id)

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 401 } });
            });
        });

        describe('Functional', () => {
            it('When updating new station, Expect to return newly Updated station id', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = seederData?.updateStationObject!;

                const stationResponse = await gtfsPathwaysApi.updateStation(payload, <string>seederData?.organization?.tdei_org_id);

                expect(stationResponse.status).toBe(200);
            });
        });

        describe('Validation', () => {
            it('When updating new station with empty station_name, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = seederData?.updateStationObject!;
                payload.station_name = '';

                const stationResponse = gtfsPathwaysApi.updateStation(payload, <string>seederData?.organization?.tdei_org_id);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When updating new station with empty tdei_org_id, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = seederData?.updateStationObject!;

                const stationResponse = gtfsPathwaysApi.updateStation(payload, <string>'');

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 404 } });
            });

            it('When updating new station with empty tdei_station_id, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = seederData?.updateStationObject!;
                payload.station_name = '';

                const stationResponse = gtfsPathwaysApi.updateStation(payload, <string>seederData?.organization?.tdei_org_id);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

            it('When updating new station with invalid polygon, Expect to return HTTP Status 400', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = seederData?.updateStationObject!;
                payload.polygon = TdeiObjectFaker.getInvalidPolygon();

                const stationResponse = gtfsPathwaysApi.updateStation(payload, <string>seederData?.organization?.tdei_org_id);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 400 } });
            });

        });
    });

    describe('Get Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);

                const stationResponse = gtfsPathwaysApi.getStation();

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 401 } });
            });
        })

        describe('Functional', () => {
            it('When searched without filters, Expect to return list of Stations of type Station', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.getStation();

                expect(stationResponse.status).toBe(200);
                expect(stationResponse.data).toBeInstanceOf(Array);
                stationResponse.data.forEach(station => {
                    expectPolygon(station.polygon);
                    expect(station).toMatchObject(<Station>{
                        tdei_station_id: expect.any(String),
                        tdei_org_id: expect.any(String),
                        station_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with tdei_org_id filter, Expect to return list of Stations matching filter', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.getStation(undefined, undefined, seederData?.organization?.tdei_org_id);

                const data = stationResponse.data;

                expect(stationResponse.status).toBe(200);
                expect(Array.isArray(data)).toBe(true);
                expect(data).toBeInstanceOf(Array);
                stationResponse.data.forEach(station => {
                    expectPolygon(station.polygon);
                    expect(station).toMatchObject(<Station>{
                        tdei_station_id: expect.any(String),
                        tdei_org_id: seederData?.organization?.tdei_org_id,
                        station_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with station name filter, Expect to return list of Stations matching filter', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.getStation(undefined, <string>seederData?.station?.station_name);
                const data = stationResponse.data;

                expect(stationResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                stationResponse.data.forEach(station => {
                    expectPolygon(station.polygon);
                    expect(station).toMatchObject(<Station>{
                        tdei_station_id: expect.any(String),
                        tdei_org_id: expect.any(String),
                        station_name: seederData?.station?.station_name,
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with tdei_station_id filter, Expect to return list of Stations matching filter', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                const tdei_station_id = <string>seederData?.station?.tdei_station_id;

                const stationResponse = await gtfsPathwaysApi.getStation(tdei_station_id)
                const data = stationResponse.data;

                expect(stationResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
                stationResponse.data.forEach(station => {
                    expectPolygon(station.polygon);
                    expect(station).toMatchObject(<Station>{
                        tdei_station_id: seederData?.station?.tdei_station_id,
                        tdei_org_id: expect.any(String),
                        station_name: expect.any(String),
                        polygon: expect.any(Object || null)
                    })
                })
            });

            it('When searched with bbox name filter, Expect to return list of Stations matching filter', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.getStation(undefined, undefined, undefined, [123, 124, 154, 167]);
                const data = stationResponse.data;

                expect(stationResponse.status).toBe(200);
                expect(data).toBeInstanceOf(Array);
            });
        })
    })

    describe('Delete Station', () => {
        describe('Auth', () => {
            it('When no auth token provided, Expect to return HTTP status 401', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithoutAuthHeader);

                const stationResponse = gtfsPathwaysApi.setServiceStatus(seederData?.organization?.tdei_org_id!, <string>seederData?.station?.tdei_station_id!, true);

                await expect(stationResponse).rejects.toMatchObject({ response: { status: 401 } });
            });

            it('When deleting station id, Expect to return success', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.setServiceStatus(seederData?.organization?.tdei_org_id!, <string>seederData?.station?.tdei_station_id!, true);

                expect(stationResponse.status).toBe(200);
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