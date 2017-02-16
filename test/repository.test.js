const Repository = require('../src/repository');
const MongoAdapter = require('../src/mongo-adapter');

const adapter = new MongoAdapter();

describe('Repository', () => {
  let repo;

  before((done) => {
    adapter.execute().then(db => {
      db.collection('tests').remove();
      done();
    });
  });

  beforeEach(() => {
    repo = new Repository('tests', 'id');
  });

  describe('retrieve', () => {
    it('retrieves the document by id', (done) => {
      adapter.execute().then(db => {
        const collection = db.collection('tests');
        collection.insert({ version: 1, body: { id: 1, name: 'Felipe' } }, (err, _doc) => {
          if (err) {
            done(err);
            return;
          }

          repo.retrieve(1).then(doc => {
            expect(doc.name).to.eql('Felipe');
            done();
          }, done);
        });
      }, done);

    });
  });


  describe('retrieveVersion', () => {
    it('retrieves the document by id and version', (done) => {
      adapter.execute().then(db => {
        const collection = db.collection('tests');
        collection.insertMany([
          { version: 1, body: { id: 1, name: 'Felipe' } },
          { version: 2, body: { id: 1, name: 'Anderson' } },
        ], (err, _doc) => {
          if (err) {
            done(err);
            return;
          }

          repo.retrieveVersion(1, 1).then(doc => {
            expect(doc.name).to.eql('Felipe');
            done();
          }, done);
        });
      }, done);

    });
  });
});
