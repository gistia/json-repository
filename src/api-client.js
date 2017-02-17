const request = require('request');
const Promise = require('es6-promise').Promise;

class ApiClient {
  constructor(apiPrefix, collection) {
    this.apiPrefix = apiPrefix;
    this.collection = collection;
  }

  create(doc, options) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiPrefix}/${this.collection}`;
      if (options.compressed) {
        const reqOptions = { url, method: 'POST', headers: {
          'X-Content-Encoding': 'gzip',
        } };
        const buf = new Buffer(JSON.stringify(doc), 'utf-8');
        buf.pipe(request(reqOptions, (err, res, body) => {
          if (err) { return reject(err); }
          resolve(body);
        }));
      } else {
        const reqOptions = { url, method: 'POST', json: doc };
        request(reqOptions, (err, res, body) => {
          if (err) { return reject(err); }
          resolve(body);
        });
      }
    });
  }
}

module.exports = ApiClient;
