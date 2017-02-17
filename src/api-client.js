const request = require('request');
const zlib = require('zlib');

const Promise = require('es6-promise').Promise;

class ApiClient {
  constructor(apiPrefix, collection) {
    this.apiPrefix = apiPrefix;
    this.collection = collection;
  }

  create(doc, options={}) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiPrefix}/${this.collection}`;
      if (options.compressed) {
        const buf = new Buffer(JSON.stringify(doc), 'utf-8');
        zlib.gzip(buf, (err, body) => {
          const headers = { 'X-Content-Encoding': 'gzip', 'Content-Type': 'application/octet-stream' };
          const method = 'POST';
          const buf = new Buffer(body, 'utf-8');

          request({ url, method, headers, body: buf }, (err, res, body) => {
            if (err) { return reject(err); }
            resolve(body);
          });
        });
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
