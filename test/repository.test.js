const Repository = require('../src/repository');
const MongoAdapter = require('../src/mongo-adapter');
const MongoTestHelper = require('./support/mongo-test-helper');

const mongoHelper = new MongoTestHelper();

const adapter = new MongoAdapter();

describe('Repository', () => {
  let repo;

  beforeEach((done) => {
    repo = new Repository('tests', 'id');

    adapter.connect().then(db => {
      db.collection('tests').remove();
      done();
    });
  });

  describe('retrieve', () => {
    it('retrieves the document by id', (done) => {
      mongoHelper.setupData([{ version: 1, body: { id: 1, name: 'Felipe' } }]).then(_doc => {
        repo.retrieve(1).then(doc => {
          expect(doc.name).to.eql('Felipe');
          done();
        }, done).catch(done);
      }, done).catch(done);
    });
  });

  describe('retrieveVersion', () => {
    it('retrieves the document by id and version', (done) => {
      mongoHelper.setupData([
        { version: 1, body: { id: 1, name: 'Felipe' } },
        { version: 2, body: { id: 1, name: 'Anderson' } },
      ]).then((_doc) => {
        repo.retrieveVersion(1, 1).then(doc => {
          expect(doc.name).to.eql('Felipe');
          done();
        }, done).catch(done);
      }, done).catch(done);
    });
  });

  describe('store', () => {
    it('stores a new document', (done) => {
      repo.store({ id: 1, name: 'Felipe' }).then(data => {
        expect(data.version).to.eql(1);
        
        mongoHelper.retrieveData().then(data => {
          const doc = data[0];

          expect(data.length).to.eql(1);
          expect(doc.version).to.eql(1);
          expect(doc.body.id).to.eql(1);
          expect(doc.body.name).to.eql('Felipe');
          done();
        }, done).catch(done);
      }, done).catch(done);
    });

    it('stores a new version of an existing document', (done) => {
      mongoHelper.setupData([{ version: 1, body: { id: 1, name: 'Felipe' } }]).then(_doc => {
        repo.store({ id: 1, name: 'Pablo' }).then(_doc => {
          mongoHelper.retrieveData().then(data => {
            const latest = data[data.length-1];
            expect(data.length).to.eql(2);
            expect(latest.version).to.eql(2);
            done();
          }, done).catch(done);
        }, done).catch(done);
      });
    });
  });

  describe('currentVersion', () => {
    it('returns current version', (done) => {
      mongoHelper.setupData([
        { version: 1, body: { id: 1, name: 'Felipe' } },
        { version: 2, body: { id: 1, name: 'Anderson' } },
      ]).then(_ => {
        repo.currentVersion(1).then(version => {
          expect(version).to.eql(2);
          done();
        }, done).catch(done);
      }, done).catch(done);      
    });

    it('returns undefined if there is no doc with id', (done) => {
      repo.currentVersion(12).then(version => {
        expect(version).to.be.undefined;
        done();
      });
    });
  });
});
