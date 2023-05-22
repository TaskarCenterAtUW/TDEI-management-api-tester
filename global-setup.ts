import seed from "./src/data.seed";

const setup = async (): Promise<void> => {
    // whatever you need to setup globally
    console.log("Setup!!");
    await seed.generate();
};

export default setup;