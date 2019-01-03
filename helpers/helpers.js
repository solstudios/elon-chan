// parses if with extra tag information (ex: <@XXXXXXX>)
exports.idParse = (idString) => {
  if (idString.length >= 3) {
    return idString.substring(2, idString.length - 1);
  }
  return "";
}
