const MongoAdapter = require('./mongo-adapter');

class Repository {
  constructor(name, uniqueId) {
    this.name = name;
    this.uniqueId = uniqueId;
    this.adapter = new MongoAdapter();
  }

  store(doc) {
    this.retrieve(doc);
  }

  retrieveVersion(id, version) {
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
          resolve(docs[docs.length-1].body);
        });
      }, reject);
    });
  }

  retrieve(id) {
    return this.retrieveVersion(id);
  }

  getProperty(doc, property) {
    const parts = property.split('.');
    while (parts.length && (doc = doc[parts.shift()]));
    return doc;
  }
}

module.exports = Repository;
