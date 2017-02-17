#!/usr/bin/env node
const fs = require('fs');
const ApiClient = require('../src/api-client');

const client = new ApiClient(process.env.JRR_PREFIX, process.env.JRR_COLLECTION);
const input = process.argv[2];
const options = {};

let doc;
if (input.charAt(0) === '@') {
  doc = JSON.parse(fs.readFileSync(input.split('@')[1]));
  options.compressed = true;
} else {
  doc = JSON.parse(input);
}

client.create(doc, options).then(body => {
  // eslint-disable-next-line no-console
  console.log(body);
  // eslint-disable-next-line no-console
}, console.error).catch(console.error);
