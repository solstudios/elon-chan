// Database

// SQLite
const config = require('../config.json');
const Database = require('better-sqlite3');
const path = require('path');

const sql = new Database(path.resolve(config.database), { readonly: false });

exports.sql = sql;