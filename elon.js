// elon-chan server bot

const Discord = require('discord.js');
const logger = require('winston');
const config = require('./config.json');

const client = new Discord.Client();

//SQLite constants
const Database = require('better-sqlite3');
const sql = new Database('scores.sqlite3', { readonly: false });

const pointsTo = require('./helpers/pointsto').pointsTo;
let dbActions = {};

// winston logger
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// ready command
client.on('ready', () => {
  //Loads the logger
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
});

// messages watcher
client.on('message', msg => {
  if (msg.author.bot) return; // Makes sure the message is not from another bot
  if (!msg.guild) return; // These commands will only activate in a server and not in DMs

  if (msg.content.substring(0, 2) != config.prefix) return; // make sure message starts with prefix

  const args = msg.content.substring(2).split(' ');
  const cmd = args[0];

  switch(cmd) {
    case 'ping':
      msg.reply('Pong!');
      break;
    case 'score': // Tells a user how many points they have
      if (args.length > 1) { // For when another user is mentioned
        //parses the tagged user to get just the ID
        let recieverId = args[1];
        let oldName = args[1];
        if (args[1].length >= 3) {
          recieverId = args[3].substring(2, args[1].length - 1);
        }
        let rec = msg.guild.members.get(recieverId);

        if (!rec) {
          logger.info(`${oldName} does not exist, so points could not be given`);
          msg.reply(`${oldName} does not exist, so points could not be given`);
          break;
        }

        let uP = dbActions.getScore.get(rec, msg.guild.id).points;
        logger.info(`userpoints: ${uP}`);
        msg.reply(`You currently have ${uP} points.`);

      } else { // For getting the points of the user themself
        const userPoints = dbActions.getScore.get(msg.author.id, msg.guild.id).points;
        logger.info(`userpoints: ${userPoints}`);
        msg.reply(`You currently have ${userPoints} points.`);
      }
      break;
    default:
      // check if query was in form "e!X points to Y"
      pointsTo(args, msg, logger, dbActions);
  }
});

client.login(config.token);