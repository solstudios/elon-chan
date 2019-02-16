const config = require('../config.json');
const helpers = require('./helpers');

exports.pointsTo = (args, msg, logger, dbActions) => {
  logger.info('checking points');
  logger.info(args);

  if (args.length != 4) return;

  // X points to/for Y
  let points;
  if (args[0] in config.point_types) {
    points = config.point_types[args[0]]
  } else {
    points = parseInt(args[0], 10);
  }
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
  if (!sender.roles.find(role => role.name === config.admin)) {
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
  let recieverTeam = null;

  if (helpers.isId(oldName)) { // is user id
    let reciever = null;
    let recieverId = null;

    //parses the tagged user to get just the ID
    recieverId = helpers.idParse(oldName);
    reciever = msg.guild.members.get(recieverId);

    logger.info(msg.guild);
    logger.info(`trying to give user "${reciever}" points`);

    if (!reciever) {
      logger.info(`${oldName} does not exist, so points could not be given`);
      msg.reply(`${oldName} does not exist, so points could not be given`);
      return;
    }

    let score = helpers.addToUser(dbActions, msg, recieverId, points);

    // respond to user that points were given to a member
    logger.info(`pts: ${points}`);
    logger.info(`given to: user ${reciever}`)
    msg.reply(`\npts: ${points} \nto: ${reciever} \ntotal: ${score}`);

    recieverTeam = helpers.userHasRole(sender)

  } else { // trying to give points only to a role or invalid
    // if query is not for a user, it is a role or invalid
    logger.info(`trying to give a role or other points`);

    // check if points are trying to be given to a role
    logger.info(`the oldname ${oldName}`);
    if (helpers.isRole(oldName))
      recieverTeam = oldName
  }

  logger.info(`reciever's Team is ${recieverTeam}`);

  // if has no team, then stop
  if (!recieverTeam) return;
  // otherwise add points to their team role
  let roleScore = helpers.addToRole(dbActions, msg, recieverTeam, points);

  // msg user that points ere given to role
  logger.info(`pts: ${points}`);
  logger.info(`given to: role ${recieverTeam}`)
  msg.reply(`\npts: ${points} \nto: ${recieverTeam} \ntotal: ${roleScore}`);
  return;
};
