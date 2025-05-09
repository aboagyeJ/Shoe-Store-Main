const MongoClient = require('mongodb').MongoClient;
let db;
const url = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(url, { useUnifiedTopology: true });

async function connect(dbName) {
  try {
    if (!client.isConnected()) {
      await client.connect();
      console.log("MongoDB client connected.");
    }
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    return db;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}

const database = {
  get: async (dbName) => {
    if (db && db.databaseName === dbName) {
      return db;
    }
    return connect(dbName);
  },
  close: async () => {
    if (client.isConnected()) {
      await client.close();
      console.log("MongoDB client closed.");
    }
  },
};

module.exports = database;