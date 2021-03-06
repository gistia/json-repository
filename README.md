# JSON Document Repository Server

![](https://codeship.com/projects/203040/status?branch=master)

This server is responsible for storing JSON documents with the following features:

- MongoDB is used for storage
- Versioning of documents
- Configuration of endpoints based on document type
- Configuration of unique identifiers for documents

## Server configuration

In order to create a new server, you need to pass in the following information:

- MongoDB instance URL (like `mongodb://user:password@server:27017/database`)
- MongoDB collection name (like `test-results`)
- MongoDB unique ID (like `main.orderChoiceID`)

Programatically, here's how you create a new server:

```javascript
const Server = require('./src/server');

const server = new Server(app, process.env.MONGODB_COLLECTION, process.env.MONGODB_UNIQUE_ID);
server.run(process.env.port || 8080);
```

