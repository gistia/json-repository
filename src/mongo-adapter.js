const client = require('mongodb').MongoClient;
const Promise = require('es6-promise').Promise;

class QueryBuilder {
  constructor(name, adapter) {
    this.name = name;
    this.adapter = adapter;
  }

  find(query) {
    this.findQuery = query;
    return this;
  }

  sort(key) {
    this.sortKey = key;
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  execute() {
    return new Promise((resolve, reject) => {
      this.adapter.collection(this.name).then(collection => {
        let query = collection;

        if (this.findQuery) {
          query = query.find(this.findQuery);
        }

        if (this.sortKey) {
          query = query.sort(this.sortKey);
        }

        if (this.limitValue) {
          query = query.limit(this.limitValue);
        }

        query.toArray((err, docs) => {
          if (err) { return reject(err); }
          resolve(docs);
        });
      });
    });
  }
}

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

  builder(collection) {
    return new QueryBuilder(collection, this);
  }
}

module.exports = MongoAdapter;
