const Promise = require('es6-promise').Promise;
const MongoAdapter = require('../../src/mongo-adapter');

const adapter = new MongoAdapter();

class MongoTestHelper {
  setupData(data) {
    return new Promise((resolve, reject) => {
      this.connect().then(collection => {
        collection.insertMany(data, (err, doc) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(doc);
        });
      });
    });
  }

  retrieveData() {
    return new Promise((resolve, reject) => {
      this.connect().then(collection => {
        collection.find({}).toArray((err, docs) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(docs);
        });
      });
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      adapter.connect().then(db => {
        resolve(db.collection('tests'));
      }, reject);
    });
  }
}

module.exports = MongoTestHelper;
