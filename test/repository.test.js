const Repository = require('../src/repository');
const MongoAdapter = require('../src/mongo-adapter');
const MongoTestHelper = require('./support/mongo-test-helper');

const mongoHelper = new MongoTestHelper();

const adapter = new MongoAdapter();

describe('Repository', () => {
  let repo;

  beforeEach((done) => {
    adapter.execute().then(db => {
      repo = new Repository('tests', 'id');
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
        }, done);
      }, done);
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
      repo.store({ id: 1, name: 'Felipe' }).then(_doc => {
        mongoHelper.retrieveData().then(data => {
          expect(data.length).to.eql(1);
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
});
