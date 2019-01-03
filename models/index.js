// elon-chan server bot

const Discord = require('discord.js');
const logger = require('winston');
const config = require('./config.json');

const client = new Discord.Client();

// SQLite
const Database = require('better-sqlite3');
const sql = require('../lib/sql').sql;

logger.info('Connected');
logger.info(`Logged in as ${client.user.tag}!`);

//loads the SQL database
// code from: https://anidiots.guide/coding-guides/sqlite-based-points-system
// Check if the table "points" exists.
const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
if (!table['count(*)']) {
  // If the table isn't there, create it and setup the database correctly.
  sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER);").run();
  // Ensure that the "id" row is always unique and indexed.
  sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
  sql.pragma("synchronous = 1");
  sql.pragma("journal_mode = wal");
}

// And then we have two prepared statements to get and set the score data.
dbActions.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
dbActions.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points) VALUES (@id, @user, @guild, @points);");