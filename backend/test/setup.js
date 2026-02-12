// Test setup: use in-memory SQLite database
process.env.TEST_DB = ":memory:";
process.env.JWT_SECRET = "test-secret-key";

const { app, db } = require("../server");

module.exports = { app, db };
