const client = require('mongodb').MongoClient;
const Promise = require('es6-promise').Promise;

class MongoAdapter {
  execute() {
    return new Promise((resolve, reject) => {
      client.connect(process.env.MONGODB_URL, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(db);
      });
    });
  }
}

module.exports = MongoAdapter;
