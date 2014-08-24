var phantom = require('phantom');
var MongoClient = require('mongodb').MongoClient;

// For each document, check if selector value has changed.

var priceAlerts;
var pendingChecks = 0;
phantom.create(function(ph) {
  MongoClient.connect('mongodb://127.0.0.1:27017/PriceDetector', function(err, db) {
    if (err) throw err;
    priceAlerts = db.collection('PriceAlerts');

    priceAlerts.find().toArray(function(err, docs) {
      docs.map(function(doc) {
        pendingChecks++;
        ph.createPage(function(page) {
          checkDoc(page, doc);
        });
      }); // docs.map

      setInterval(function() {
        if (pendingChecks === 0) {
          console.log('Done.');
          ph.exit();
          process.kill();  // ph.exit doesn't wrok great
        }
      }, 100);
    }); // priceAlerts.find
  }); // MongoClient.connect
}); // phantom.create

function checkDoc(page, doc) {
  page.open(doc.url, function(status) {
    console.log('Opened', doc.url, status);
    page.evaluate('function() { return document.querySelector("' + doc.selector + '").innerHTML; }', function(result) {
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
          pendingChecks--;
        });
      } else {
        // No change, or element isn't present on page.
        priceAlerts.update({_id: doc._id}, {$set: {
          lastChecked: now,
        }}, function(err, inserted) {
          if (err) throw err;
          pendingChecks--;
        });
      }
    });
  });
}
