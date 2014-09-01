var phantom = require('phantom');
var MongoClient = require('mongodb').MongoClient;

// For each document, check if selector value has changed.

var priceAlerts;
var checkDocs = [];
var ph;

phantom.create(function(phtmp) {
  ph = phtmp;
  MongoClient.connect('mongodb://127.0.0.1:27017/PriceDetector', function(err, db) {
    if (err) throw err;
    priceAlerts = db.collection('PriceAlerts');

    priceAlerts.find().toArray(function(err, docs) {
      docs.map(function(doc) {
        checkDocs.push(doc);
      }); // docs.map

      checkDoc(0);
    }); // priceAlerts.find
  }); // MongoClient.connect
}); // phantom.create

function checkDoc(idx) {
  if (idx == checkDocs.length) {
    console.log('Done.');
    ph.exit();
    process.kill();  // ph.exit doesn't wrok great
    return;
  }
  var doc = checkDocs[idx];
  ph.createPage(function(page) {
    page.set('settings.loadImages', false);
    page.set('settings.userAgent',
             'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36');
    page.set('settings.resourceTimeout', 3000);
    doCheckDoc(page, doc, function() {
      checkDoc(idx + 1);
    });
  });
}

function doCheckDoc(page, doc, cb) {
  console.log('Opening', doc.url, '...');
  page.open(doc.url, function(status) {
    console.log('Opened', doc.url, status);
    page.evaluate('function() { return document.querySelector("' + doc.selector + '").innerHTML; }', function(result) {
      console.log('Evaluated selector to', result);
      var now = +new Date();
      if (result && result != doc.lastValue) {
        // New value!
        console.log('Noticed a change in value of', doc.selector, 'on', doc.url);
        var updatedValues = {
          lastValue: result,
          lastChecked: now,
        };
        if (doc.lastValue) {
          // Don't record a change if it's the first time we've seen the value.
          updatedValues.lastChanged = now;
        }
        priceAlerts.update({_id: doc._id}, {$set: updatedValues}, function(err, inserted) {
          if (err) throw err;
          cb();
        });
      } else {
        // No change, or element isn't present on page.
        priceAlerts.update({_id: doc._id}, {$set: {
          lastChecked: now,
        }}, function(err, inserted) {
          if (err) throw err;
          cb();
        });
      }
    });
  });
}
