var express = require('express');
var router = express.Router();
var PhoneEmail = require('../models/PhoneEmail');
var cipherModule = require('../src/сipher');
var nodemailer = require('nodemailer');
var config = require('../config/config');
var util = require('../src/util');

router.get('/', function(req, res, next) {

    var phoneEmailMap = {};
    var data = PhoneEmail.getAll({}, function(err, data) {
        if (err) throw err;

        var cipher = cipherModule.getCipher();

        var promise = new Promise(function(resolve, reject) {
            try {
                cipher.createSalt(resolve);
            }
            catch(e) {
                console.log(err);
                reject();
            }
        });
        promise.then(function (val) {
            data.forEach(function(phoneEmail) {
                phoneEmail.phone = util.hidePartOfNumber(cipher.decrypt(phoneEmail.phone));
                phoneEmail.email = cipher.decrypt(phoneEmail.email);
                phoneEmailMap[phoneEmail._id] = phoneEmail;
            });
            res.render('phone_email_index', {
                'data': phoneEmailMap
            });
        });
    });
    
});

router.get('/add', function(req, res, next) {
    res.render('phone_email_add');
});

router.get('/rememberphone/:id', function(req, res, next) {
    
    var id = req.params.id, 
        currentPhoneEmail, 
        email, 
        phone,
        cipher;

    var promise = new Promise(function(resolve, reject) {
        cipher = cipherModule.getCipher();
        cipher.createSalt(resolve);
    });
    promise.then(function() {
        var getCurrentPhoneEmail = PhoneEmail.getById(id, function(err, data) {
            if (err) throw err;
            currentPhoneEmail = data;
            email = cipher.decrypt(currentPhoneEmail.email);
            phone = cipher.decrypt(currentPhoneEmail.phone);

            var transporter = nodemailer.createTransport({
                service: config.MAIL_SERVICE,
                auth: {
                    user: config.MAIL_USER,
                    pass: config.PASSWORD
                }
            });

            var mailOptions = {
                from: 'Our site <' + config.MAIL_USER + '>',
                to: email,
                subject: 'Restrore phone',
                text: 'Your phone - ' + phone
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    res.render('phone_email_remember', {
                        'message': 'Can not send email to ' + email
                    });
                } else {
                    res.render('phone_email_remember', {
                        'message': 'message Sent: ' + info.response
                    });
                }
            });
        });
    });   
});


router.post('/add', function(req, res, next) {
    var phone = req.body.phone;
    var email = req.body.email;

    // Form Validation
    req.checkBody('phone', 'Phone field is required').notEmpty();
    req.checkBody('phone', 'Phone not valid').isInt();
    req.checkBody('phone', 'Phone length must be between 2 and 20 characters').len(1, 20);

    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email not valid').isEmail();

    // Check for errors
    var errors = req.validationErrors();

    if(errors){
        res.render('phone_email_add', {
            errors: errors,
            phone: phone,
            email: email
        });
    } 
    else {
        var cipher = cipherModule.getCipher();

        var promise = new Promise(function(resolve, reject) {
            try {
                cipher.createSalt(resolve);
            }
            catch(e) {
                console.log(err);
                reject();
            }
        });
        promise.then(function (val) {
            var newPhoneEmail = new PhoneEmail({
                phone: cipher.encrypt(phone),
                email: cipher.encrypt(email)
            });

            // Create record
            PhoneEmail.createPhoneEmail(newPhoneEmail, function(err, user){
                if (err) throw err;
                console.log(user);
            });

            //Success Message
            req.flash('success', 'You added new phone/email');

            res.location('/');
            res.redirect('/');
        });
    }
});

module.exports = router;
