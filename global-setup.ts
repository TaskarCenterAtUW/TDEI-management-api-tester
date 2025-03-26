import seed from "./src/data.seed";

module.exports = async function () {
    console.log("Seading the information !!");
    global.seedData = await seed.generate();
}