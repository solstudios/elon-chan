const config = require('../config.json');

// checks if a sender has a team. returns team, otherwise null
exports.userHasRole = (sender) => {
  for (let i = 0; i < config.roles.length; i++) {
    if (sender.roles.find(role => role.name === config.roles[i]))
      return config.roles[i];
  }
  return null;
}

exports.isRole = (val) => {
  return config.roles.indexOf(val) >= 0;
}

exports.idParse = (idString) => {
  if (idString.length >= 3) {
    return idString.substring(2, idString.length - 1);
  }
  return "";
}

exports.addToUser = (dbActions, msg, userId, points) => {
  // gets the current score for the user that sent the message
  let user = dbActions.getScore.get(userId, msg.guild.id);
  let score = 0;

  // if that user doesn't exist, create a new user with the proper amount of points
  if (!user) {
    user = {
      id: `${msg.guild.id}-${userId}`,
      user: userId,
      guild: msg.guild.id,
      points: points,
    }
    score = points;
  } else { // otherwise, add points
    user.points += points // add the points to the user's total
    score = user.points;
  }

  dbActions.setScore.run(user); // Set the user's score in the database to the new score
  return score;
}

// creates new user in database with proper points
// exports.newUser = (dbActions, msg, userId, points) => {
//   const user = {
//     id: `${msg.guild.id}-${userId}`,
//     user: userId,
//     guild: msg.guild.id,
//     points: points,
//   }
//   // TODO: add implementaion to ask the point assigner to set a team for the new User
//   dbActions.setScore.run(user); // Set the user's score in the database to the new score
// }

exports.isId = (idString) => {
  return (
    idString.substring(0,2) === "<@" &&
    idString.slice(-1) === ">"
  );
}


//creates new Role in the database with X points, or, if that role already exists, adds the specified amount of points to that role
exports.addToRole = (dbActions, msg, roleText, rolePoints) => {
    // gets the current score for the role sent in the message
    let roleItem = dbActions.getRoleScore.get(roleText, msg.guild.id);
    let score = 0;

    console.log(roleItem)

    // if that role doesn't exist, create a new role with the proper amount of points
    if(!roleItem){
        roleItem = {
            id: `${msg.guild.id}-${roleText}`,
            role: roleText,
            guild: msg.guild.id,
            points: rolePoints,
        }
        score = rolePoints;
    } else { // otherwise, add points
        roleItem.points += rolePoints // add the points to the user's total
        score = roleItem.points;
    }

    dbActions.setRoleScore.run(roleItem); // Set the role's score in the database to the new score
    return score;
}