const config = require('../config.json');
const helpers = require('./helpers');

exports.scoreOf = (args, msg, logger, dbActions) => {
  // if another user is mentioned
  if (args.length > 1) {
    //parses the tagged user to get just the ID
    const oldName = args[1];
    const recieverId = helpers.idParse(oldName);
    const reciever = msg.guild.members.get(recieverId);

    if (!reciever) {
      logger.info(`${oldName} does not exist, so points could not be given`);
      msg.reply(`${oldName} does not exist, so points could not be given`);
      return;
    }

    // NOTE: The current code only attempts to store points for each individual user, no team implementation is in place
    let score = dbActions.getScore.get(recieverId, msg.guild.id); // gets the current score for the user that sent the message
    if (!score) { // if that score doesn't exist, create a new user
      score = {
        id: `${msg.guild.id}-${msg.author.id}`,
        user: msg.author.id, guild: msg.guild.id,
        points: 0
      }
      // TODO: add implementaion to ask the point assigner to set a team for the new User
    }
    dbActions.setScore.run(score); // Set the user's score in the database to the new score

    logger.info(`${oldName} currently has ${score.points} points.`);
    msg.reply(`${oldName} currently has ${score.points} points.`);
    return;
  }

  // if no user specified, return the caller's score
  const userPoints = dbActions.getScore.get(msg.author.id, msg.guild.id).points;
  logger.info(`${msg.author.name} currently has ${userPoints} points.`);
  msg.reply(`you currently have ${userPoints} points.`);
}
