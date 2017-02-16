const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/test';

let db;
MongoClient.connect(url, (err, _db) => {
  console.log('err', err);
  db = _db;
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

getCollection = (req) => {
  const colName = req.params.collection;
  return db.collection(colName);
};

findDoc = (req, callback) => {
  const collection = getCollection(req);
  collection.find({_id: req.params.id}).toArray(callback);
};

saveDoc = (req, version, callback) => {
  version = version || 1;
  const collection = getCollection(req);
  const body = req.body;
  const doc = { version, body };

  collection.insert(doc, callback);
};

app.post('/docs/:collection', (req, res) => {
  saveDoc(req, 1, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(result);
  });
});

app.get('/docs/:collection/:id', (req, res) => {
  findDoc(req, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    console.log('result', result);
    res.json(result.body);
  });
});

app.put('/docs/:collection/:id', (req, res) => {
  findDoc(req, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    if (!result) {
      res.status(404).send(`Collection ${req.params.collection} has no documents with id ${id}`);
      return;
    }
    saveDoc(req, result.version + 1, (err, result) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.json(result);
    });
  });
});

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`Server listening on port ${port}!`)
});
