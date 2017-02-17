const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const Server = require('./src/server');

app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

dotenv.config();

const server = new Server(app, process.env.MONGODB_COLLECTION, process.env.MONGODB_UNIQUE_ID);
server.run(process.env.port || 8080);
