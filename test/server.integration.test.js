const express = require('express');
const bodyParser = require('body-parser');
const chai = require('chai');
const chaiHttp = require('chai-http');
const zlib = require('zlib');

const Server = require('../src/server');
const MongoTestHelper = require('./support/mongo-test-helper');

const mongoHelper = new MongoTestHelper();

chai.use(chaiHttp);

describe('Server', () => {
  let app, server;

  beforeEach((done) => {
    mongoHelper.eraseCollection().then(_ => {
      app = express();
      app.use(bodyParser.json({limit: '50mb'}));
      server = new Server(app, 'tests', 'id');
      server.addRoutes();
      done();
    });
  });

  describe('show route', () => {
    it('returns the resource', (done) => {
      mongoHelper.setupData([{ version: 1, body: { id: 1, name: 'Felipe' } }]).then(_ => {
        chai.request(app).get('/tests/1').then(res => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.eql(1);
          expect(res.body.name).to.eql('Felipe');
          done();
        }, done).catch(done);
      });
    });

    it('returns the latest version of a document', (done) => {
      mongoHelper.setupData([
        { version: 1, body: { id: 1, name: 'Felipe' } },
        { version: 2, body: { id: 1, name: 'Anderson' } },
      ]).then(_ => {
        chai.request(app).get('/tests/1').then(res => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.eql(1);
          expect(res.body.name).to.eql('Anderson');
          done();
        }, done).catch(done);
      });
    });

    it('returns 404 when not found', (done) => {
      chai.request(app).get('/tests/2').then(_ => {
        done('Expected 404 but got a successful response');
      }, err => {
        const res = err.response;
        expect(err).to.have.status(404);
        expect(res.body.error).to.eql('Not found');
        done();
      }).catch(done);
    });
  });

  describe('create', () => {
    describe('compressed payload', () => {
      it('creates a new valid document', (done) => {
        const doc = { id: 1, name: 'Felipe' };
        const buf = new Buffer(JSON.stringify(doc), 'utf-8');
        zlib.gzip(buf, (err, result) => {
          if (err) { return done(err); }
          chai.request(app).post('/tests').set('X-Content-Encoding', 'gzip').send(result).then(_ => {
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

    it('cretes a new document', (done) => {
      const doc = { id: 1, name: 'Felipe' };
      chai.request(app).post('/tests').send(doc).then(_ => {
        mongoHelper.retrieveData().then(data => {
          const doc = data[0];

          expect(data.length).to.eql(1);
          expect(doc.version).to.eql(1);
          expect(doc.body.name).to.eql('Felipe');
          done();
        }, done).catch(done);
      });
    });

    it('cretes a new version of an existing document', (done) => {
      mongoHelper.setupData([{ version: 1, body: { id: 1, name: 'Anderson' } }]).then(_ => {
        const doc = { id: 1, name: 'Felipe' };
        chai.request(app).post('/tests').send(doc).then(_ => {
          mongoHelper.retrieveData().then(data => {
            const doc = data[1];

            expect(data.length).to.eql(2);
            expect(doc.version).to.eql(2);
            expect(doc.body.name).to.eql('Felipe');
            done();
          }, done).catch(done);
        });
      });
    });
  });
});
