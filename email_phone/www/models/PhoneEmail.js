var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/phone-email');

var db = mongoose.connection;

// PhoneEmail Schema
var PhoneEmailSchema = mongoose.Schema({
    phone: {
        type: String,
        index: { unique: true }
    },
    email: {
        type: String
    },
    created_at: {
        type: String
    }
});

var PhoneEmail = module.exports = mongoose.model('PhoneEmail', PhoneEmailSchema);

module.exports.getById = function(id, callback) {
    PhoneEmail.findById(id, callback);
}

module.exports.getUserByPhone = function(phone, callback) {
    var query = { phone: phone };
    PhoneEmail.findOne(query, callback);
}

module.exports.createPhoneEmail = function(newPhoneEmail, callback) {
    newPhoneEmail.save(callback);
};

module.exports.getAll = function(data, callback) {
    PhoneEmail.find(callback);
};