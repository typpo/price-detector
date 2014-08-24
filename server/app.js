var express = require('express')
  , http = require('http')
  , process = require('process')
  , fs = require('fs')
  , path = require('path')
  , MongoClient = require('mongodb').MongoClient

// Db
var priceAlerts;
MongoClient.connect('mongodb://127.0.0.1:27017/PriceDetector', function(err, db) {
  if (err) throw err;
  priceAlerts = db.collection('PriceAlerts');
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.cookieParser());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/watch', function(req, resp) {
  priceAlerts.insert({
    user: req.query.user,
    url: req.query.url,
    selector: req.query.selector
  }, function(err, docs) {
    resp.send({success: true});
  });
});

// Process stuff
process.on('uncaughtException', function (error) {
 console.error(error.stack);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
