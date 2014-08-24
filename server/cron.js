var phantom = require('phantom');
var MongoClient = require('mongodb').MongoClient;

// For each document, check if selector value has changed.

var priceAlerts;
phantom.create(function(ph) {
  MongoClient.connect('mongodb://127.0.0.1:27017/PriceDetector', function(err, db) {
    if (err) throw err;
    priceAlerts = db.collection('PriceAlerts');

    priceAlerts.find().toArray(function(err, docs) {
      docs.map(function(doc) {
        ph.createPage(function(page) {
          checkDoc(page, doc);
        });

      }); // docs.map
    }); // priceAlerts.find
  }); // MongoClient.connect
}); // phantom.create

function checkDoc(page, doc) {
  page.open(doc.url, function(status) {
    console.log('Opened', doc.url, status);

    page.evaluate('document.querySelector("' + doc.selector + '").innerHTML', function(result) {
      var now = +new Date();
      if (result && result != doc.lastValue) {
        // New value!
        console.log('Noticed a change in value of', doc.selector, 'on', doc.url);
        priceAlerts.update({_id: doc._id}, {$set: {
          lastValue: result,
          lastChanged: now,
          lastChecked: now,
        }});
      } else {
        // No change, or element isn't present on page.
        priceAlerts.update({_id: doc._id}, {$set: {
          lastChecked: now,
        }});
      }
    });
  });
}
