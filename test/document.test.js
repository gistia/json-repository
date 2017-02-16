const Document = require('../src/document');

describe('Document', () => {
  let doc;

  beforeEach(() => {
    doc = new Document();
  });

  it('has an initial version', () => {
    expect(doc.version).to.eql(1);
  });

  it('', () => {

  });
});
