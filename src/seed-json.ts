import seed from "./data.seed";

class SeedJson {
    data: any;
    constructor() {
        this.saveSeedFile();
    }

    async saveSeedFile() {
        this.data = await seed.generate();
    }
}

const seedFile = new SeedJson();
export default seedFile;

