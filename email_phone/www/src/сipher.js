var crypto = require('crypto');
var fs = require('fs');
var config = require('../config/config');

var Cipher = function() {
    this.salt = null;
    this.algorithm = 'aes-256-ctr';
};

Cipher.prototype.createSalt = function(resolve) {
    var that = this;
    fs.readFile('../salt', config.DEFAULT_ENCODING, function (err, data) {
        if (err) {
            return console.log(err);
        }
        that.salt = data;
        resolve();
    });
    return this;
};

Cipher.prototype.encrypt = function(text) {
    var cipher = crypto.createCipher(this.algorithm, this.salt);
    var crypted = cipher.update(text, config.DEFAULT_ENCODING, 'hex');
    crypted += cipher.final('hex');
    return crypted;
};
 
Cipher.prototype.decrypt = function (text) {
    var decipher = crypto.createDecipher(this.algorithm, this.salt);
    var dec = decipher.update(text, 'hex', config.DEFAULT_ENCODING);
    dec += decipher.final(config.DEFAULT_ENCODING);
    return dec;
};


module.exports = {
    getCipher: function() {
        return new Cipher();
    }
};