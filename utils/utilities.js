const fs = require("fs");

exports.isArray = (obj) => {
  return Array.isArray(obj);
};

exports.shortDate = (str) => {
  const shortStr = str.substr(0, str.indexOf("GMT"));
  return shortStr;
};

exports.textDirection = (str) => {
  const strArr = str.split(" ");
  newStr = strArr.reverse().join(" ");
  return newStr;
};

exports.deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

exports.toIsoDate = (date, str) => {
  if (str === "start") {
    newDate = new Date(date);
    return newDate.toISOString();
  } else {
    newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 23);
    return newDate.toISOString();
  }
};
