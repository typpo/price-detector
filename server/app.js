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
  var user = req.query.user;
  var url = req.query.url;
  var selector = req.query.selector;

  // TODO may need to canonicalize url, selector

  var newdoc = {
    user: user,
    url: url,
    selector: selector
  };
  priceAlerts.find(newdoc).toArray(function(err, docs) {
    if (docs.length > 0) {
      resp.send({success: false, error: 'duplicate'});
      return;
    }
    priceAlerts.insert(newdoc, function(err, docs) {
      resp.send({success: true});
    });
  });
});

app.get('/listWatches', function(req, resp) {
  var user = req.query.user;
  priceAlerts.find({
    user: user
  }).toArray(function(err, docs) {
    resp.send(docs);
  });
});

app.get('/getUpdates', function(req, resp) {
  var user = req.query.user;
  // If since isn't specified, default to last hour.
  var since = parseInt(req.query.since) || (+new Date() - 60*60*1000);
  priceAlerts.find({
    user: user,
    lastChanged: {$gt: since},
  }).toArray(function(err, docs) {
    resp.send(docs);
  });
});

// Process stuff
process.on('uncaughtException', function (error) {
 console.error(error.stack);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
