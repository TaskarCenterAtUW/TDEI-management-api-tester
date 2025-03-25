import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { AuthApi, ServiceApi, ProjectGroup, ProjectGroupApi, RoleDetails, Service, ServiceUpdate, User, UserManagementApi, Configuration } from "tdei-management-client";
import { TdeiObjectFaker } from "./tdei-object-faker";
import { TDEIROLES, Utility } from "./utils";
import { environment } from "./environment/environment";

export interface ServiceInterface {
    id: string,
    name: string
}

export interface StationInterface {
    id: string,
    name: string
}

export interface Credentials {
    username: string
    password: string
}

export interface Users {
    poc: Credentials
    flex_data_generator: Credentials
    pathways_data_generator: Credentials
    osw_data_generator: Credentials
    api_key_tester: Credentials
    default_user: Credentials
}

export class SeedDetails {
    projectGroup: ProjectGroup | undefined;
    services: Service[] | undefined;
    users: Users | undefined;
    api_key: string | undefined;
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
    private adminConfiguration = new Configuration({
        username: environment.seed.adminUser,
        password: environment.seed.adminPassword,
        basePath: environment.seed.baseUrl
    });
    // private configurationWithoutAuthHeader = Utility.getAdminConfiguration();
    private readonly data_types: Array<string>;
    private readonly roles: Array<string>;


    private data: SeedDetails = new SeedDetails();

    constructor() {
        this.roles = ['poc']
        this.data_types = ['osw', 'flex', 'pathways']
    }

    private async setAuthentication() {
        await Utility.setAuthToken(this.adminConfiguration);
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
                this.data = new SeedDetails(this.data);
                // return new SeedDetails(this.data);
            }
        } else {
            try {
                console.log("Generating seed data");
                this.data.projectGroup = await this.createProjectGroup();
                this.data.services = await this.createService(this.data.projectGroup!.tdei_project_group_id!);
                // this.data.producer_user = await this.createUser();
                // this.data.poc_user = await this.createUser();
                // await this.assignProjectGroupRoleToUser(Utility.getApiInput().user..email!, this.data.projectGroup!.tdei_project_group_id!,
                //     [TDEIROLES.FLEX_DATA_GENERATOR, TDEIROLES.OSW_DATA_GENERATOR, TDEIROLES.PATHWAYS_DATA_GENERATOR]);
                // await this.assignProjectGroupRoleToUser(this.data.poc_user.email!, this.data.projectGroup!.tdei_project_group_id!, [TDEIROLES.POC]);
                this.data.users = await this.assignUserRoles(this.data.projectGroup!.tdei_project_group_id!);
                let userProfile = (await this.getUserProfile((this.data.users as Users).poc.username));
                this.data.api_key = userProfile.data.apiKey;
                console.log("api_key", this.data.api_key);
                console.log(userProfile);
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

    public async getUserProfile(user_name: string): Promise<any> {
        console.log('Getting user profile...');
        try {
            let authAPI = new AuthApi(this.adminConfiguration);
            // await this.client.login();
            const result = await authAPI.getUserProfile(user_name);
            return result;
        } catch (error) {
            console.log(user_name)
            console.error('getUserProfile', error);
            throw error;
        }
    }

    private async assignUserRoles(project_group_id: string): Promise<Users> {
        console.log('Assigning user roles...');
        let userManagementApi = new UserManagementApi(this.adminConfiguration);

        const users = Utility.getApiInput().users;
        let usersDictionary = {} as Users;
        try {
            for await (const role of this.roles) {

                await userManagementApi.permission({
                    roles: [role],
                    tdei_project_group_id: project_group_id,
                    user_name: users[role]
                })

                console.info(`Added ${role} permission to username: ${users[role]}`)
                usersDictionary[role] = {
                    username: users[role],
                    password: 'Pa$s1word'
                }
            }

            //add default user 
            usersDictionary['default_user'] = {
                username: users.default_user,
                password: 'Pa$s1word'
            }
            return usersDictionary
        } catch (error) {
            console.error('assignUserRoles', error);
            throw error;
        }
    }

    private async createProjectGroup(): Promise<ProjectGroup> {
        console.log("Creating Project Group");
        let projectGroupApi = new ProjectGroupApi(this.adminConfiguration);
        const payload = TdeiObjectFaker.getProjectGroup();
        const response = await projectGroupApi.createProjectGroup(payload);
        payload.tdei_project_group_id = response.data.data!;
        return payload;
    }

    // private async createUser(): Promise<User> {
    //     console.log("Creating user");
    //     let userManagementApi = new UserManagementApi(this.configurationWithoutAuthHeader);
    //     const response = await userManagementApi.registerUser(TdeiObjectFaker.getUser());
    //     console.log("Creating user successful");
    //     return response.data.data!;
    // }

    private async createService(tdei_project_group_id: string): Promise<Service[]> {
        console.log("Creating service");
        let list: Service[] = [] as any;
        let userManagementApi = new ServiceApi(this.adminConfiguration);

        for await (const data_type of this.data_types) {
            const payload = TdeiObjectFaker.getService(tdei_project_group_id, data_type);

            const response = await userManagementApi.createService(payload);

            payload.tdei_service_id = response.data.data!;
            list.push(payload);

        }
        return list;
    }

    // private async assignProjectGroupRoleToUser(username: string, tdei_project_group_id: string, roles: TDEIROLES[]): Promise<boolean> {
    //     console.log("Assigning user AUTH_HOST= role");
    //     let userManagementApi = new UserManagementApi(this.configurationWithAuthHeader);
    //     let response = await userManagementApi.permission(<RoleDetails>
    //         {
    //             roles: roles,
    //             tdei_project_group_id: tdei_project_group_id,
    //             user_name: username
    //         })
    //     return true;
    // }
}

const seed = new SeedData();

export default seed;

