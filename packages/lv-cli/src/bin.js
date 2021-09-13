#!/usr/bin/env node

const tsNode = require('ts-node');
const path = require('path');

tsNode.register({
  project: path.join(__dirname, '../tsconfig.json'),
  transpileOnly: true,
});

require('./index');
