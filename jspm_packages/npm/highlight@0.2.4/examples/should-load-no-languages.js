/* */ 
(function() {
  "use strict";
  var Highlight = require('../lib/highlight'),
      assert = require('assert'),
      fs = require('fs'),
      reHasMarkup = /<.*class=["']?[\w-]+["'?]/,
      reHasAnnotations = /\sclass="[\w-]+"/;
  ;
  function runTest(err) {
    assert.ok(!err, err && err.message);
    assert.strictEqual(0, Highlight.loadedLanguages.length, 'some languages were loaded: ' + Highlight.languages.length + " " + Highlight.loadedLanguages.length);
    fs.readFile('./example.js', 'utf8', function(err, text) {
      var annotated;
      ;
      assert.ok(!err, 'threw error reading example.js');
      annotated = Highlight.highlight(text, '  ');
      assert.ok(!annotated.match(reHasAnnotations));
      console.info('[PASS] source is not annotated');
    });
  }
  Highlight.init(runTest, []);
}());
