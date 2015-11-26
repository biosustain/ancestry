"format amd";
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;
      exports[name] = value;

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if (typeof exports == 'object' || typeof exports == 'function') {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        if (firstLoad.__useDefault)
          return firstLoad['default'];
        else
          return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function($__System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['0', '1', '2'], ["1","1","2","1","2","1","2","1","2","1","2","1"], function($__System) {

$__System.registerDynamic("c", ["13"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("13"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("f", ["16"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("16"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("11", ["c", "17"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _getIterator = require("c")["default"];
  var _isIterable = require("17")["default"];
  exports["default"] = (function() {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;
      try {
        for (var _i = _getIterator(arr),
            _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i)
            break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"])
            _i["return"]();
        } finally {
          if (_d)
            throw _e;
        }
      }
      return _arr;
    }
    return function(arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (_isIterable(Object(arr))) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("14", ["18"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("18")["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("15", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("13", ["19", "1a", "1b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("19");
  require("1a");
  module.exports = require("1b");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("17", ["1c"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("1c"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("16", ["1d", "1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("1d");
  module.exports = require("1e").Object.keys;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("19", ["1f", "20"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("1f");
  var Iterators = require("20");
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1b", ["21", "22", "1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = require("21"),
      get = require("22");
  module.exports = require("1e").getIterator = function(it) {
    var iterFn = get(it);
    if (typeof iterFn != 'function')
      throw TypeError(it + ' is not iterable!');
    return anObject(iterFn.call(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("18", ["23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("23"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1a", ["24", "25"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $at = require("24")(true);
  require("25")(String, 'String', function(iterated) {
    this._t = String(iterated);
    this._i = 0;
  }, function() {
    var O = this._t,
        index = this._i,
        point;
    if (index >= O.length)
      return {
        value: undefined,
        done: true
      };
    point = $at(O, index);
    this._i += point.length;
    return {
      value: point,
      done: false
    };
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1c", ["19", "1a", "26"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("19");
  require("1a");
  module.exports = require("26");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1d", ["27", "28"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toObject = require("27");
  require("28")('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1e", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var core = module.exports = {};
  if (typeof __e == 'number')
    __e = core;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("20", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("21", ["29"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = require("29");
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1f", ["2a", "2b", "20", "2c", "25"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var setUnscope = require("2a"),
      step = require("2b"),
      Iterators = require("20"),
      toIObject = require("2c");
  require("25")(Array, 'Array', function(iterated, kind) {
    this._t = toIObject(iterated);
    this._i = 0;
    this._k = kind;
  }, function() {
    var O = this._t,
        kind = this._k,
        index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return step(1);
    }
    if (kind == 'keys')
      return step(0, index);
    if (kind == 'values')
      return step(0, O[index]);
    return step(0, [index, O[index]]);
  }, 'values');
  Iterators.Arguments = Iterators.Array;
  setUnscope('keys');
  setUnscope('values');
  setUnscope('entries');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("22", ["2d", "2e", "20", "1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = require("2d"),
      ITERATOR = require("2e")('iterator'),
      Iterators = require("20");
  module.exports = require("1e").getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("24", ["2f", "30"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = require("2f"),
      defined = require("30");
  module.exports = function(TO_STRING) {
    return function(that, pos) {
      var s = String(defined(that)),
          i = toInteger(pos),
          l = s.length,
          a,
          b;
      if (i < 0 || i >= l)
        return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("23", ["31"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("31");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("25", ["32", "33", "34", "35", "36", "2e", "20", "37", "31", "38"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var LIBRARY = require("32"),
      $def = require("33"),
      $redef = require("34"),
      hide = require("35"),
      has = require("36"),
      SYMBOL_ITERATOR = require("2e")('iterator'),
      Iterators = require("20"),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
    require("37")(Constructor, NAME, next);
    var createMethod = function(kind) {
      switch (kind) {
        case KEYS:
          return function keys() {
            return new Constructor(this, kind);
          };
        case VALUES:
          return function values() {
            return new Constructor(this, kind);
          };
      }
      return function entries() {
        return new Constructor(this, kind);
      };
    };
    var TAG = NAME + ' Iterator',
        proto = Base.prototype,
        _native = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
        _default = _native || createMethod(DEFAULT),
        methods,
        key;
    if (_native) {
      var IteratorPrototype = require("31").getProto(_default.call(new Base));
      require("38")(IteratorPrototype, TAG, true);
      if (!LIBRARY && has(proto, FF_ITERATOR))
        hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
    }
    if (!LIBRARY || FORCE)
      hide(proto, SYMBOL_ITERATOR, _default);
    Iterators[NAME] = _default;
    Iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        keys: IS_SET ? _default : createMethod(KEYS),
        values: DEFAULT == VALUES ? _default : createMethod(VALUES),
        entries: DEFAULT != VALUES ? _default : createMethod('entries')
      };
      if (FORCE)
        for (key in methods) {
          if (!(key in proto))
            $redef(proto, key, methods[key]);
        }
      else
        $def($def.P + $def.F * BUGGY, NAME, methods);
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("26", ["2d", "2e", "20", "1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = require("2d"),
      ITERATOR = require("2e")('iterator'),
      Iterators = require("20");
  module.exports = require("1e").isIterable = function(it) {
    var O = Object(it);
    return ITERATOR in O || '@@iterator' in O || Iterators.hasOwnProperty(classof(O));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("28", ["33", "1e", "39"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(KEY, exec) {
    var $def = require("33"),
        fn = (require("1e").Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $def($def.S + $def.F * require("39")(function() {
      fn(1);
    }), 'Object', exp);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("27", ["30"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var defined = require("30");
  module.exports = function(it) {
    return Object(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("29", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    return it !== null && (typeof it == 'object' || typeof it == 'function');
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2a", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function() {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2c", ["3a", "30"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var IObject = require("3a"),
      defined = require("30");
  module.exports = function(it) {
    return IObject(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2b", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(done, value) {
    return {
      value: value,
      done: !!done
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2e", ["3b", "3c", "3d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var store = require("3b")('wks'),
      Symbol = require("3c").Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || require("3d"))('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2f", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ceil = Math.ceil,
      floor = Math.floor;
  module.exports = function(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("30", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("31", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $Object = Object;
  module.exports = {
    create: $Object.create,
    getProto: $Object.getPrototypeOf,
    isEnum: {}.propertyIsEnumerable,
    getDesc: $Object.getOwnPropertyDescriptor,
    setDesc: $Object.defineProperty,
    setDescs: $Object.defineProperties,
    getKeys: $Object.keys,
    getNames: $Object.getOwnPropertyNames,
    getSymbols: $Object.getOwnPropertySymbols,
    each: [].forEach
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("34", ["35"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = require("35");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("32", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("33", ["3c", "1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("3c"),
      core = require("1e"),
      PROTOTYPE = 'prototype';
  var ctx = function(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  };
  var $def = function(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & $def.G,
        isProto = type & $def.P,
        target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {})[PROTOTYPE],
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal)
      source = name;
    for (key in source) {
      own = !(type & $def.F) && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      if (isGlobal && typeof target[key] != 'function')
        exp = source[key];
      else if (type & $def.B && own)
        exp = ctx(out, global);
      else if (type & $def.W && target[key] == out)
        !function(C) {
          exp = function(param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp[PROTOTYPE] = C[PROTOTYPE];
        }(out);
      else
        exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
      exports[key] = exp;
      if (isProto)
        (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
    }
  };
  $def.F = 1;
  $def.G = 2;
  $def.S = 4;
  $def.P = 8;
  $def.B = 16;
  $def.W = 32;
  module.exports = $def;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("35", ["31", "3e", "3f"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("31"),
      createDesc = require("3e");
  module.exports = require("3f") ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2d", ["40", "2e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = require("40"),
      TAG = require("2e")('toStringTag'),
      ARG = cof(function() {
        return arguments;
      }()) == 'Arguments';
  module.exports = function(it) {
    var O,
        T,
        B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' : typeof(T = (O = Object(it))[TAG]) == 'string' ? T : ARG ? cof(O) : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("38", ["36", "35", "2e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var has = require("36"),
      hide = require("35"),
      TAG = require("2e")('toStringTag');
  module.exports = function(it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG))
      hide(it, TAG, tag);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("36", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var hasOwnProperty = {}.hasOwnProperty;
  module.exports = function(it, key) {
    return hasOwnProperty.call(it, key);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("39", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("37", ["31", "35", "2e", "3e", "38"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("31"),
      IteratorPrototype = {};
  require("35")(IteratorPrototype, require("2e")('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: require("3e")(1, next)});
    require("38")(Constructor, NAME + ' Iterator');
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3a", ["40"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = require("40");
  module.exports = 0 in Object('z') ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3b", ["3c"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("3c"),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3d", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var id = 0,
      px = Math.random();
  module.exports = function(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3f", ["39"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = !require("39")(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3c", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var UNDEFINED = 'undefined';
  var global = module.exports = typeof window != UNDEFINED && window.Math == Math ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("40", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toString = {}.toString;
  module.exports = function(it) {
    return toString.call(it).slice(8, -1);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3e", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.register('0', ['1', '3', '4', '5', '6', '7', '8'], function (_export) {
    'use strict';

    var angular;
    return {
        setters: [function (_) {
            angular = _['default'];
        }, function (_2) {}, function (_3) {}, function (_4) {}, function (_5) {}, function (_6) {}, function (_7) {}],
        execute: function () {
            _export('default', angular.module('plotify', ['plotify.lineage', 'plotify.lineage-scatter', 'plotify.box', 'plotify.violin', 'plotify.line']));
        }
    };
});
$__System.register('5', ['1', '2', '9', 'c', 'b', 'a'], function (_export) {
    var angular, d3, _getIterator, d3tooltip;

    function BoxPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selected: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-box-plot");

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var margin = { top: 40, right: 40, bottom: 120, left: 80 };

                var width = undefined,
                    height = undefined;

                var boxGroupMinWidth = 8,
                    boxGroupMaxWidth = 100,
                    boxGroupSpacing = 10,
                    boxGroupWidth = undefined,
                    chartWidth = undefined,
                    selectionMargin = 30,
                    transitionDuration = 200;

                var chart = undefined,
                    boxPlot = undefined,
                    tooltip = new d3tooltip(d3.select(element[0]));

                var boxGroupArea = undefined,
                    selectedBoxes = {},
                    updated = true,
                    colours = null;

                // based on Mike Bostock's code for box plots
                d3.box = function () {
                    var width = 1,
                        height = 1,
                        domain = null,
                        value = Number,
                        whiskers = boxWhiskers,
                        quartiles = boxQuartiles,
                        tickFormat = null,
                        maxWhiskerWidth = 30;

                    // For each small multiple…
                    function box(g) {
                        g.each(function (d, i) {
                            var _this = this;

                            var name = d.name,
                                colour = colours(d.seriesName);
                            d = d.data.map(value).sort(d3.ascending);
                            var g = d3.select(this),
                                n = d.length,
                                min = d[0],
                                max = d[n - 1];

                            // Compute quartiles. Must return exactly 3 elements.
                            var quartileData = d.quartiles = quartiles(d);

                            // Compute whiskers. Must return exactly 2 elements, or null.
                            var whiskerIndices = whiskers && whiskers.call(this, d, i),
                                whiskerData = whiskerIndices && whiskerIndices.map(function (i) {
                                return d[i];
                            });

                            // Compute outliers. If no whiskers are specified, all data are "outliers".
                            // We compute the outliers as indices, so that we can join across transitions!
                            var outlierIndices = whiskerIndices ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n)) : d3.range(n);

                            // Compute the new x-scale.
                            var x1 = d3.scale.linear().domain(domain && domain.call(this, d, i) || [min, max]).range([height, 0]);

                            // Note: the box, median, and box tick elements are fixed in number,
                            // so we only have to handle enter and update. In contrast, the outliers
                            // and other elements are variable, so we need to exit them! Variable
                            // elements also fade in and out.

                            // Update center line: the vertical line spanning the whiskers.
                            var center = g.selectAll("line.center").data(whiskerData ? [whiskerData] : []);

                            center.enter().insert("line", "rect").attr("class", "center");

                            center.attr("x1", width / 2).attr("x2", width / 2).attr("y1", function (d) {
                                return x1(d[0]);
                            }).attr("y2", function (d) {
                                return x1(d[1]);
                            });

                            // Update innerquartile box.
                            var box = g.selectAll("rect.box").data([quartileData]);

                            box.enter().append("rect").attr("class", "box");

                            box.attr("x", 0).attr("y", function (d) {
                                return x1(d[2]);
                            }).attr("width", width).attr("height", function (d) {
                                return x1(d[0]) - x1(d[2]);
                            });

                            // Update median line.
                            var medianLine = g.selectAll("line.median").data([quartileData[1]]);

                            medianLine.enter().append("line").attr("class", "median");

                            medianLine.attr("x1", 0).attr("x2", width).attr("y1", x1).attr("y2", x1);

                            // Update whiskers.
                            var whisker = g.selectAll("line.whisker").data(whiskerData || []);

                            whisker.enter().insert("line", "circle, text").attr("class", "whisker");

                            var whiskerWidth = width.clamp(0, maxWhiskerWidth);

                            whisker.attr("x1", (width - whiskerWidth) / 2).attr("x2", (width + whiskerWidth) / 2).attr("y1", x1).attr("y2", x1);

                            // Update outliers.
                            var outlier = g.selectAll("circle.outlier").data(outlierIndices, Number);

                            outlier.enter().insert("circle", "text").attr("class", "outlier");

                            outlier.attr("r", 3).attr("cx", width / 2).attr("cy", function (i) {
                                return x1(d[i]);
                            }).style("opacity", 1);

                            // Compute the tick format.
                            var format = tickFormat || x1.tickFormat(100);

                            // Update box ticks.
                            var boxTick = g.selectAll("text.box").data(quartileData);

                            if (selectedBoxes[name]) {
                                boxTick.enter().append("text").attr("class", "box");

                                boxTick.attr("dy", ".3em").attr("dx", function (d, i) {
                                    return i & 1 ? 6 : -6;
                                }).attr("x", function (d, i) {
                                    return i & 1 ? width : 0;
                                }).attr("y", x1).attr("text-anchor", function (d, i) {
                                    return i & 1 ? "start" : "end";
                                }).text(format);
                            } else {
                                boxTick.remove();
                            }

                            // Update whisker ticks. These are handled separately from the box
                            // ticks because they may or may not exist, and we want don't want
                            // to join box ticks pre-transition with whisker ticks post-.
                            var whiskerTick = g.selectAll("text.whisker").data(whiskerData || []);

                            if (selectedBoxes[name]) {
                                whiskerTick.enter().append("text").attr("class", "whisker");

                                whiskerTick.attr("dy", ".3em").attr("dx", 6).attr("x", (width + whiskerWidth) / 2).attr("y", function (d, i) {
                                    return i ? x1(d) - 3 : x1(d) + 3;
                                }).text(format);
                            } else {
                                whiskerTick.remove();
                            }

                            var label = g.selectAll("text.box-name").data([name]);

                            label.enter().append("text").attr("class", "box-name");

                            label.attr("dy", "5px").attr("text-anchor", "end").attr("transform", 'translate(' + width / 2 + ',' + (height + 5) + ') rotate(-90)').style("fill", colour).text(function (d) {
                                return d;
                            });

                            label.each(function (d) {
                                var rect = this.getBoundingClientRect();
                                if (rect.height > margin.bottom) {
                                    d3.select(this).text(d.slice(0, margin.bottom / rect.height * d.length - 3) + "...");
                                }
                            });

                            var clickRect = g.selectAll("rect.click-capture").data([1]);

                            clickRect.enter().append('rect').attr('class', 'click-capture').style('visibility', 'hidden');

                            clickRect.attr('x', function () {
                                return selectedBoxes[name] ? -selectionMargin : 0;
                            }).attr('y', 0).attr('width', function () {
                                return selectedBoxes[name] ? width + 2 * selectionMargin : width;
                            }).attr('height', height);

                            if (selectedBoxes[name]) {
                                selectBox();
                            }

                            clickRect.on("mouseover", function () {
                                if (!selectedBoxes[name]) g.call(applyColour);
                                var text = '<div class="tooltip-colour-box" style="background-color: ' + colour + '"></div>' + ('<span class="tooltip-text">' + name + '</span>');
                                tooltip.html(text).show().position(getTooltipPosition(_this));
                            }).on("mouseout", function (d) {
                                if (!selectedBoxes[name]) g.call(unapplyColour);
                                tooltip.hide();
                            }).on("click", click);

                            function getTooltipPosition(boxElement) {
                                var groupPos = boxElement.getBoundingClientRect();
                                return [(groupPos.right + groupPos.left) / 2, groupPos.top];
                            }

                            function click(d) {
                                if (d3.event.defaultPrevented) return;
                                if (selectedBoxes[name]) {
                                    selectedBoxes[name] = false;
                                    deselectBox();
                                } else {
                                    selectedBoxes[name] = true;
                                    selectBox();
                                }
                                update(boxGroupArea, true);
                                var tooltipPos = tooltip.position();
                                tooltipPos[0] += selectedBoxes[name] ? selectionMargin : -selectionMargin;
                                tooltip.move(tooltipPos, transitionDuration);
                            }

                            function selectBox() {
                                g.call(applyColour);
                            }

                            function deselectBox() {
                                g.call(unapplyColour);
                            }
                        });
                        d3.timer.flush();
                    }

                    box.width = function (x) {
                        if (!arguments.length) return width;
                        width = x;
                        return box;
                    };

                    box.height = function (x) {
                        if (!arguments.length) return height;
                        height = x;
                        return box;
                    };

                    box.tickFormat = function (x) {
                        if (!arguments.length) return tickFormat;
                        tickFormat = x;
                        return box;
                    };

                    box.domain = function (x) {
                        if (!arguments.length) return domain;
                        domain = x == null ? x : d3.functor(x);
                        return box;
                    };

                    box.value = function (x) {
                        if (!arguments.length) return value;
                        value = x;
                        return box;
                    };

                    box.whiskers = function (x) {
                        if (!arguments.length) return whiskers;
                        whiskers = x;
                        return box;
                    };

                    box.quartiles = function (x) {
                        if (!arguments.length) return quartiles;
                        quartiles = x;
                        return box;
                    };

                    return box;
                };

                function update(target, transitions, newData) {
                    var selectedCount = 0;

                    var boxContainers = target.selectAll("g.box-container");

                    var data = scope.value.data;

                    if (scope.selected.length) {
                        data = data.filter(function (d) {
                            return scope.selected.indexOf(d.name) !== -1;
                        });
                    }

                    var extents = [];
                    // calculate extents of values of every node
                    data.forEach(function (series) {
                        extents = extents.concat(d3.extent(series.values));
                    });
                    var extent = d3.extent(extents),
                        min = extent[0],
                        max = extent[1],
                        marginRatio = 0.05;

                    var selectedNum = 0;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _getIterator(data), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var b = _step.value;

                            selectedNum += selectedBoxes[b.name] ? 1 : 0;
                        }

                        // calculate optimal width of a box plot
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    boxGroupWidth = ((width - boxGroupSpacing * (data.length - 1) - selectedNum * selectionMargin * 2) / data.length).clamp(boxGroupMinWidth, boxGroupMaxWidth);

                    // calculate the total width of the whole chart
                    chartWidth = data.length * (boxGroupWidth + boxGroupSpacing) + selectedNum * selectionMargin * 2 - boxGroupSpacing;

                    // define function for plotting box plots
                    boxPlot = d3.box().whiskers(iqr(1.5)).width(boxGroupWidth).height(height).domain([(1 - marginRatio) * min, max]);

                    // calculate offset for the left margin to align the plot to the center
                    var leftMargin = ((width + margin.right + margin.left) / 2 - chartWidth / 2).clamp(margin.left, Infinity);

                    var yScale = d3.scale.linear().domain([0.95 * min, max]).range([height, 0]);

                    var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(-width);

                    chart.attr("transform", 'translate(' + 0 + ', ' + margin.top + ')');

                    svg.select("g.axis").attr("transform", 'translate(' + (margin.left - 10) + ',0)').call(yAxis);

                    data = data.map(function (d, i) {
                        return {
                            name: d.name,
                            data: d.values,
                            seriesName: d.seriesName,
                            i: i
                        };
                    });

                    // bind data
                    boxContainers = boxContainers.data(data, function (d) {
                        return d.name;
                    });

                    // add new containers for new data
                    boxContainers.enter().append("g").attr("class", "box-container");

                    boxContainers.call(boxPlot);

                    // remove unbound containers
                    var boxExit = boxContainers.exit();
                    boxExit.each(function (d) {
                        return selectedBoxes[d.name] = false;
                    });
                    boxExit.remove();

                    // update translation
                    boxContainers.each(function (d, i) {
                        var isSelected = selectedBoxes[d.name],
                            selectedOffset = isSelected ? selectionMargin : 0;

                        d.x = leftMargin + d.i * (boxGroupWidth + boxGroupSpacing) + selectedOffset + (isSelected ? selectedCount++ : selectedCount) * 2 * selectionMargin;
                    });

                    if (width >= Math.floor(chartWidth)) {
                        updated = true;
                        d3.select("g.scrollable-box-container").attr("transform", 'translate(0,0)');
                    }

                    if (transitions) boxContainers = boxContainers.transition().duration(transitionDuration);

                    boxContainers.attr("transform", function (d) {
                        return 'translate(' + d.x + ', 0)';
                    });
                }

                function applyColour(g) {
                    g.each(function (d, i) {
                        var n = d3.select(this),
                            elems = n.selectAll("line, rect, circle"),
                            circle = n.selectAll("circle"),
                            colour = colours(d.seriesName);

                        elems.style("stroke", colour);
                        elems.style("stroke-width", "2px");
                    });
                }

                function unapplyColour(g) {
                    g.each(function (d, i) {
                        var n = d3.select(this),
                            elems = n.selectAll("line, rect, circle"),
                            circle = n.selectAll("circle");

                        elems.style("stroke", "#000");
                        circle.style("stroke", "#ccc");
                        elems.style("stroke-width", "1px");
                    });
                }

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    height = 400 - margin.top - margin.bottom;
                    width = elementWidth - margin.left - margin.right;

                    // don't continue rendering if there is no data
                    if (!scope.value) console.warn("No data to render.");

                    colours = d3.scale.category10().domain(scope.value.data.map(function (d) {
                        return d.seriesName;
                    }));

                    // set up svg and bind scroll behaviour on drag
                    svg.data([{ x: 0, y: 0 }]).attr("width", "100%").attr("height", height + margin.top + margin.bottom).call(scroll(dragmove, dragEnd));

                    // define a clip path to clip the box plots outside the scroll area
                    var clip = svg.append("defs").append("svg:clipPath").attr("id", "clip-box-plot").append("svg:rect").attr("id", "clip-rect").attr("x", margin.left - 5).attr("y", "-20").attr("width", width + 10).attr("height", height * 2);

                    chart = svg.append("g");

                    chart.append("g").attr("class", "axis");

                    var clipBox = chart.append("g").attr("id", "scroll-clip-box").attr("clip-path", "url(#clip-box-plot)");

                    boxGroupArea = clipBox.append("g").attr("class", "scrollable-box-container");

                    update(boxGroupArea, options.transitions);
                }

                function dragEnd() {
                    d3.event.sourceEvent.stopPropagation();
                }

                function dragmove(d) {
                    if (updated) {
                        d.x = 0;
                        updated = false;
                    }
                    d.x = (d.x + d3.event.dx).clamp(width - chartWidth, 0);

                    d3.select("g.scrollable-box-container").attr("transform", 'translate(' + d.x + ',' + d.y + ')');
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ transitions: false });
                });

                scope.$watch("value", function () {
                    selectedBoxes = {};
                    render({ transitions: true });
                });

                scope.$watch("selected", function (selected) {
                    update(boxGroupArea, true, true);
                });
            }
        };
    }

    function boxWhiskers(d) {
        return [0, d.length - 1];
    }

    function boxQuartiles(d) {
        return [d3.quantile(d, .25), d3.quantile(d, .5), d3.quantile(d, .75)];
    }

    // Returns a function to compute the interquartile range.
    function iqr(k) {
        return function (d, di) {
            var q1 = d.quartiles[0],
                q3 = d.quartiles[2],
                iqr = (q3 - q1) * k,
                i = -1,
                j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
        };
    }

    function scroll(dragHandler, dragStopHandler) {
        var drag = d3.behavior.drag();
        drag.on("drag", dragHandler).on("dragend", dragStopHandler);
        return drag;
    }

    return {
        setters: [function (_2) {
            angular = _2['default'];
        }, function (_3) {
            d3 = _3['default'];
        }, function (_) {}, function (_c) {
            _getIterator = _c['default'];
        }, function (_b) {}, function (_a) {
            d3tooltip = _a.d3tooltip;
        }],
        execute: function () {
            'use strict';

            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };
            _export('default', angular.module('plotify.box', ['plotify.utils']).directive('boxPlot', BoxPlotDirective));
        }
    };
});
$__System.register('6', ['1', '2', '9', 'd', 'a'], function (_export) {
    'use strict';

    var angular, d3, d3tooltip;

    function ViolinPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selected: '='
            },
            link: function link(scope, element, attributes) {
                element.addClass("plotify plotify-violin-plot");

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var margin = { top: 40, right: 40, bottom: 120, left: 80 };

                var width = undefined,
                    height = undefined;

                var violinGroupMinWidth = 12,
                    violinGroupMaxWidth = 100,
                    violinGroupSpacing = 10,
                    violinGroupWidth = undefined,
                    chartWidth = undefined,
                    resolution = 8;

                var chart = undefined,
                    violinPlot = undefined,
                    tooltip = new d3tooltip(d3.select(element[0]));

                var violinGroupArea = undefined,
                    updated = true,
                    colours = null,
                    dotScale = d3.scale.linear().domain([violinGroupMinWidth, violinGroupMaxWidth]).range([1.2, 2]);

                d3.violin = function () {
                    var width = 1,
                        height = 1,
                        domain = null,
                        value = Number,
                        tickFormat = null,
                        dotRadius = undefined;

                    // For each small multiple…
                    function violin(g) {
                        g.each(function (d, i) {
                            var _this = this;

                            var name = d.name,
                                colour = colours(d.seriesName);

                            d = d.data.map(value).sort(d3.ascending);

                            var g = d3.select(this),
                                n = d.length,
                                min = d[0],
                                max = d[n - 1];

                            dotRadius = width / 10;

                            var vDomain = domain && domain.call(this, d, i) || [min, max];

                            var yScale = d3.scale.linear().domain(vDomain).range([height, 0]);

                            var diff = vDomain[1] - vDomain[0];
                            var binHalfSize = (max - min) / (resolution + 2) / 2;
                            var hist = d3.layout.histogram().bins(resolution + 2).range([vDomain[0] - 0.01 * diff, vDomain[1] + 0.01 * diff]) // .range([min - binSize - 1, max + binSize + 1])
                            .frequency(1)(d);

                            var histScale = d3.scale.linear().domain(d3.extent(hist, function (d) {
                                return d.y;
                            })).range([0, width / 2]);

                            var area = d3.svg.area().interpolate("basis").x0(function (d) {
                                return width / 2 - histScale(d.y);
                            }).x1(function (d) {
                                return width / 2 + histScale(d.y);
                            }).y(function (d) {
                                return yScale(d.x + binHalfSize);
                            });

                            var dist = g.selectAll("path.area").data([hist]);

                            dist.enter().append("path").attr("class", "area");

                            dist.attr("d", area);

                            var dotGroup = g.selectAll("g.dot-group").data(hist.slice(1, hist.length - 1));

                            dotGroup.enter().append("g").attr("class", "dot-group");

                            dotGroup.attr("transform", function (d) {
                                return 'translate(' + (width - histScale(d.length)) / 2 + ',0)';
                            });

                            var dot = dotGroup.selectAll("circle.dot").data(function (d) {
                                return d.map(function (el) {
                                    return { y: el, x: Math.random() * histScale(d.length) };
                                });
                            });

                            dot.enter().append("circle").attr("class", "dot");

                            dot.attr("r", dotScale(width)).attr("cx", function (d) {
                                return d.x;
                            }).attr("cy", function (d) {
                                return yScale(d.y);
                            }).style("fill", colour);

                            var label = g.selectAll("text.violin-name").data([name]);

                            label.enter().append("text").attr("class", "violin-name");

                            label.attr("dy", "5px").attr("text-anchor", "end").attr("transform", 'translate(' + width / 2 + ',' + (height + 5) + ') rotate(-90)').style("fill", colour).text(function (d) {
                                return d;
                            });

                            label.each(function (d) {
                                var rect = this.getBoundingClientRect();
                                if (rect.height > margin.bottom) {
                                    d3.select(this).text(d.slice(0, margin.bottom / rect.height * d.length - 3) + "...");
                                }
                            });

                            var clickRect = g.selectAll("rect.click-capture").data([1]);

                            clickRect.enter().append('rect').attr('class', 'click-capture').style('visibility', 'hidden');

                            clickRect.attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);

                            clickRect.on("mouseover", function () {
                                var groupPos = _this.getBoundingClientRect(),
                                    xPos = (groupPos.right + groupPos.left) / 2,
                                    yPos = groupPos.top,
                                    text = '<div class="tooltip-colour-box" style="background-color: ' + colour + '"></div>' + ('<span class="tooltip-text">' + name + '</span>');
                                tooltip.html(text).position([xPos, yPos]).show();
                            }).on("mouseout", function (d) {
                                tooltip.hide();
                            });
                        });
                        d3.timer.flush();
                    }

                    violin.width = function (x) {
                        if (!arguments.length) return width;
                        width = x;
                        return violin;
                    };

                    violin.height = function (x) {
                        if (!arguments.length) return height;
                        height = x;
                        return violin;
                    };

                    violin.tickFormat = function (x) {
                        if (!arguments.length) return tickFormat;
                        tickFormat = x;
                        return violin;
                    };

                    violin.domain = function (x) {
                        if (!arguments.length) return domain;
                        domain = x == null ? x : d3.functor(x);
                        return violin;
                    };

                    violin.value = function (x) {
                        if (!arguments.length) return value;
                        value = x;
                        return violin;
                    };

                    return violin;
                };

                function update(target, transitions) {

                    var violinContainers = target.selectAll("g.violin-container");

                    var data = scope.value.data;

                    if (scope.selected.length) {
                        data = data.filter(function (d) {
                            return scope.selected.indexOf(d.name) !== -1;
                        });
                    }

                    var extents = [];
                    // calculate extents of values of every node
                    data.forEach(function (series) {
                        extents = extents.concat(d3.extent(series.values));
                    });
                    var extent = d3.extent(extents),
                        min = extent[0],
                        max = extent[1],
                        diff = max - min,
                        scaleMargin = diff / resolution;

                    // calculate optimal width of a violin plot
                    violinGroupWidth = ((width - violinGroupSpacing * (data.length - 1)) / data.length).clamp(violinGroupMinWidth, violinGroupMaxWidth);

                    // calculate the total width of the whole chart
                    chartWidth = data.length * (violinGroupWidth + violinGroupSpacing) - violinGroupSpacing;

                    // define function for plotting violin plots

                    var domain = [min - scaleMargin, max + scaleMargin];

                    violinPlot = d3.violin().width(violinGroupWidth).height(height).domain(domain);

                    // calculate offset for the left margin to align the plot to the center
                    var leftMargin = ((width + margin.right + margin.left) / 2 - chartWidth / 2).clamp(margin.left, Infinity);

                    var yScale = d3.scale.linear().domain(domain).range([height, 0]);

                    var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(-width);

                    chart.attr("transform", 'translate(0, ' + margin.top + ')');

                    svg.select("g.axis").attr("transform", 'translate(' + (margin.left - 10) + ',0)').call(yAxis);

                    data = data.map(function (d, i) {
                        return {
                            name: d.name,
                            data: d.values,
                            seriesName: d.seriesName,
                            i: i
                        };
                    });

                    // bind data
                    violinContainers = violinContainers.data(data, function (d) {
                        return d.name;
                    });

                    // add new containers for new data
                    violinContainers.enter().append("g").attr("class", "violin-container");

                    violinContainers.call(violinPlot);

                    // remove unbound containers
                    var violinExit = violinContainers.exit();

                    violinExit.remove();

                    // update translation
                    violinContainers.each(function (d, i) {
                        d.x = leftMargin + d.i * (violinGroupWidth + violinGroupSpacing);
                    });

                    if (width >= Math.floor(chartWidth)) {
                        updated = true;
                        d3.select("g.scrollable-violin-container").attr("transform", 'translate(0,0)');
                    }

                    if (transitions) violinContainers = violinContainers.transition().duration(200);

                    violinContainers.attr("transform", function (d) {
                        return 'translate(' + d.x + ', 0)';
                    });
                }

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    height = 500 - margin.top - margin.bottom;
                    width = elementWidth - margin.left - margin.right;

                    // don't continue rendering if there is no data
                    if (!scope.value) console.warn("No data to render.");

                    colours = d3.scale.category10().domain(scope.value.data.map(function (d) {
                        return d.seriesName;
                    }));

                    // set up svg and bind scroll behaviour on drag
                    svg.data([{ x: 0, y: 0 }]).attr("width", "100%").attr("height", height + margin.top + margin.bottom).call(scroll(dragmove, dragEnd));

                    // define a clip path to clip the violin plots outside the scroll area
                    var clip = svg.append("defs").append("svg:clipPath").attr("id", "clip").append("svg:rect").attr("id", "clip-rect").attr("x", margin.left - 5).attr("y", "-20").attr("width", width + 10).attr("height", height * 2);

                    chart = svg.append("g");

                    chart.append("g").attr("class", "axis");

                    var clipBox = chart.append("g").attr("id", "scroll-clip-violin").attr("clip-path", "url(#clip)");

                    violinGroupArea = clipBox.append("g").attr("class", "scrollable-violin-container");

                    update(violinGroupArea, options.transitions);
                }

                function dragEnd() {
                    d3.event.sourceEvent.stopPropagation();
                }

                function dragmove(d) {
                    if (updated) {
                        d.x = 0;
                        updated = false;
                    }
                    d.x = (d.x + d3.event.dx).clamp(width - chartWidth, 0);

                    d3.select("g.scrollable-violin-container").attr("transform", 'translate(' + d.x + ',' + d.y + ')');
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ transitions: false });
                });

                scope.$watch("value", function () {
                    render({ transitions: true });
                });

                scope.$watch("selected", function (selected) {
                    update(violinGroupArea, true, true);
                });
            }
        };
    }

    function scroll(dragHandler, dragStopHandler) {
        var drag = d3.behavior.drag();
        drag.on("drag", dragHandler).on("dragend", dragStopHandler);
        return drag;
    }

    return {
        setters: [function (_2) {
            angular = _2['default'];
        }, function (_3) {
            d3 = _3['default'];
        }, function (_) {}, function (_d) {}, function (_a) {
            d3tooltip = _a.d3tooltip;
        }],
        execute: function () {
            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };
            _export('default', angular.module('plotify.violin', ['plotify.utils']).directive('violinPlot', ViolinPlotDirective));
        }
    };
});
$__System.register('3', ['1', '2', '9', 'c', 'f', 'e', 'a'], function (_export) {
    var angular, d3, _getIterator, _Object$keys, d3tooltip;

    function LineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selected: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-lineage-plot");

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var maxAllowedDepth = 180,
                    mouseStart = null,
                    colours = d3.scale.category10().range(),
                    isDrag = false,
                    tooltip = new d3tooltip(d3.select(element[0]));

                function render(options) {

                    // do not continue rendering if there is no data
                    if (!scope.value) return;

                    var treeData = scope.value;
                    treeData.trees = createTreeLayout(treeData.nodes);

                    // FIXME: time plotting not implemented / checked yet
                    var isTimePlot = treeData.trees[0].generation instanceof Date;

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var margin = { top: 40, right: 70, bottom: 50, left: 70 },
                        width = elementWidth - margin.right - margin.left,
                        height = 600 - margin.top - margin.bottom;

                    var nodesInGenerations = [],
                        maxNodesInGeneration = [];

                    // calculate maximum number of nodes in any generation for each tree
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        var _loop = function () {
                            var tree = _step.value;

                            var tempLayout = d3.layout.tree().size([height, width]),
                                nodes = tempLayout.nodes(tree),
                                counts = {};

                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;

                            try {
                                for (_iterator2 = _getIterator(nodes); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var _node = _step2.value;

                                    if (counts[_node.generation]) {
                                        counts[_node.generation]++;
                                    } else {
                                        counts[_node.generation] = 1;
                                    }
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                        _iterator2['return']();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }

                            nodesInGenerations.push(counts);
                            maxNodesInGeneration.push(d3.max(_Object$keys(counts).map(function (k) {
                                return counts[k];
                            })));
                        };

                        for (var _iterator = _getIterator(treeData.trees), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _iteratorNormalCompletion2;

                            var _didIteratorError2;

                            var _iteratorError2;

                            var _iterator2, _step2;

                            _loop();
                        }

                        // calculate cumulative offset of consecutive trees
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    var totalMaxNodes = maxNodesInGeneration.reduce(function (a, b) {
                        return a + b;
                    }, 0);
                    var heights = maxNodesInGeneration.map(function (n) {
                        return n / totalMaxNodes * height;
                    });
                    var offsets = heights.reduce(function (r, a) {
                        if (r.length > 0) a += r[r.length - 1];
                        r.push(a);
                        return r;
                    }, []);

                    offsets.pop();
                    offsets.unshift(0);

                    // diagonal generator
                    var diagonal = d3.svg.diagonal().projection(function (d) {
                        return [d.y, d.x];
                    });

                    // optional link step-before generator
                    var lineStepBefore = d3.svg.line().x(function (node) {
                        return node.y;
                    }).y(function (node) {
                        return node.x;
                    }).interpolate('step-before');

                    // render chart area
                    var chart = svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").datum(offsets).attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

                    var mouseRect = chart.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("opacity", 0);

                    var roots = treeData.trees;

                    var treesData = [],
                        generationExtents = [];

                    // create tree layouts
                    for (var i = 0; i < roots.length; i++) {
                        var treeLayout = d3.layout.tree().size([heights[i], width]),
                            //.nodeSize([15,15])
                        nodes = treeLayout.nodes(roots[i]).reverse(),
                            links = treeLayout.links(nodes);

                        //let indexInGeneration = {};
                        //for (let node of nodes) {
                        //    if (indexInGeneration[node.generation] === undefined)
                        //        indexInGeneration[node.generation] = 0;
                        //    else
                        //        indexInGeneration[node.generation]++;
                        //
                        //    node.x = (nodesInGenerations[i][node.generation] - indexInGeneration[node.generation])
                        //        / (nodesInGenerations[i][node.generation] + 1) * heights[i] - 10 ;
                        //}
                        //console.log(nodes);
                        treesData.push({ nodes: nodes, links: links });
                        generationExtents = generationExtents.concat(d3.extent(nodes, function (node) {
                            return node.generation;
                        }));
                    }

                    // calculate generation extent
                    var generationExtent = d3.extent(generationExtents),
                        depth = width / (generationExtent[1] - generationExtent[0]);

                    // trim depth if exceeds maximum allowed depth
                    if (depth > maxAllowedDepth) {
                        depth = maxAllowedDepth;
                        generationExtent[1] = width / depth;
                    }
                    // define x scale
                    var xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear()).domain(generationExtent).range([0, width]);

                    // Define x axis and grid
                    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height);

                    // Calculate depth positions.
                    treesData.forEach(function (tree) {
                        tree.nodes.forEach(function (node) {
                            node.y = node.generation * depth;
                        });
                    });

                    //render x axis
                    var xAxisSVG = chart.append("g").attr("class", "axis x-axis").attr("transform", 'translate(0, ' + height + ')').call(xAxis);

                    // render chart title
                    if (treeData.title) {
                        chart.append("text").attr("x", width / 2).attr("y", 0 - margin.top / 2).attr("text-anchor", "middle").style("font-size", "20px").text(treeData.title);
                    }

                    // render x axis label if exists
                    if (treeData.axis.title) {
                        chart.append("text") // text label for the x axis
                        .style("text-anchor", "middle").text(treeData.axis.title).attr("transform", 'translate(' + width / 2 + ', ' + (height + 50) + ')');
                    }

                    // add plotting areas for each separate tree
                    var treeArea = chart.append("g").attr("id", "trees-containter").selectAll("g.tree-area").data(treesData).enter().append("g").attr("class", "tree-area").attr("transform", function (d, i) {
                        return 'translate(0, ' + offsets[i] + ')';
                    });

                    // Declare the nodes
                    var node = treeArea.selectAll("g.node").data(function (d) {
                        return d.nodes;
                    });

                    // Enter the nodes.
                    var nodeEnter = node.enter().append("g").attr("class", "node").classed("selected", function (d) {
                        return scope.selected.indexOf(d.name) !== -1;
                    }).attr("transform", function (d) {
                        return 'translate(' + d.y + ',' + d.x + ')';
                    });

                    // Add node circles
                    nodeEnter.append("circle").attr("r", 7).style("fill", function (d) {
                        if (scope.selected.indexOf(d.name) !== -1) return colours[d.treeId];else return "#FFF";
                    }).style("stroke", function (d) {
                        return colours[d.treeId];
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d, i) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours[d.treeId] + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    // Add node labels
                    nodeEnter.append("text").attr("x", function (d) {
                        return d.children ? -13 : 13;
                    }).attr("dy", ".35em").attr("text-anchor", function (d) {
                        return d.children ? "end" : "start";
                    }).text(function (d) {
                        return d.name;
                    }).style("fill-opacity", 1);

                    // Declare the links
                    var link = treeArea.selectAll("path.link").data(function (d) {
                        return d.links;
                    });

                    // Enter the links.
                    link.enter().insert("path", "g").attr("class", "link").attr("d", diagonal);
                    //.attr("d", conn => {
                    //    let connNodes = [conn.source, conn.target];
                    //    return lineStepBefore(connNodes);
                    //});

                    mouseRect.on("mousedown", mouseDown).on("mousemove", mouseMove).on("mouseup", mouseUp).on("mouseout", mouseOut);

                    function mouseDown() {
                        d3.event.preventDefault();
                        isDrag = true;
                        var p = d3.mouse(this);
                        mouseStart = p;
                        chart.select(".selection-rect").remove();
                        chart.append("rect").attr({
                            rx: 3,
                            ry: 3,
                            'class': "selection-rect",
                            x: p[0],
                            y: p[1],
                            width: 0,
                            height: 0
                        });
                    }

                    function click() {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", function (d) {
                                return colours[d.treeId];
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseUp() {

                        if (!isDrag) return;

                        var s = chart.select(".selection-rect"),
                            p = d3.mouse(this);
                        if (mouseStart === null) return;
                        if (!selectPoints(s) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) node.each(function () {
                            var n = d3.select(this);
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        });
                        s.remove();
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                    }

                    function mouseOut() {
                        var p = d3.mouse(this);
                        if (!(p[0] >= -margin.left && p[0] <= width + margin.right && p[1] >= -margin.top && p[1] <= height + margin.bottom)) {

                            chart.select(".selection-rect").remove();
                            updateSelection();
                            mouseStart = null;
                        }
                    }

                    function mouseMove() {
                        var s = chart.select("rect.selection-rect");
                        if (!s.empty()) {
                            var p = d3.mouse(this),
                                d = {
                                x: +s.attr("x"),
                                y: +s.attr("y"),
                                width: +s.attr("width"),
                                height: +s.attr("height")
                            },
                                move = {
                                x: p[0] - d.x,
                                y: p[1] - d.y
                            };

                            if (move.x < 1 || move.x * 2 < d.width) {
                                d.x = p[0];
                                d.width -= move.x;
                            } else {
                                d.width = move.x;
                            }

                            if (move.y < 1 || move.y * 2 < d.height) {
                                d.y = p[1];
                                d.height -= move.y;
                            } else {
                                d.height = move.y;
                            }

                            s.attr(d);
                            selectPoints(s);
                        }
                    }

                    function selectPoints(rect) {
                        var rect_x1 = +rect.attr("x"),
                            rect_y1 = +rect.attr("y"),
                            rect_x2 = +rect.attr("width") + rect_x1,
                            rect_y2 = +rect.attr("height") + rect_y1,
                            any = false;

                        node.each(function (d, i, j) {
                            var n = d3.select(this);
                            var t = d3.transform(n.attr("transform")),
                                tx = t.translate[0],
                                ty = t.translate[1] + offsets[j];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle").style("fill", function (d) {
                                    return colours[d.treeId];
                                });
                                any = true;
                            } else if (scope.selected.indexOf(d.name) === -1) {
                                n.classed("selected", false);
                                n.select("circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var selectedNodes = [];

                        svg.selectAll("g.node.selected").each(function (d, i) {
                            selectedNodes.push(d.name);
                        });

                        var wasChange = selectedNodes.length !== scope.selected.length || selectedNodes.some(function (d) {
                            return scope.selected.indexOf(d) === -1;
                        });

                        if (wasChange) {
                            //scope.selected.push("node2");
                            scope.selected = selectedNodes;
                            scope.$apply();
                        }
                    }
                }
                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render(scope.value);
                });

                scope.$watch("value", function () {
                    render(scope.value);
                });
            }
        };
    }

    function createTreeLayout(nodesArray) {
        var trees = [],
            nodesDict = {},
            roots = [],
            notRoots = [],
            hasChildren = [],
            youngest = [];

        for (var i = 0; i < nodesArray.length; i++) {
            var node = nodesArray[i];
            nodesDict[node.name] = {
                name: node.name,
                parent: node.parent,
                generation: node.generation,
                children: [],
                treeId: node.treeId
            };
        }

        for (var i = 0; i < nodesArray.length; i++) {
            var curr = nodesArray[i];
            if (notRoots.indexOf(curr.name) !== -1) continue;
            while (true) {
                if (notRoots.indexOf(curr.name) !== -1) break;
                if (curr.parent == null) {
                    if (roots.indexOf(curr.name) === -1) roots.push(curr.name);
                    break;
                } else {
                    notRoots.push(curr.name);
                    if (hasChildren.indexOf(curr.parent) === -1) hasChildren.push(curr.parent);
                    curr = nodesDict[curr.parent];
                }
            }
        }

        for (var node in nodesDict) {
            if (nodesDict.hasOwnProperty(node) && hasChildren.indexOf(node) === -1) {
                youngest.push(node);
            }
        }
        var gen = youngest;
        var visited = [];
        while (gen.length) {
            var prevGen = [];
            for (var i = 0; i < gen.length; i++) {
                var node = nodesDict[gen[i]];
                var _parent = nodesDict[node.parent];

                if (visited.indexOf(node.name) !== -1 || _parent === undefined) continue;

                if (_parent.parent !== null && prevGen.indexOf(node.parent) === -1) prevGen.push(_parent.name);

                _parent.children.push(node);
                visited.push(node.name);
            }
            gen = prevGen;
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = _getIterator(roots), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var root = _step3.value;

                trees.push(nodesDict[root]);
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return trees;
    }

    return {
        setters: [function (_2) {
            angular = _2['default'];
        }, function (_3) {
            d3 = _3['default'];
        }, function (_) {}, function (_c) {
            _getIterator = _c['default'];
        }, function (_f) {
            _Object$keys = _f['default'];
        }, function (_e) {}, function (_a) {
            d3tooltip = _a.d3tooltip;
        }],
        execute: function () {
            'use strict';

            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };
            _export('default', angular.module('plotify.lineage', ['plotify.utils']).directive('lineagePlot', LineagePlotDirective));
        }
    };
});
$__System.register('7', ['1', '2', '8', '9', '10', '11', 'c', 'a'], function (_export) {
    var angular, d3, _slicedToArray, _getIterator, d3legend, d3tooltip;

    function LinePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-line-plot");

                var height = 0,
                    width = 0,
                    margin = { top: 75, right: 70, bottom: 120, left: 70 },
                    defaultTimeFormat = "%d %b %y",
                    defaultScalarFormat = null,
                    xScale = null,
                    _xScale = null,
                    yScale = null,
                    _yScale = null,
                    xAxis = null,
                    yAxis = null,
                    defs = undefined,
                    tooltip = undefined,
                    colours = null,
                    voronoi = null,
                    voronoiGroup = null,
                    hoverFocusCircle = undefined,
                    chart = null,
                    chartClipArea = null,
                    line = null,
                    visibleSeries = {},
                    transitionDuration = 300;

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var marginRatio = { x: 0.1, y: 0.1 },
                    settings = {
                    "title": "chart title",
                    "xAxis": {
                        "title": "time",
                        "units": "h"
                    },
                    "yAxis": {
                        "title": "yAxis",
                        "units": "yUnits"
                    }
                };

                tooltip = new d3tooltip(d3.select(element[0]));

                function update(data) {

                    data = data.filter(function (d) {
                        return visibleSeries[d.name];
                    });

                    var _calculateExtents = calculateExtents(data);

                    var _calculateExtents2 = _slicedToArray(_calculateExtents, 2);

                    var xExtent = _calculateExtents2[0];
                    var yExtent = _calculateExtents2[1];
                    var voronoiData = [];

                    _yScale = yScale.copy();
                    _xScale = xScale.copy();

                    var lineOld = d3.svg.line().interpolate("basis").x(function (d) {
                        return _xScale(d[0]);
                    }).y(function (d) {
                        return _yScale(d[1]);
                    });

                    if (data.length) {
                        xScale.domain(xExtent);
                        yScale.domain(yExtent);
                        var t = chart.transition().duration(transitionDuration);

                        t.select("g.x-axis").call(xAxis);
                        t.select("g.y-axis").call(yAxis);
                    }

                    defs.select("g.voronoi-clips").selectAll("clipPath.voronoi-clip").remove();
                    voronoiGroup.selectAll("path").remove();

                    var series = chartClipArea.selectAll("g.series").data(data, function (d) {
                        return d.name;
                    });

                    var newSeries = [];

                    series.enter().append("g").attr("class", "series").each(function (d) {
                        return newSeries.push(d.name);
                    });

                    series.exit().each(function (d, i) {
                        var sel = d3.select(this);
                        if (d.drawLine) {
                            sel.select("path.series-line").style("stroke", function (d) {
                                return colours(d.name);
                            }).transition().duration(transitionDuration).attr("d", function (d) {
                                return line(d.values);
                            }).style("opacity", 0).remove();
                        }
                        if (d.drawDot) {
                            sel.selectAll("circle.series-dot").transition().duration(transitionDuration).attr("cx", function (d) {
                                return xScale(d[0]);
                            }).attr("cy", function (d) {
                                return yScale(d[1]);
                            }).style("opacity", 0).remove();
                        }
                        sel.transition().delay(transitionDuration).remove();
                    });

                    series.each(function (d, i) {
                        var sel = d3.select(this),
                            self = this,
                            isNew = newSeries.indexOf(d.name) !== -1;

                        var seriesLine = sel.selectAll("path.series-line").data([d], function (d) {
                            return d.name;
                        });

                        seriesLine.enter().append("path").attr("class", "series-line");

                        seriesLine.attr("d", function (d) {
                            return lineOld(d.values);
                        }).style("stroke", function (d) {
                            return colours(d.name);
                        }).style("opacity", !d.drawLine || isNew ? 0 : 1).transition().duration(transitionDuration).attr("d", function (d) {
                            return line(d.values);
                        }).style("opacity", d.drawLine ? 1 : 0);

                        var seriesDot = sel.selectAll("circle.series-dot").data(function (d) {
                            return d.values;
                        });

                        seriesDot.enter().append("circle").attr("class", "series-dot");

                        seriesDot.attr("r", 4).attr("cx", function (d) {
                            return _xScale(d[0]);
                        }).attr("cy", function (d) {
                            return _yScale(d[1]);
                        }).attr("fill", colours(d.name)).style("opacity", !d.drawDot || isNew ? 0 : 1).style("stroke", "white").transition().duration(transitionDuration).attr("cx", function (d) {
                            return xScale(d[0]);
                        }).attr("cy", function (d) {
                            return yScale(d[1]);
                        }).style("opacity", d.drawDot ? 1 : 0);

                        seriesDot.each(function (d, i) {
                            d.circle = this;
                            d.series = self;
                            d[0] += Math.random() * 10E-4;
                            d[1] += Math.random() * 10E-4;
                            voronoiData.push(d);
                        });
                    });

                    // define the clipPath
                    defs.select("g.voronoi-clips").selectAll("clipPath").data(voronoiData).enter().append("clipPath").attr("id", function (d, i) {
                        return 'lp-voronoi-clip-id' + i;
                    }).attr("class", "voronoi-clip").append("circle").attr("cx", function (d) {
                        return xScale(d[0]);
                    }).attr("cy", function (d) {
                        return yScale(d[1]);
                    }).attr("r", 25);

                    voronoiGroup.selectAll("path").data(voronoi(voronoiData)).enter().append("path").attr("d", function (d) {
                        return "M" + d.join("L") + "Z";
                    }).attr("clip-path", function (d, i) {
                        return 'url(#lp-voronoi-clip-id' + i + ')';
                    }).datum(function (d) {
                        return d.point;
                    }).on("mouseover", voronoiMouseover).on("mouseout", voronoiMouseout);

                    function voronoiMouseover(d) {
                        hoverFocusCircle.attr("fill", colours(d.series.__data__.name)).attr("r", 5).attr("transform", 'translate(' + xScale(d[0]) + ',' + yScale(d[1]) + ')');

                        var groupPos = d.circle.getBoundingClientRect(),
                            xPos = groupPos.left + groupPos.width / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.series.__data__.name) + '"></div>' + ('<span class="tooltip-text">' + d.series.__data__.name + '</span>') + ('<span>x: ' + d[0].toFixed(1) + '</span>') + ('<span>y: ' + d[1].toFixed(1) + '</span>');

                        tooltip.position([xPos, yPos]).html(text).show();
                    }
                    function voronoiMouseout(d) {
                        hoverFocusCircle.attr("transform", "translate(-200, -200)");
                        tooltip.hide();
                    }
                }

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    // don't continue rendering if there is no data
                    if (!scope.value || !scope.value.series.length) return;

                    var data = scope.value.series,
                        seriesNames = data.map(function (d) {
                        return d.name;
                    });

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _getIterator(seriesNames), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _name = _step.value;

                            visibleSeries[_name] = true;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    data = data.map(function (d) {
                        d.drawLine = !options.drawLines || options.drawLines.indexOf(d.name) !== -1;
                        d.drawDot = !options.drawDots || !d.drawLine || options.drawDots.indexOf(d.name) !== -1;
                        return d;
                    });

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    width = elementWidth - margin.left - margin.right;
                    height = 600 - margin.top - margin.bottom;

                    colours = d3.scale.category10().domain(data.map(function (d) {
                        return d.name;
                    }));

                    // define x and y axes formats
                    var xAxisFormat = d3.time.format(defaultTimeFormat),
                        yAxisFormat = d3.format(defaultScalarFormat),
                        xAxisLabel = settings.xAxis.title,
                        yAxisLabel = settings.yAxis.title,
                        xAxisUnits = settings.xAxis.units,
                        yAxisUnits = settings.yAxis.units,
                        chartTitle = settings.title,
                        titleSize = 20;

                    var _calculateExtents3 = calculateExtents(data);

                    var _calculateExtents32 = _slicedToArray(_calculateExtents3, 2);

                    var xExtent = _calculateExtents32[0];
                    var yExtent = _calculateExtents32[1];

                    // define x scale
                    xScale = d3.scale.linear().domain(xExtent).range([0, width]);

                    // define y scale
                    yScale = d3.scale.linear().domain(yExtent).range([height, 0]);

                    // define x axis
                    xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height).tickPadding(5);
                    //.tickFormat(xAxisFormat);

                    // define y axis
                    yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(-width);
                    //.tickFormat(yAxisFormat);

                    line = d3.svg.line().interpolate("basis").x(function (d) {
                        return xScale(d[0]);
                    }).y(function (d) {
                        return yScale(d[1]);
                    });

                    voronoi = d3.geom.voronoi().x(function (d) {
                        return xScale(d[0]) + Math.random() * 0.001;
                    }).y(function (d) {
                        return yScale(d[1]) + Math.random() * 0.001;
                    }).clipExtent([[xScale.range()[0], yScale.range()[1]], [xScale.range()[1], yScale.range()[0]]]);

                    // render chart area
                    chart = svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

                    defs = svg.append("defs");

                    var clip = defs.append("svg:clipPath").attr("id", "clip-line-plot").append("svg:rect").attr("id", "clip-rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                    defs.append("g").attr("class", "voronoi-clips");

                    chartClipArea = chart.append("g").attr("id", "chart-clip-box").attr("clip-path", "url(#clip-line-plot)");

                    hoverFocusCircle = chart.append("circle").attr("id", "hover-focus-circle").attr("transform", "translate(-200, -200)");

                    voronoiGroup = chart.append("g").attr("class", "voronoi");

                    // render x axis
                    chart.append("g").attr("class", "axis x-axis").attr("transform", 'translate(0, ' + height + ')').call(xAxis);

                    // render y axis
                    chart.append("g").attr("class", "axis y-axis").call(yAxis);

                    // render chart title
                    if (chartTitle) {
                        chart.append("text").attr("x", width / 2).attr("y", -margin.top + titleSize + 10).attr("text-anchor", "middle").style("font-size", titleSize + 'px').text(chartTitle);
                    }

                    // render x axis label if exists
                    if (xAxisLabel) {
                        var tickHeight = chart.selectAll("g.x-axis g.tick text")[0][0].getBBox().height;
                        xAxisLabel += xAxisUnits ? ', ' + xAxisUnits : "";
                        chart.append("text") // text label for the x axis
                        .style("text-anchor", "middle").text(xAxisLabel).attr("transform", 'translate(' + width / 2 + ', ' + (height + tickHeight + 30) + ')');
                    }

                    // render y axis label if exists
                    if (yAxisLabel) {
                        yAxisLabel += yAxisUnits ? ', ' + yAxisUnits : "";
                        chart.append("text") // text label for the y axis
                        .attr("transform", "rotate(-90)").attr("y", -margin.left + 10).attr("x", -(height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(yAxisLabel);
                    }

                    update(data);

                    var drawLegend = d3legend().splitAfter(0).seriesNames(seriesNames).colourScale(colours).anchorHorizontal("right").anchorVertical("bottom").onMouseOver(legendMouseOver).onMouseOut(legendMouseOut).onClick(legendClick).selectedItems(visibleSeries);

                    var legend = chart.append("g").attr("class", "plotify-legend").attr("transform", 'translate(' + width + ',' + 0 + ')').call(drawLegend);

                    function legendMouseOver(label) {
                        var focusItem = d3.select(this);
                        legend.selectAll("g.legend-item").classed("legend-item-unfocused", true);
                        focusItem.classed("legend-item-unfocused", false);

                        chart.selectAll("g.series").classed("series-unfocused-path", function (d) {
                            return d.drawLine ? true : false;
                        }).classed("series-unfocused-dots", function (d) {
                            return d.drawDot ? true : false;
                        }).filter(function (d) {
                            return d.name === label;
                        }).classed("series-unfocused-dots series-unfocused-path", false).classed("series-focused", true);
                    }

                    function legendMouseOut(label) {
                        legend.selectAll("g.legend-item").classed("legend-item-unfocused", false);
                        chart.selectAll("g.series").classed("series-unfocused-dots series-unfocused-path", false).classed("series-focused", false);
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        visibleSeries[label] = !visibleSeries[label];
                        clicked.classed("legend-item-selected", visibleSeries[label]);
                        clicked.select("rect.shape").attr("fill", visibleSeries[label] ? colours(label) : "white");
                        update(data);
                    }
                }

                function calculateExtents(data) {
                    var xExtents = [],
                        yExtents = [];

                    data.forEach(function (series) {
                        var xValues = series.values.map(function (d) {
                            return d[0];
                        });
                        var yValues = series.values.map(function (d) {
                            return d[1];
                        });
                        xExtents = xExtents.concat(d3.extent(xValues));
                        yExtents = yExtents.concat(d3.extent(yValues));
                    });

                    var xExtent = d3.extent(xExtents),
                        yExtent = d3.extent(yExtents);

                    // find extent of input data and calculate margins
                    var xMargin = marginRatio.x * (xExtent[1] - xExtent[0]) / 2,
                        yMargin = marginRatio.y * (yExtent[1] - yExtent[0]) / 2;

                    // add margins to horizontal axis data
                    xExtent[0] -= xMargin;
                    xExtent[1] += xMargin;

                    // add margins to vertical axis data
                    yExtent[0] -= yMargin;
                    yExtent[1] += yMargin;

                    return [xExtent, yExtent];
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ drawLines: ["series 2", "series 3"] });
                });

                scope.$watch("value", function () {
                    render({ drawLines: ["series 1", "series 3", "series 4", "series 5"], drawDots: ["series 1", "series 5", "series 5"] });
                });
            }
        };
    }

    return {
        setters: [function (_5) {
            angular = _5['default'];
        }, function (_6) {
            d3 = _6['default'];
        }, function (_3) {}, function (_4) {}, function (_2) {}, function (_) {
            _slicedToArray = _['default'];
        }, function (_c) {
            _getIterator = _c['default'];
        }, function (_a) {
            d3legend = _a.d3legend;
            d3tooltip = _a.d3tooltip;
        }],
        execute: function () {
            'use strict';

            _export('default', angular.module('plotify.line', ['plotify.utils']).directive('linePlot', LinePlotDirective));
        }
    };
});
$__System.register('4', ['1', '2', '9', '12', 'c', 'a'], function (_export) {
    var angular, d3, _getIterator, d3tooltip;

    function LineageScatterPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selected: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-lineage-scatter-plot");

                var defaultTimeFormat = "%d %b %y",
                    defaultScalarFormat = null;

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var links = undefined,
                    nodesData = undefined,
                    mouseStart = undefined,
                    colours = d3.scale.category10().range(),
                    isDrag = false,
                    tooltip = new d3tooltip(d3.select(element[0]));

                scope.scatterSelection = [];

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var margin = { top: 40, right: 70, bottom: 120, left: 70 },
                        marginRatio = { axisX: 0.1, axisY: 0.1 },
                        width = elementWidth - margin.left - margin.right,
                        height = 600 - margin.top - margin.bottom;

                    // don't continue rendering if there is no data
                    if (!scope.value || !scope.value.nodes.length) return;

                    var data = scope.value;
                    nodesData = data.nodes;

                    if (scope.selected.length) nodesData = data.nodes.filter(function (node) {
                        return scope.selected.indexOf(node.name) !== -1;
                    });

                    scope.scatterSelection = scope.scatterSelection.filter(function (nodeName) {
                        return scope.selected.indexOf(nodeName) !== -1;
                    });

                    createLinks();

                    // check if x axis data is time data
                    var isTimePlot = nodesData[0].x instanceof Date;

                    // define x and y axes formats
                    var xAxisFormat = isTimePlot ? d3.time.format(data.xAxis.format || defaultTimeFormat) : d3.format(data.xAxis.format || defaultScalarFormat),
                        yAxisFormat = d3.format(data.yAxis.format || defaultScalarFormat);

                    // find extent of input data and calculate margins
                    var xExtent = d3.extent(nodesData, function (node) {
                        return node.x;
                    }),
                        yExtent = d3.extent(nodesData, function (node) {
                        return node.y;
                    }),
                        xMargin = marginRatio.axisX * (xExtent[1] - xExtent[0]) / 2,
                        yMargin = marginRatio.axisY * (yExtent[1] - yExtent[0]) / 2;

                    // add margins to horizontal axis data
                    if (isTimePlot) {
                        xExtent[0] = new Date(xExtent[0].getTime() - xMargin);
                        xExtent[1] = new Date(xExtent[1].getTime() + xMargin);
                    } else {
                        if (xMargin === 0) xMargin = 1;
                        xExtent[0] -= xMargin;xExtent[1] += xMargin;
                    }

                    // add margins to vertical axis data
                    yExtent[0] -= yMargin;yExtent[1] += yMargin;

                    // define x scale
                    var xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear()).domain(xExtent).range([0, width]);

                    // define y scale
                    var yScale = d3.scale.linear().domain(yExtent).range([height, 0]);

                    // define x axis
                    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height).tickFormat(xAxisFormat);

                    // define y axis
                    var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(-width).tickFormat(yAxisFormat);

                    // read x and y axes labels
                    var xAxisLabel = data.xAxis.title;
                    var yAxisLabel = data.yAxis.title;

                    // define node link function
                    var nodeLink = d3.svg.line().x(function (node) {
                        return xScale(node.x);
                    }).y(function (node) {
                        return yScale(node.y);
                    });

                    // render chart area
                    var chart = svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

                    var mouseRect = chart.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("opacity", 0);

                    // render x axis
                    var xAxisSVG = chart.append("g").attr("class", "axis x-axis").attr("transform", 'translate(0, ' + height + ')').call(xAxis);

                    // rotate tick labels if time plot
                    if (isTimePlot) {
                        xAxisSVG.selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
                    }

                    // render x axis label if exists
                    if (xAxisLabel) {
                        var tickHeight = chart.selectAll("g.x-axis g.tick text")[0][0].getBBox().height;
                        xAxisLabel += data.xAxis.units ? ', ' + data.xAxis.units : "";
                        chart.append("text") // text label for the x axis
                        .style("text-anchor", "middle").text(xAxisLabel).attr("transform", 'translate(' + width / 2 + ', ' + (height + tickHeight + 20) + ')');
                    }

                    // render y axis
                    chart.append("g").attr("class", "axis").call(yAxis);

                    // render y axis label if exists
                    if (yAxisLabel) {
                        yAxisLabel += data.yAxis.units ? ', ' + data.yAxis.units : "";
                        chart.append("text") // text label for the y axis
                        .attr("transform", "rotate(-90)").attr("y", -margin.left + 10).attr("x", -(height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(yAxisLabel);
                    }

                    // render chart title
                    if (data.title) {
                        chart.append("text").attr("x", width / 2).attr("y", 0 - margin.top / 2).attr("text-anchor", "middle").style("font-size", "20px").text(data.title);
                    }

                    // define arrowhead
                    chart.append("svg:defs").selectAll("marker").data(["end"]).enter().append("svg:marker").attr("id", String).attr("class", "arrowhead").attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5");

                    // render links
                    chart.selectAll(".link").data(links).enter().append("svg:path").attr("stroke-dasharray", "3, 3").attr("d", function (conn) {
                        return nodeLink(conn);
                    }).attr("class", "link").attr("marker-end", "url(#end)");

                    // create node groups
                    var node = chart.selectAll("g.node").data(nodesData).enter().append("g").attr("class", "node").attr("transform", function (node) {
                        return 'translate(' + xScale(node.x) + ', ' + yScale(node.y) + ')';
                    });

                    // render node circles
                    node.append("circle").attr("r", 7).style("stroke", function (d) {
                        return colours[d.treeId];
                    }).style("fill", function (d) {
                        if (scope.scatterSelection.indexOf(d.name) !== -1) return colours[d.treeId];else return "#FFF";
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d, i) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours[d.treeId] + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>') + ('<span class="tooltip-text">x: ' + d.x.toFixed(1) + '</span>') + ('<span class="tooltip-text">y: ' + d.y.toFixed(1) + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    // render node labels
                    node.append("text").attr("x", 13).attr("dy", ".35em").attr("text-anchor", "start").text(function (node) {
                        return node.name;
                    }).style("fill-opacity", 1);

                    mouseRect.on("mousedown", mouseDown).on("mousemove", mouseMove).on("mouseup", mouseUp).on("mouseout", mouseOut);

                    function click() {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", function (d) {
                                return colours[d.treeId];
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseDown() {
                        d3.event.preventDefault();
                        isDrag = true;
                        var p = d3.mouse(this);
                        mouseStart = p;
                        chart.select(".selection-rect").remove();
                        chart.append("rect").attr({
                            rx: 3,
                            ry: 3,
                            'class': "selection-rect",
                            x: p[0],
                            y: p[1],
                            width: 0,
                            height: 0
                        });
                    }

                    function mouseUp() {

                        if (!isDrag) return;

                        var s = chart.select(".selection-rect"),
                            p = d3.mouse(this);
                        if (mouseStart === null) return;
                        if (!selectPoints(s) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) node.each(function () {
                            var n = d3.select(this);
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        });
                        s.remove();
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                    }

                    function mouseOut() {
                        var p = d3.mouse(this);
                        if (!(p[0] >= -margin.left && p[0] <= width + margin.right && p[1] >= -margin.top && p[1] <= height + margin.bottom)) {

                            chart.select(".selection-rect").remove();
                            updateSelection();
                            mouseStart = null;
                        }
                    }

                    function mouseMove() {
                        var s = chart.select("rect.selection-rect");
                        if (!s.empty()) {
                            var p = d3.mouse(this),
                                d = {
                                x: +s.attr("x"),
                                y: +s.attr("y"),
                                width: +s.attr("width"),
                                height: +s.attr("height")
                            },
                                move = {
                                x: p[0] - d.x,
                                y: p[1] - d.y
                            };

                            if (move.x < 1 || move.x * 2 < d.width) {
                                d.x = p[0];
                                d.width -= move.x;
                            } else {
                                d.width = move.x;
                            }

                            if (move.y < 1 || move.y * 2 < d.height) {
                                d.y = p[1];
                                d.height -= move.y;
                            } else {
                                d.height = move.y;
                            }

                            s.attr(d);
                            selectPoints(s);
                        }
                    }

                    function selectPoints(rect) {
                        var rect_x1 = +rect.attr("x"),
                            rect_y1 = +rect.attr("y"),
                            rect_x2 = +rect.attr("width") + rect_x1,
                            rect_y2 = +rect.attr("height") + rect_y1,
                            any = false;

                        node.each(function (d, i, j) {
                            var n = d3.select(this);
                            var t = d3.transform(n.attr("transform")),
                                tx = t.translate[0],
                                ty = t.translate[1];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle").style("fill", function (d) {
                                    return colours[d.treeId];
                                });
                                any = true;
                            } else if (scope.scatterSelection.indexOf(d.name) === -1) {
                                n.classed("selected", false);
                                n.select("circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var selectedNodes = [];

                        chart.selectAll("g.node.selected").each(function (d, i) {
                            selectedNodes.push(d.name);
                        });

                        var wasChange = selectedNodes.length !== scope.scatterSelection.length || selectedNodes.some(function (d) {
                            return scope.scatterSelection.indexOf(d) === -1;
                        });

                        if (wasChange) {
                            scope.scatterSelection = selectedNodes;
                            //scope.$apply();
                        }
                    }
                }
                function createLinks() {
                    if (scope.value === undefined) return;
                    var nodeDict = {};
                    links = [];
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _getIterator(scope.value.nodes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var node = _step.value;

                            node.children = [];
                            nodeDict[node.name] = node;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = _getIterator(scope.value.nodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var node = _step2.value;

                            if (node.parent) nodeDict[node.parent].children.push(node.name);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                _iterator2['return']();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    var nodes = scope.selected.length ? scope.selected : scope.value.nodes.map(function (node) {
                        return node.name;
                    });

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = _getIterator(nodes), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var node = _step3.value;

                            var _parent = nodeDict[node].parent;
                            var found = false;
                            while (_parent) {
                                if (scope.selected.indexOf(_parent) !== -1 || !scope.selected.length) {
                                    links.push([nodeDict[_parent], nodeDict[node]]);
                                    found = true;
                                    break;
                                } else {
                                    _parent = nodeDict[_parent].parent;
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                _iterator3['return']();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render(scope.value);
                });

                scope.$watch("value", function () {
                    render(scope.value);
                });

                scope.$watch("selected", function (selected) {
                    render(scope.value);
                });
            }
        };
    }

    return {
        setters: [function (_3) {
            angular = _3['default'];
        }, function (_4) {
            d3 = _4['default'];
        }, function (_2) {}, function (_) {}, function (_c) {
            _getIterator = _c['default'];
        }, function (_a) {
            d3tooltip = _a.d3tooltip;
        }],
        execute: function () {
            'use strict';

            _export('default', angular.module('plotify.lineage-scatter', ['plotify.utils']).directive('lineageScatterPlot', LineageScatterPlotDirective));
        }
    };
});
$__System.register('9', ['1'], function (_export) {
    'use strict';

    var angular;

    function WindowResize($window, $rootScope) {
        var window = angular.element($window);
        var width = window[0].innerWidth;

        angular.element($window).on('resize', function (event) {
            var newWidth = window[0].innerWidth;
            if (width != newWidth) {
                $rootScope.$broadcast('window-resize', width = newWidth);
            }
        });
    }

    return {
        setters: [function (_) {
            angular = _['default'];
        }],
        execute: function () {
            _export('default', angular.module('plotify.utils', []).service("WindowResize", WindowResize));
        }
    };
});
$__System.register("a", ["14", "15"], function (_export) {
    var _createClass, _classCallCheck, d3tooltip;

    function d3legend() {
        var width = 0,
            height = 0,
            splitAfter = 0,
            anchorVertical = "center",
            anchorHorizontal = "right",
            seriesNames = null,
            colourScale = null,
            onMouseOver = null,
            onMouseOut = null,
            onClick = null,
            selectedItems = null,
            verticalItemSpacing = 10,
            horizontalItemSpacing = 20,
            padding = 10,
            shapeSize = 10;

        // For each small multiple…
        function legend(g) {
            splitAfter = splitAfter.clamp(0, seriesNames.length);
            if (splitAfter === 0) splitAfter = seriesNames.length;
            var longestName = seriesNames.reduce(function (a, b) {
                return a.length > b.length ? a : b;
            });

            var lengthTestString = g.append("text").attr("visibility", false).text(longestName);
            var box = lengthTestString[0][0].getBBox();
            box.height = parseInt(window.getComputedStyle(lengthTestString[0][0]).fontSize, 10);
            lengthTestString.remove();

            var columnWidth = box.width + shapeSize + 5,
                rowHeight = box.height,
                rows = splitAfter > 0 ? Math.ceil(seriesNames.length / splitAfter) : 1,
                cols = splitAfter > 0 ? splitAfter : seriesNames.length,
                w = cols * columnWidth + (cols - 1) * horizontalItemSpacing + 2 * padding,
                h = rows * rowHeight + (rows - 1) * verticalItemSpacing + 2 * padding,
                shapeVerticalOffset = (rowHeight - shapeSize) / 2,
                textVerticalOffset = (rowHeight + box.height) / 2 - 2,
                legendHorizontalOffset = 0,
                legendVerticalOffset = 0;

            switch (anchorHorizontal) {
                case "left":
                    legendHorizontalOffset = 0;break;
                case "center":
                    legendHorizontalOffset = -w / 2;break;
                case "right":
                    legendHorizontalOffset = -w;break;
            }

            switch (anchorVertical) {
                case "top":
                    legendVerticalOffset = 0;break;
                case "center":
                    legendVerticalOffset = -h / 2;break;
                case "bottom":
                    legendVerticalOffset = -h;break;
            }

            var item = g.selectAll("g.legend-item").data(seriesNames);

            item.enter().append("g").attr("class", "legend-item");

            item.attr("transform", function (d, i) {
                return "translate(" + (legendHorizontalOffset + padding + i % splitAfter * (columnWidth + horizontalItemSpacing)) + ",\n                                            " + (legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)) + ")";
            });

            item.each(function (d, i) {
                var sel = d3.select(this);

                sel.append("rect").attr("class", "shape").attr("x", 2).attr("y", shapeVerticalOffset).attr("width", shapeSize).attr("height", shapeSize).attr("fill", selectedItems[d] ? colourScale(d) : "white").attr("stroke", colourScale(d));

                sel.append("text").attr("x", shapeSize + 5).attr("y", textVerticalOffset).attr("fill", "black").text(d);

                sel.append("rect").attr("class", "legend-item-mouse-capture").attr("x", 0).attr("y", 0).attr("width", columnWidth).attr("height", rowHeight).attr("fill", "white").attr("opacity", 0);
            });

            if (onMouseOver) item.on("mouseover", onMouseOver);
            if (onMouseOut) item.on("mouseout", onMouseOut);
            if (onClick) item.on("click", onClick);
        }

        legend.width = function (x) {
            if (!arguments.length) return width;
            width = x;
            return legend;
        };

        legend.height = function (x) {
            if (!arguments.length) return height;
            height = x;
            return legend;
        };

        legend.splitAfter = function (x) {
            if (!arguments.length) return splitAfter;
            splitAfter = x;
            return legend;
        };

        legend.anchorVertical = function (x) {
            if (!arguments.length) return anchorVertical;
            if (x === "top" || x === "center" || x === "bottom") anchorVertical = x;
            return legend;
        };

        legend.anchorHorizontal = function (x) {
            if (!arguments.length) return anchorHorizontal;
            if (x !== "left" || x === "center" || x === "right") anchorHorizontal = x;
            return legend;
        };

        legend.seriesNames = function (x) {
            if (!arguments.length) return seriesNames;
            seriesNames = x;
            return legend;
        };

        legend.colourScale = function (x) {
            if (!arguments.length) return colourScale;
            colourScale = x;
            return legend;
        };

        legend.onMouseOver = function (x) {
            if (!arguments.length) return onMouseOver;
            onMouseOver = x;
            return legend;
        };

        legend.onMouseOut = function (x) {
            if (!arguments.length) return onMouseOut;
            onMouseOut = x;
            return legend;
        };

        legend.onClick = function (x) {
            if (!arguments.length) return onClick;
            onClick = x;
            return legend;
        };

        legend.selectedItems = function (x) {
            if (!arguments.length) return selectedItems;
            selectedItems = x;
            return legend;
        };

        return legend;
    }

    return {
        setters: [function (_) {
            _createClass = _["default"];
        }, function (_2) {
            _classCallCheck = _2["default"];
        }],
        execute: function () {
            "use strict";

            _export("d3legend", d3legend);

            d3tooltip = (function () {
                function d3tooltip(g) {
                    _classCallCheck(this, d3tooltip);

                    this.tip = g.append("div").attr("class", "plotify-tooltip");
                    this.pos = [0, 0];
                    this.hide();
                }

                _createClass(d3tooltip, [{
                    key: "position",
                    value: function position(pos) {
                        if (!arguments.length) return this.pos;
                        this.pos = pos;
                        this.tip.style("left", pos[0] + "px").style("top", pos[1] + "px");
                        return this;
                    }
                }, {
                    key: "move",
                    value: function move(pos, duration) {
                        this.pos = pos;
                        this.tip.transition().duration(duration).style("left", pos[0] + "px").style("top", pos[1] + "px");
                        return this;
                    }
                }, {
                    key: "hide",
                    value: function hide() {
                        this.tip.transition().delay(100).style("opacity", 0);
                        return this;
                    }
                }, {
                    key: "show",
                    value: function show() {
                        this.tip.transition().duration(0).style("opacity", 1);
                        return this;
                    }
                }, {
                    key: "html",
                    value: function html(content) {
                        this.tip.html(content);
                        return this;
                    }
                }]);

                return d3tooltip;
            })();

            _export("d3tooltip", d3tooltip);
        }
    };
});
$__System.register('8', [], false, function() {});
$__System.register('b', [], false, function() {});
$__System.register('d', [], false, function() {});
$__System.register('e', [], false, function() {});
$__System.register('10', [], false, function() {});
$__System.register('12', [], false, function() {});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define(["angular","angular","d3","angular","d3","angular","d3","angular","d3","angular","d3","angular"], factory);
  else
    factory();
});
//# sourceMappingURL=plotify.js.map