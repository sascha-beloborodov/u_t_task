var config = require('../config/config');

var FileManager = function(name) {
    this.name = name;
    this.errors = null;
    this.fileLocation = config.FILE_LOCATION + config.ORIGINAL_FILE_NAME;
};

FileManager.prototype.getFileLocation = function() {
    return this.fileLocation;
};

FileManager.prototype.getName = function() {
    return this.name;
};

FileManager.prototype.setErrors = function(err) {
    this.errors = err;
};

FileManager.prototype.getErrors = function() {
    return this.errors;
};

FileManager.prototype.checkName = function(req) {
    req.checkQuery(config.NAME_OF_PARAM, 'File name can not be empty').notEmpty();
    req.checkQuery(config.NAME_OF_PARAM, 'Invalid file name').isAlpha();
    req.checkQuery(config.NAME_OF_PARAM, 'Length of file name must be from 1 to 60 characters').len(1, 50);
};

FileManager.prototype.isInvalidName = function(req) {
  var errors = req.validationErrors();
  if (errors) {
      this.setErrors(errors);
      return true;
  }
  return false;
};


module.exports = {
    createFile: function(name) {
        return new FileManager(name);
    }
};