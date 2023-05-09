const seed = require("./seed.js");
const db = require("../connection.js");
let seedData;

if (process.env.NODE_ENV === "test") {
  seedData = require("../data/test-data/index.js");
} else {
  seedData = require("../data/development-data/index.js");
}

const runSeed = () => {
  return seed(seedData).then(() => db.end());
};

runSeed();
