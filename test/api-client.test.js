const ApiClient = require('../src/api-client');
const Server = require('../src/server');
const MongoTestHelper = require('./support/mongo-test-helper');

const mongoHelper = new MongoTestHelper();

describe('ApiClient', () => {
  const client = new ApiClient('http://localhost:8989', 'tests');
  let server;

  before((done) => {
    const express = require('express');
    const bodyParser = require('body-parser');
    const app = express();

    app.use(bodyParser.json({limit: '50mb'}));

    server = new Server(app, process.env.MONGODB_COLLECTION, process.env.MONGODB_UNIQUE_ID);
    server.run(process.env.port || 8989).then(_ => {
      done();
    }, done).catch(done);
  });

  after((done) => {
    server.close().then(_ => done(), done).catch(done);
  });

  describe('create', () => {
    describe('with compressed payload', () => {
      it('creates a new document', (done) => {
        const doc = { id: 1, name: 'Felipe' };
        client.create(doc, { compress: true }).then(_ => {
          mongoHelper.retrieveData().then(data => {
            const doc = data[0];

            expect(data.length).to.eql(1);
            expect(doc.version).to.eql(1);
            expect(doc.body.name).to.eql('Felipe');
            done();
          }, done).catch(done);
        }, done).catch(done);
      });
    });
  });
});
