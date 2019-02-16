const config = require('../config.json');
const helpers = require('./helpers');

const pointsToHelp = `
x points for/to y
  x: a number of points or type of points
  y: a valid user or team
`

const scoreOfHelp = `
score x
  x: a valid user or team
`
const pointsTypesHelp = (() => {
  let result = "info on point types\n";
  Object.keys(config.point_types).forEach(function(key) {
    result += `  ${key}: ${config.point_types[key]}\n`
  });
  return result;
})();

const help_info = {
  'points': pointsToHelp,
  'point_types': pointsTypesHelp,
  'score': pointsToHelp
}

const helpHelp = (() => {
  let result = "help info\n";
  Object.keys(help_info).forEach(function(key) {
    result += `  help ${key}\n`
  });
  return result;
})();

exports.help = (args, msg) => {
  const cmd = args[1];
  if (args.length == 2
      && cmd in help_info) {
    msg.reply(`${help_info[cmd]}`);
    return;
  }
  // default case return helphelp
  msg.reply(`${helpHelp}`);
}
