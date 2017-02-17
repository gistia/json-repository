const zlib = require('zlib');
const Promise = require('es6-promise').Promise;

const Repository = require('./repository');

class Server {
  constructor(app, collection, uniqueId) {
    this.app = app;
    this.collection = collection;
    this.uniqueId = uniqueId;
    this.repo = new Repository(collection, uniqueId);
  }

  log(...s) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    // eslint-disable-next-line no-console
    console.log(...s);
  }

  addRoutes() {
    const path = `/${this.collection}`;
    this.log(`  + show       GET    ${path}/:id`);
    this.app.get(`${path}/:id`, this.show.bind(this));
    this.log(`  + create     POST   ${path}`);
    this.app.post(`${path}`, this.create.bind(this));
  }

  show(req, res) {
    const id = parseInt(req.params.id, 10);
    this.repo.retrieve(id).then(doc => {
      if (!doc) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(doc);
    });
  }

  create(req, res) {
    const errHandler = (err) => this.sendError(res, 'Error decoding body', err);
    this.decodeBody(req).then(body => {
      this.repo.store(body).then(result => {
        res.json({success: true, version: result.version});
      });
    }, errHandler).catch(errHandler);
  }

  sendError(res, message, error) {
    // eslint-disable-next-line no-console
    console.stack(error);
    res.status(500).json({ message, error });
  }

  decodeBody(req) {
    if (req.headers['x-content-encoding'] !== 'gzip') {
      return Promise.resolve(req.body);
    };

    return new Promise((resolve, reject) => {
      const buf = new Buffer(req.body.data, 'utf-8');
      zlib.gunzip(buf, (err, result) => {
        if (err) { return reject(err); }
        resolve(JSON.parse(result.toString('utf-8')));
      });
    });
  }

  run(port) {
    this.addRoutes();
    this.app.listen(port, () => {
      this.log(`Server listening on port ${port}!`);
    });
  }
}

module.exports = Server;
