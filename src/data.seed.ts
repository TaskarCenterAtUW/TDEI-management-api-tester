import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { AuthApi, ServiceApi, ProjectGroup, ProjectGroupApi, RoleDetails, Service, ServiceUpdate, User, UserManagementApi } from "tdei-management-client";
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
    services: Service[] | undefined;

    constructor(init?: Partial<SeedDetails>) {
        Object.assign(this, init);
    }

    updateServiceObject(type: string): ServiceUpdate {
        let tdei_service = this.services?.find(x => x.service_type == type);
        return <ServiceUpdate>{
            service_name: tdei_service?.service_name,
            tdei_service_id: tdei_service?.tdei_service_id,
            polygon: tdei_service?.polygon,
        }
    }

    getService(type: string): Service {
        let tdei_service = this.services?.find(x => x.service_type == type);
        return tdei_service!;
    }
}

class SeedData {
    private configurationWithAuthHeader = Utility.getConfiguration();
    private configurationWithoutAuthHeader = Utility.getConfiguration();
    private readonly data_types: Array<string>;

    private data: SeedDetails = new SeedDetails();

    constructor() {
        this.data_types = ['osw', 'flex', 'pathways']
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
                this.data.services = await this.createService(this.data.projectGroup!.tdei_project_group_id!);
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

    private async createService(tdei_project_group_id: string): Promise<Service[]> {
        console.log("Creating service");
        let list: Service[] = [] as any;
        let userManagementApi = new ServiceApi(this.configurationWithAuthHeader);

        for await (const data_type of this.data_types) {
            const payload = TdeiObjectFaker.getService(tdei_project_group_id, data_type);

            const response = await userManagementApi.createService(payload);

            payload.tdei_service_id = response.data.data!;
            list.push(payload);

        }
        return list;
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

