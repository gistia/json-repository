const MongoAdapter = require('./mongo-adapter');

class Repository {
  constructor(name, uniqueId) {
    this.name = name;
    this.uniqueId = uniqueId;
    this.adapter = new MongoAdapter();
  }

  retrieveRaw(id, version) {
    return new Promise((resolve, reject) => {
      this.adapter.collection(this.name).then(collection => {
        const where = { [`body.${this.uniqueId}`]: id };
        if (version) {
          where.version = version;
        }
        collection.find(where).toArray((err, docs) => {
          if (err) { return reject(err); }

          if (!docs.length) {
            return resolve(undefined);
          }

          resolve(docs[docs.length-1]);
        });
      }, reject).catch(reject);
    });
  }

  retrieveVersion(id, version) {
    return new Promise((resolve, reject) => {
      this.retrieveRaw(id, version).then(rawDoc => {
        if (!rawDoc) { return resolve(undefined); }
        resolve(rawDoc.body);
      }, reject).catch(reject);
    });
  }

  retrieve(id) {
    return this.retrieveVersion(id);
  }

  store(doc) {
    return new Promise((resolve, reject) => {
      this.currentVersion(doc[this.uniqueId]).then(currentVersion => {
        const version = (currentVersion || 0) + 1;
        this.adapter.collection(this.name).then(collection => {
          const envelope = { version, body: doc };
          collection.insert(envelope, (err, _doc) => {
            if (err) { return reject(err); }
            resolve(_doc);
          });
        }, reject).catch(reject);
      }, reject).catch(reject);
    });
  }

  currentVersion(id) {
    return new Promise((resolve, reject) => {
      this.adapter.collection(this.name).then(collection => {
        const where = { [`body.${this.uniqueId}`]: id };
        collection.find(where, { version: 1 }).sort({ version: -1 }).limit(1).toArray((err, docs) => {
          if (err) { return reject(err); }
          if (docs.length) {
            return resolve(docs[0].version);
          }
          resolve(undefined);
        });
      }, reject);
    });
  }

  getProperty(doc, property) {
    const parts = property.split('.');
    while (parts.length && (doc = doc[parts.shift()]));
    return doc;
  }
}

module.exports = Repository;
