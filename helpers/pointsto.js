const config = require('../config.json');
const helpers = require('./helpers');

exports.pointsTo = (args, msg, logger, dbActions) => {
  logger.info('checking points');
  logger.info(args);

  if (args.length != 4) return;

  // X points to/for Y
  const points = parseInt(args[0], 10);
  logger.info(`parsed points is ${points}`);

  if (!(
    !isNaN(points) && // if not undefined
    args.length == 4 && // command has 4 words
    (args[1].toLowerCase() === 'points' || args[1].toLowerCase() === 'pts') && // proper words
    (args[2].toLowerCase() === 'for' || args[2].toLowerCase() === 'to') // for or to
  )) {
    logger.info('query not correct');
    return;
  }

  // ensure sender is authorized to give points
  const sender = msg.member;
  if (!sender.roles.find(role => role.name === config.role)) {
    logger.info(`${msg.user.tag} not authorized to give points`);
    msg.reply('you are not authorized to give points!');
    return;
  }

  // ensure points given are greater than 0
  if (points <= 0) {
    logger.info(`${msg.user.tag} could not give <= 0 points`);
    msg.reply('you can\'t give 0 or less points to a user!');
    return;
  }

  // TODO
  // Check if you are giving points to a role
  // msg.guild.roles.find()
  const oldName = args[3];
  let recieverId = null;
  let reciever = null;
  logger.info(oldName);
  logger.info(oldName.substring(0,2));
  logger.info(oldName.slice(-1));
  if (helpers.isId(oldName)) { // is user id
    logger.info(`trying to give a user id points`);
    //parses the tagged user to get just the ID
    recieverId = helpers.idParse(oldName);
    reciever = msg.guild.members.get(recieverId);

    logger.info(msg.guild);
    logger.info(`trying to give "${reciever}" points`);

    if (!reciever) {
      logger.info(`${oldName} does not exist, so points could not be given`);
      msg.reply(`${oldName} does not exist, so points could not be given`);
      return;
    }
  } else { //is role
    logger.info(`trying to give a role points`);
    // TODO: remove return
    return;
  }


  let score;
  // NOTE: The current code only attempts to store points for each individual user, no team implementation is in place
  score = dbActions.getScore.get(recieverId, msg.guild.id); // gets the current score for the user that sent the message

  logger.info(`score for this person`);
  console.log(score);
  // if that score doesn't exist, create a new user with the proper amount of points
  if (!score) {
    logger.info(`create new user`);
    helpers.newUser(dbActions, msg, recieverId, points);
  } else { // otherwise, add points
    score.points += points // add the points to the user's total
    logger.info(`score for this person`);
    logger.info(score);
    dbActions.setScore.run(score); // Set the user's score in the database to the new score
  }

  const newscore = dbActions.getScore.get(recieverId, msg.guild.id); // gets the current score for the user that sent the message

  // respond to user that points were given to a member
  logger.info(`pts: ${points}`);
  logger.info(`given to: ${reciever}`)
  msg.reply(`\npts: ${points} \nto: ${reciever} \ntotal: ${newscore.points}`);
};
