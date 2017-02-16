const MongoAdapter = require('./mongo-adapter');

class Repository {
  constructor(name, uniqueId) {
    this.name = name;
    this.uniqueId = uniqueId;
    this.adapter = new MongoAdapter();
  }

  retrieveRaw(id, version) {
    return new Promise((resolve, reject) => {
      this.adapter.execute().then(db => {
        const where = { [`body.${this.uniqueId}`]: id };
        if (version) {
          where.version = version;
        }
        const collection = db.collection(this.name);
        collection.find(where).toArray((err, docs) => {
          if (err) {
            reject(err);
            return;
          }

          if (!docs.length) {
            resolve(undefined);
            return;
          }

          resolve(docs[docs.length-1]);
        });
      }, reject);
    });
  }

  retrieveVersion(id, version) {
    return new Promise((resolve, reject) => {
      this.retrieveRaw(id, version).then(rawDoc => {
        if (!rawDoc) {
          resolve(undefined);
          return;
        }
        resolve(rawDoc.body);
      }, reject);
    });
  }

  retrieve(id) {
    return this.retrieveVersion(id);
  }

  store(doc) {
    return new Promise((resolve, reject) => {
      this.retrieveRaw(doc[this.uniqueId]).then(currentDoc => {
        const version = currentDoc ? currentDoc.version + 1 : 1;
        this.adapter.execute().then(db => {
          const collection = db.collection(this.name);
          const envelope = { version, body: doc };
          collection.insert(envelope, (err, _doc) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(_doc);
          });
        });
      });
    });
  }

  getProperty(doc, property) {
    const parts = property.split('.');
    while (parts.length && (doc = doc[parts.shift()]));
    return doc;
  }
}

module.exports = Repository;
