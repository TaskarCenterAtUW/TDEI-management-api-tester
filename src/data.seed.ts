import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { AuthApi, GTFSFlexServiceApi, GTFSPathwaysStationApi, Organization, OrganizationApi, RoleDetails, Service, ServiceUpdate, Station, StationUpdate, User, UserManagementApi } from "tdei-management-client";
import { TdeiObjectFaker } from "./tdei-object-faker";
import { TDEIROLES, Utility } from "./utils";

export interface ServiceInterface {
    id: string,
    name: string
}

export interface StationInterface {
    id: string,
    name: string
}

export class SeedDetails {
    organization: Organization | undefined;
    user: User | undefined;
    station: Station | undefined;
    service: Service | undefined;

    constructor(init?: Partial<SeedDetails>) {
        Object.assign(this, init);
    }

    get updateStationObject() {
        return <StationUpdate>{
            station_name: this.station?.station_name,
            tdei_station_id: this.station?.tdei_station_id,
            polygon: this.station?.polygon,
        }
    }

    get updateServiceObject() {
        return <ServiceUpdate>{
            service_name: this.service?.service_name,
            tdei_service_id: this.service?.tdei_service_id,
            polygon: this.service?.polygon,
        }
    }
}

class SeedData {
    private configurationWithAuthHeader = Utility.getConfiguration();
    private configurationWithoutAuthHeader = Utility.getConfiguration();

    private data: SeedDetails = new SeedDetails();

    constructor() {
    }

    private async setAuthentication() {
        let generalAPI = new AuthApi(this.configurationWithAuthHeader);
        const loginResponse = await generalAPI.authenticate({
            username: this.configurationWithAuthHeader.username,
            password: this.configurationWithAuthHeader.password
        });
        this.configurationWithAuthHeader.baseOptions = {
            headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
        };
    }

    /**
     *
     * @param freshSeed if true, it will always generate new seed data otherwise read from local generated seed.data.json
     * @returns
     */
    public async generate(freshSeed: boolean = false): Promise<SeedDetails> {
        await this.setAuthentication();

        //Read from existing seed data if available else generate new seed data.
        if (!freshSeed && existsSync('seed.data.json')) {
            const data = await readFile('seed.data.json', { encoding: 'utf8' });
            if (data) {
                console.log("Serving from local seed data!");
                this.data = JSON.parse(data);
                return new SeedDetails(this.data);
            }
        } else {
            try {
                console.log("Generating seed data");
                this.data.organization = await this.createOrganization();
                this.data.service = await this.createService(this.data.organization.tdei_org_id!);
                this.data.station = await this.createStation(this.data.organization.tdei_org_id!);
                this.data.user = await this.createUser();
                await this.assignOrgRoleToUser(this.data.user.email!, this.data.organization.tdei_org_id!);

                await this.writeFile();
                return this.data;
            } catch (error) {
                throw Error("Error generating seeding data : " + error);
            }
        }
        return this.data;
    }

    private async writeFile() {
        await writeFile('./seed.data.json', JSON.stringify(this.data), 'utf8');
    }

    private async createOrganization(): Promise<Organization> {
        console.log("Creating org");
        let orgApi = new OrganizationApi(this.configurationWithAuthHeader);
        const payload = TdeiObjectFaker.getOrganization();
        const response = await orgApi.createOrganization(payload);
        payload.tdei_org_id = response.data.data!;
        return payload;
    }

    private async createUser(): Promise<User> {
        console.log("Creating user");
        let userManagementApi = new UserManagementApi(this.configurationWithoutAuthHeader);
        const response = await userManagementApi.registerUser(TdeiObjectFaker.getUser());
        return response.data.data!;
    }

    private async createStation(orgId: string): Promise<Station> {
        console.log("Creating station");
        let stationApi = new GTFSPathwaysStationApi(this.configurationWithAuthHeader);
        const payload = TdeiObjectFaker.getStation(orgId)
        const response = await stationApi.createStation(payload);

        payload.tdei_station_id = response.data.data!;
        return payload;
    }

    private async createService(orgId: string): Promise<Service> {
        console.log("Creating service");
        let userManagementApi = new GTFSFlexServiceApi(this.configurationWithAuthHeader);
        const payload = TdeiObjectFaker.getService(orgId)
        const response = await userManagementApi.createService(payload);

        payload.tdei_service_id = response.data.data!;
        return payload;
    }

    private async assignOrgRoleToUser(username: string, orgId: string): Promise<boolean> {
        console.log("Assigning user org role");
        let userManagementApi = new UserManagementApi(this.configurationWithAuthHeader);
        let response = await userManagementApi.permission(<RoleDetails>
            {
                roles: [TDEIROLES.FLEX_DATA_GENERATOR, TDEIROLES.OSW_DATA_GENERATOR, TDEIROLES.PATHWAYS_DATA_GENERATOR],
                tdei_org_id: orgId,
                user_name: username
            })
        return true;
    }
}

const seed = new SeedData();
export default seed;

