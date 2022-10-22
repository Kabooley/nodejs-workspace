var express = require('express');
var router = express.Router();
//first add the reference to the controller
var controller = require('../controller');

/* GET home page. */
router.get('/', controller.home);

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
