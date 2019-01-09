// parses if with extra tag information (ex: <@XXXXXXX>)
exports.idParse = (idString) => {
  if (idString.length >= 3) {
    return idString.substring(2, idString.length - 1);
  }
  return "";
}

// creates new user in database with proper points
exports.newUser = (dbActions, msg, userId, points) => {
  const user = {
    id: `${msg.guild.id}-${userId}`,
    user: userId,
    guild: msg.guild.id,
    points: points,
  }
  // TODO: add implementaion to ask the point assigner to set a team for the new User
  dbActions.setScore.run(user); // Set the user's score in the database to the new score
}

exports.isId = (idString) => {
  return (
    idString.substring(0,2) === "<@" &&
    idString.slice(-1) === ">"
  );
}
