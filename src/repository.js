const { Client } = require('mongodb-promise');
const { ObjectID } = require('mongodb');

class Repository {
  constructor(name, uniqueId) {
    this.name = name;
    this.uniqueId = uniqueId;
    this.client = new Client();
  }

  makeWhereClause(id) {
    const orClauses = [ { [`body.${this.uniqueId}`]: id } ];
    const numId = parseInt(id, 10);
    if (numId !== id) {
      orClauses.push({ [`body.${this.uniqueId}`]: numId });
    }
    return { $or: orClauses };
  }

  retrieveRaw(id, version) {
    return new Promise((resolve, reject) => {
      const where = this.makeWhereClause(id);
      if (version) {
        where.version = version;
      }

      const builder = this.client.query(this.name);
      builder.find(where).execute().then(docs => {
        if (!docs.length) {
          return resolve(undefined);
        }
        resolve(docs[docs.length-1]);
      }, reject).catch(reject);
    });
  }

  retrieveVersion(id, version, lock) {
    return new Promise((resolve, reject) => {
      this.retrieveRaw(id, version).then(rawDoc => {
        if (!rawDoc) { return resolve(undefined); }

        if (!lock) {
          return resolve(rawDoc.body);
        }

        this.collection().then(collection => {
          const _id = new ObjectID(rawDoc._id);
          collection.findOneAndUpdate({ _id }, { $set: { lockedAt: new Date() }}).then(res => {
            resolve(res.value.body);
          }, reject).catch(reject);
        }, reject).catch(reject);
      }, reject).catch(reject);
    });
  }

  retrieve(id, lock) {
    return this.retrieveVersion(id, null, lock);
  }

  store(doc) {
    return new Promise((resolve, reject) => {
      this.currentVersion(doc[this.uniqueId]).then(currentVersion => {
        const version = (currentVersion || 0) + 1;
        this.client.collection(this.name).then(collection => {
          const envelope = { version, body: doc };
          collection.insert(envelope, (err, result) => {
            if (err) { return reject(err); }
            resolve({ version, result });
          });
        }, reject).catch(reject);
      }, reject).catch(reject);
    });
  }

  currentVersion(id) {
    return new Promise((resolve, reject) => {
      const where = this.makeWhereClause(id);
      const query = this.client.query(this.name);

      query.find(where, { version: 1 }).sort({ version: -1 }).limit(1).execute().then(docs => {
        if (docs.length) {
          return resolve(docs[0].version);
        }
        resolve(undefined);
      }, reject).catch(reject);
    });
  }

  getProperty(doc, property) {
    const parts = property.split('.');
    while (parts.length && (doc = doc[parts.shift()]));
    return doc;
  }

  collection() {
    return this.client.collection(this.name);
  }
}

module.exports = Repository;
