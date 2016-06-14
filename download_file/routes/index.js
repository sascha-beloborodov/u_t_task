var express = require('express');
var router = express.Router();
var fileManager = require('../src/FileManager');
var fs = require('fs');
var config = require('../config/config');

function giveFile(query, req, res) {
    var file = fileManager.createFile(query);
    file.checkName(req);
    if (file.isInvalidName(req)) {
        res.cookie(config.COOKIE_NAME, null, {
            maxAge: -1, 
            httpOnly: true 
        });
        res.render('index', { 
            title: 'Error',
            messages: file.getErrors()
        });
        return;
    }
    res.setHeader('Content-disposition', 'attachment; filename=' + file.getName() + '.doc');
    res.setHeader('Content-type', 'application/msword');
    fs.createReadStream(file.getFileLocation()).pipe(res);
    return;
}

function setCookie(res, req, ref) {

      res.cookie(config.COOKIE_NAME, ref || '', {
          maxAge: config.EXPIRATION_COOKIE, 
          httpOnly: true 
      });
      res.setHeader('Refresh', '0');
      res.render('index', { 
          title: 'Express',
          messages: ['Downloading ...'] 
      });
      return;
}

router.get('/', function(req, res, next) {
  
    var referer = req.header('Referer') || req.header('Referrer');
    var refFromCookie = req.cookies[config.COOKIE_NAME];

    if (!refFromCookie) {
        setCookie(res, req, referer);
    }
    else if (refFromCookie != referer && referer != config.SITE_URL) {
        setCookie(res, req, referer);
    }
    // if (referer && !refFromCookie) {
    //     if (referer != refFromCookie && referer != config.SITE_URL) {
            
    //     }
    //     else {
    //         setCookie(res, req, refFromCookie);
    //     }
    //     return;
    // }

    var query = req.query[config.NAME_OF_PARAM];
    if (!!query) {
        giveFile(query, req, res);
    }
    else {
        res.render('index', { 
            title: 'Express',
            messages: ['Unfortunately, file can not be downloaded'] 
        });
    }
});

module.exports = router;
