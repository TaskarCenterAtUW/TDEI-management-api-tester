import { Utility } from '../utils';
import {
    GTFSPathwaysStationApi,
} from 'tdei-management-client';
import seed, { SeedDetails } from '../data.seed';
import { TdeiObjectFaker } from '../tdei-object-faker';

describe('GTFS Pathways Service Role Testing - Data Generator User', () => {
    let configurationWithAuthHeader = Utility.getConfiguration();
    let seederData: SeedDetails | undefined = undefined;
    beforeAll(async () => {
        seederData = await seed.generate();
        const loginResponse = await Utility.login(seederData.producer_user?.email!, "Tester01*");
        configurationWithAuthHeader.baseOptions = {
            headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
        };
    }, 50000);

    describe('Create Station', () => {
        describe('Functional', () => {
            it('When creating new station, Expect to return HTTP Status 403', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationRequest = gtfsPathwaysApi.createStation(TdeiObjectFaker.getStation(seederData?.organization?.tdei_org_id));

                await expect(stationRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        });
    });

    describe('Update Station', () => {

        describe('Functional', () => {
            it('When updating new station, Expect to return HTTP Status 403', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);
                let payload = seederData?.updateStationObject!;

                const stationRequest = gtfsPathwaysApi.updateStation(payload, <string>seederData?.organization?.tdei_org_id);

                await expect(stationRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        });
    });

    describe('Delete Station', () => {
        describe('Functional', () => {

            it('When deleting station id, Expect to return HTTP Status 403', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationRequest = gtfsPathwaysApi.setServiceStatus(seederData?.organization?.tdei_org_id!, <string>seederData?.station?.tdei_station_id!, true);

                await expect(stationRequest).rejects.toMatchObject({ response: { status: 403 } });
            });
        })
    });

    describe('Get Station', () => {
        describe('Functional', () => {
            it('When searched without filters, Expect to return list of Stations of type Station', async () => {
                const gtfsPathwaysApi = new GTFSPathwaysStationApi(configurationWithAuthHeader);

                const stationResponse = await gtfsPathwaysApi.getStation();

                expect(stationResponse.status).toBe(200);
                expect(stationResponse.data).toBeInstanceOf(Array);
            });
        })
    });
});

