const Promise = require('es6-promise').Promise;
const MongoAdapter = require('../../src/mongo-adapter');

const adapter = new MongoAdapter();

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    adapter.execute().then(db => {
      const collection = db.collection('tests');
      collection.insertMany(data, (err, doc) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(doc);
      });
    });
  });
};
