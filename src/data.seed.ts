import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { AuthApi, GTFSFlexServiceApi, GTFSPathwaysStationApi, OrganizationApi, RoleDetails, User, UserManagementApi } from "tdei-management-client";
import { TdeiObjectFaker } from "./tdei-object-faker";
import { TDEIROLES, Utility } from "./utils";

export interface ISeedData {
    organizationId: string,
    user: User,
    stationId: string,
    serviceId: string
}

class SeedData {
    private configurationWithAuthHeader = Utility.getConfiguration();
    private configurationWithoutAuthHeader = Utility.getConfiguration();

    private data: ISeedData = {
        organizationId: "",
        user: {},
        stationId: "",
        serviceId: ""
    };

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
    public async generate(freshSeed: boolean = false): Promise<ISeedData> {
        await this.setAuthentication();

        //Read from existing seed data if available else generate new seed data.
        if (!freshSeed && existsSync('seed.data.json')) {
            const data = await readFile('seed.data.json', { encoding: 'utf8' });
            if (data) {
                console.log("Serving from local seed data!");
                this.data = JSON.parse(data);
                return this.data;
            }
        }
        else {
            try {
                console.log("Generating seed data");
                this.data.organizationId = await this.createOrganization();
                this.data.serviceId = await this.createService(this.data.organizationId);
                this.data.stationId = await this.createStation(this.data.organizationId);
                this.data.user = await this.createUser();
                await this.assignOrgRoleToUser(this.data.user.email!, this.data.organizationId);

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
        // .then(() => { console.log('Seed file created successfully !'); })
        // .catch(err => { console.error("Error generating seed file.  " + err); });
    }

    private async createOrganization(): Promise<string> {
        console.log("Creating org");
        let orgApi = new OrganizationApi(this.configurationWithAuthHeader);
        const response = await orgApi.createOrganization(TdeiObjectFaker.getOrganization());
        return response.data.data!;
    }

    private async createUser(): Promise<User> {
        console.log("Creating user");
        let userManagementApi = new UserManagementApi(this.configurationWithoutAuthHeader);
        const response = await userManagementApi.registerUser(TdeiObjectFaker.getUser());
        return response.data.data!;
    }

    private async createStation(orgId: string): Promise<string> {
        console.log("Creating station");
        let userManagementApi = new GTFSFlexServiceApi(this.configurationWithAuthHeader);
        const response = await userManagementApi.createService(TdeiObjectFaker.getService(orgId));
        return response.data.data!;
    }

    private async createService(orgId: string): Promise<string> {
        console.log("Creating service");
        let stationApi = new GTFSPathwaysStationApi(this.configurationWithAuthHeader);
        const response = await stationApi.createStation(TdeiObjectFaker.getStation(orgId));
        return response.data.data!;
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

