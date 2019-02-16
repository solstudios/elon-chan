const config = require('../config.json');
const helpers = require('./helpers');

exports.scoreOf = (args, msg, logger, dbActions) => {
  if (args.length == 1) {
    // if no user specified, return the caller's score
    const userPoints = helpers.addToUser(dbActions, msg, msg.author.id, 0);
    logger.info(dbActions.getScore.get(msg.author.id, msg.guild.id));
    logger.info(`${msg.author.username} currently has ${userPoints} points.`);
    msg.reply(`you currently have ${userPoints} points.`);
  }
  // if another user is mentioned
  if (args.length > 1) {
    const oldName = args[1];

    if (helpers.isRole(oldName)) { // is role
      const score = helpers.addToRole(dbActions, msg, oldName, 0);
      msg.reply(`team ${oldName} currently has ${score} points`);
    } else if (helpers.isId(oldName)) { // is user id
      let reciever = null;
      let recieverId = null;

      //parses the tagged user to get just the ID
      recieverId = helpers.idParse(oldName);
      reciever = msg.guild.members.get(recieverId);

      logger.info(msg.guild);
      logger.info(`getting "${reciever}"'s score`);

      if (!reciever) {
        logger.info(`${oldName} does not exist, so score could not be found`);
        msg.reply(`${oldName} does not exist, so score could not be found`);
        return;
      }

      const score = helpers.addToUser(dbActions, msg, recieverId, 0);
      msg.reply(`${oldName} currently has ${score} points`);
    }
    // otherwise add points to their team role


    /*
    //parses the tagged user to get just the ID
    const oldName = args[1];
    const recieverId = helpers.idParse(oldName);
    const reciever = msg.guild.members.get(recieverId);

    logger.info(`recieverId ${recieverId}`);

    if (!reciever) {
      logger.info(`${oldName} does not exist, so points could not be given`);
      msg.reply(`${oldName} does not exist, so points could not be given`);
      return;
    }

    // NOTE: The current code only attempts to store points for each individual user, no team implementation is in place
    let score = dbActions.getScore.get(recieverId, msg.guild.id); // gets the current score for the user that sent the message
    let points = 0;
    if (!score) { // if that score doesn't exist, create a new user with 0 points
      helpers.newUser(dbActions, msg, msg.author.id, 0);
    } else {
      logger.info(score);
      points = score.points
    }

    logger.info(`${oldName} currently has ${points} points.`);
    msg.reply(`${oldName} currently has ${points} points.`);
    return;
  }
  */

  }
}
