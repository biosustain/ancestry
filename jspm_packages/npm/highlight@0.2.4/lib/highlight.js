/* */ 
var self = this;
(function() {
  "use strict";
  var Highlight = module.exports,
      fs = require('fs'),
      hljs = require('./vendor/highlight.js/highlight').hljs,
      langRelPath = "vendor/highlight.js/languages/",
      langPath = __dirname + "/" + langRelPath,
      reEndsWithJs = /\.js$/i,
      loadedMap = {},
      availableMap = {};
  ;
  Highlight.loadedLanguages = [];
  function acceptJsFiles(lang) {
    if (lang.match(reEndsWithJs)) {
      return true;
    }
  }
  function preRequireModules(lang, i, arr) {
    arr[i] = lang = lang.replace(reEndsWithJs, '');
    try {
      availableMap[lang] = require('./' + langRelPath + lang);
    } catch (e) {
      console.error("[ERROR] could not preload language pack for '" + lang + "'");
      console.error(e.message);
      console.error(e.stack);
      return;
    }
  }
  function preloadLanguages(err, fsnodes) {
    if (err) {
      console.error("[ERROR] langPath '" + langPath + "'");
      console.error(err.message);
      console.error(err.stack);
      return;
    }
    Highlight.languages = fsnodes.filter(acceptJsFiles).sort(function(a, b) {
      if ('xml' === a) {
        return -100000000;
      }
      if ('django.js' === a) {
        return 1000000000;
      }
      if (a === b) {
        return 0;
      }
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });
    Highlight.languages.forEach(preRequireModules);
  }
  function loadLangs(cb, langs) {
    var err;
    ;
    if ('string' === typeof langs) {
      langs = [langs];
    }
    if (!Array.isArray(langs)) {
      cb(new Error("no array of languages given"));
      return;
    }
    langs.some(function(lang) {
      var addLangToHighlightInstance;
      ;
      if (loadedMap[lang]) {
        return;
      }
      addLangToHighlightInstance = availableMap[lang];
      if (!addLangToHighlightInstance) {
        err = new Error("No language pack available for '" + lang + "'");
        return true;
      }
      try {
        addLangToHighlightInstance(hljs);
      } catch (e) {
        console.warn('[WARN] failed to load', lang);
        console.warn(e.message);
        console.warn(e.stack);
        Highlight.languages = Highlight.languages.filter(function(l) {
          return l !== lang;
        });
        return;
      }
      loadedMap[lang] = true;
      Highlight.loadedLanguages.push(lang);
    });
    cb(err);
  }
  function init(cb, langs, opts) {
    if (!Array.isArray(langs)) {
      langs = Highlight.languages.slice();
    }
    loadLangs(cb, langs);
  }
  function highlight(text, tabReplace, useCodeBlocks) {
    tabReplace = tabReplace || '    ';
    text = text.replace(/\r\n|\r|\n/g, '\n');
    if (!!useCodeBlocks) {
      return text.replace(/\n/g, '\uffff').replace(/<code([^>]*)>(.*?)<\/code>/gm, function(original, attrs, source) {
        return '<code' + attrs + '>' + hljs.highlightText(source.replace(/\uffff/g, "\n"), tabReplace) + '</code>';
      }).replace(/&amp;(\w+;)/g, '&$1').replace(/\uffff/g, "\n");
    } else {
      return hljs.highlightText(text, tabReplace);
    }
  }
  preloadLanguages(null, fs.readdirSync(langPath));
  Highlight.init = init;
  Highlight.highlight = highlight;
  function backwardsCompat() {
    Highlight.init(function() {}, ['php']);
    return Highlight.highlight.apply(null, arguments);
  }
  Highlight.Highlight = self.Highlight = backwardsCompat;
}());
