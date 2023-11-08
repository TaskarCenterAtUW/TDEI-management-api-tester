import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { AuthApi, GTFSFlexServiceApi, GTFSPathwaysStationApi, ProjectGroup, ProjectGroupApi, RoleDetails, Service, ServiceUpdate, Station, StationUpdate, User, UserManagementApi } from "tdei-management-client";
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
    projectGroup: ProjectGroup | undefined;
    producer_user: User | undefined;
    poc_user: User | undefined;
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
                this.data.projectGroup = await this.createProjectGroup();
                this.data.service = await this.createService(this.data.projectGroup!.tdei_project_group_id!);
                this.data.station = await this.createStation(this.data.projectGroup!.tdei_project_group_id!);
                this.data.producer_user = await this.createUser();
                this.data.poc_user = await this.createUser();
                await this.assignProjectGroupRoleToUser(this.data.producer_user.email!, this.data.projectGroup!.tdei_project_group_id!,
                    [TDEIROLES.FLEX_DATA_GENERATOR, TDEIROLES.OSW_DATA_GENERATOR, TDEIROLES.PATHWAYS_DATA_GENERATOR]);
                await this.assignProjectGroupRoleToUser(this.data.poc_user.email!, this.data.projectGroup!.tdei_project_group_id!, [TDEIROLES.POC]);

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

    private async createProjectGroup(): Promise<ProjectGroup> {
        console.log("Creating Project Group");
        let projectGroupApi = new ProjectGroupApi(this.configurationWithAuthHeader);
        const payload = TdeiObjectFaker.getProjectGroup();
        const response = await projectGroupApi.createProjectGroup(payload);
        payload.tdei_project_group_id = response.data.data!;
        return payload;
    }

    private async createUser(): Promise<User> {
        console.log("Creating user");
        let userManagementApi = new UserManagementApi(this.configurationWithoutAuthHeader);
        const response = await userManagementApi.registerUser(TdeiObjectFaker.getUser());
        return response.data.data!;
    }

    private async createStation(tdei_project_group_id: string): Promise<Station> {
        console.log("Creating station");
        let stationApi = new GTFSPathwaysStationApi(this.configurationWithAuthHeader);
        const payload = TdeiObjectFaker.getStation(tdei_project_group_id)
        const response = await stationApi.createStation(payload);

        payload.tdei_station_id = response.data.data!;
        return payload;
    }

    private async createService(tdei_project_group_id: string): Promise<Service> {
        console.log("Creating service");
        let userManagementApi = new GTFSFlexServiceApi(this.configurationWithAuthHeader);
        const payload = TdeiObjectFaker.getService(tdei_project_group_id)
        const response = await userManagementApi.createService(payload);

        payload.tdei_service_id = response.data.data!;
        return payload;
    }

    private async assignProjectGroupRoleToUser(username: string, tdei_project_group_id: string, roles: TDEIROLES[]): Promise<boolean> {
        console.log("Assigning user AUTH_HOST= role");
        let userManagementApi = new UserManagementApi(this.configurationWithAuthHeader);
        let response = await userManagementApi.permission(<RoleDetails>
            {
                roles: roles,
                tdei_project_group_id: tdei_project_group_id,
                user_name: username
            })
        return true;
    }
}

const seed = new SeedData();
export default seed;

