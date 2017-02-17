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
    this.repo.store(req.body).then(result => {
      res.json({success: true, version: result.version});
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
