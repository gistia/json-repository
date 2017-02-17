const client = require('mongodb').MongoClient;
const Promise = require('es6-promise').Promise;

class MongoAdapter {
  connect() {
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

  collection(name) {
    return new Promise((resolve, reject) => {
      this.connect().then(db => resolve(db.collection(name)), reject).catch(reject);
    });
  }
}

module.exports = MongoAdapter;
