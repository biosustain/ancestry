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

(['0', '1', '2'], ["1","1","2","1","2","1","2","1","2","1","2","1","2","1","2","1"], function($__System) {

$__System.registerDynamic("f", ["1b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("1b"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("e", ["1c"], true, function(require, exports, module) {
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

$__System.registerDynamic("10", ["1d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("1d"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("11", ["1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("1e"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("18", ["10", "1f"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _getIterator = require("10")["default"];
  var _isIterable = require("1f")["default"];
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

$__System.registerDynamic("19", ["20"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("20")["default"];
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

$__System.registerDynamic("1a", [], true, function(require, exports, module) {
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

$__System.registerDynamic("1b", ["21", "22", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("21");
  require("22");
  module.exports = require("23").Array.from;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1c", ["24", "21", "25", "26", "27", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("24");
  require("21");
  require("25");
  require("26");
  require("27");
  module.exports = require("23").Set;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1d", ["25", "21", "28"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("25");
  require("21");
  module.exports = require("28");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1f", ["29"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("29"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1e", ["2a", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("2a");
  module.exports = require("23").Object.keys;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("20", ["2b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("2b"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("21", ["2c", "2d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $at = require("2c")(true);
  require("2d")(String, 'String', function(iterated) {
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

$__System.registerDynamic("22", ["2e", "2f", "30", "31", "32", "33", "34", "35"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ctx = require("2e"),
      $def = require("2f"),
      toObject = require("30"),
      call = require("31"),
      isArrayIter = require("32"),
      toLength = require("33"),
      getIterFn = require("34");
  $def($def.S + $def.F * !require("35")(function(iter) {
    Array.from(iter);
  }), 'Array', {from: function from(arrayLike) {
      var O = toObject(arrayLike),
          C = typeof this == 'function' ? this : Array,
          mapfn = arguments[1],
          mapping = mapfn !== undefined,
          index = 0,
          iterFn = getIterFn(O),
          length,
          result,
          step,
          iterator;
      if (mapping)
        mapfn = ctx(mapfn, arguments[2], 2);
      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) {
          result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
        }
      } else {
        for (result = new C(length = toLength(O.length)); length > index; index++) {
          result[index] = mapping ? mapfn(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("23", [], true, function(require, exports, module) {
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

$__System.registerDynamic("24", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("25", ["36", "37"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("36");
  var Iterators = require("37");
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("26", ["38", "39"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var strong = require("38");
  require("39")('Set', function(get) {
    return function Set() {
      return get(this, arguments[0]);
    };
  }, {add: function add(value) {
      return strong.def(this, value = value === 0 ? 0 : value, value);
    }}, strong);
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("27", ["2f", "3a"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $def = require("2f");
  $def($def.P, 'Set', {toJSON: require("3a")('Set')});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("28", ["3b", "34", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = require("3b"),
      get = require("34");
  module.exports = require("23").getIterator = function(it) {
    var iterFn = get(it);
    if (typeof iterFn != 'function')
      throw TypeError(it + ' is not iterable!');
    return anObject(iterFn.call(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("29", ["25", "21", "3c"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("25");
  require("21");
  module.exports = require("3c");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2a", ["30", "3d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toObject = require("30");
  require("3d")('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2b", ["3e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("3e");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2c", ["3f", "40"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = require("3f"),
      defined = require("40");
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

$__System.registerDynamic("2d", ["41", "2f", "42", "43", "44", "45", "37", "46", "3e", "47"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var LIBRARY = require("41"),
      $def = require("2f"),
      $redef = require("42"),
      hide = require("43"),
      has = require("44"),
      SYMBOL_ITERATOR = require("45")('iterator'),
      Iterators = require("37"),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
    require("46")(Constructor, NAME, next);
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
      var IteratorPrototype = require("3e").getProto(_default.call(new Base));
      require("47")(IteratorPrototype, TAG, true);
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

$__System.registerDynamic("2e", ["48"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var aFunction = require("48");
  module.exports = function(fn, that, length) {
    aFunction(fn);
    if (that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2f", ["49", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("49"),
      core = require("23"),
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

$__System.registerDynamic("30", ["40"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var defined = require("40");
  module.exports = function(it) {
    return Object(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("31", ["3b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = require("3b");
  module.exports = function(iterator, fn, value, entries) {
    try {
      return entries ? fn(anObject(value)[0], value[1]) : fn(value);
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined)
        anObject(ret.call(iterator));
      throw e;
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("32", ["37", "45"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var Iterators = require("37"),
      ITERATOR = require("45")('iterator');
  module.exports = function(it) {
    return (Iterators.Array || Array.prototype[ITERATOR]) === it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("33", ["3f"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = require("3f"),
      min = Math.min;
  module.exports = function(it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("34", ["4a", "45", "37", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = require("4a"),
      ITERATOR = require("45")('iterator'),
      Iterators = require("37");
  module.exports = require("23").getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("35", ["45"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var SYMBOL_ITERATOR = require("45")('iterator'),
      SAFE_CLOSING = false;
  try {
    var riter = [7][SYMBOL_ITERATOR]();
    riter['return'] = function() {
      SAFE_CLOSING = true;
    };
    Array.from(riter, function() {
      throw 2;
    });
  } catch (e) {}
  module.exports = function(exec) {
    if (!SAFE_CLOSING)
      return false;
    var safe = false;
    try {
      var arr = [7],
          iter = arr[SYMBOL_ITERATOR]();
      iter.next = function() {
        safe = true;
      };
      arr[SYMBOL_ITERATOR] = function() {
        return iter;
      };
      exec(arr);
    } catch (e) {}
    return safe;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("36", ["4b", "4c", "37", "4d", "2d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var setUnscope = require("4b"),
      step = require("4c"),
      Iterators = require("37"),
      toIObject = require("4d");
  require("2d")(Array, 'Array', function(iterated, kind) {
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

$__System.registerDynamic("37", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("38", ["3e", "43", "2e", "4e", "4f", "40", "50", "4c", "51", "44", "52", "53", "54", "2d", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3e"),
      hide = require("43"),
      ctx = require("2e"),
      species = require("4e"),
      strictNew = require("4f"),
      defined = require("40"),
      forOf = require("50"),
      step = require("4c"),
      ID = require("51")('id'),
      $has = require("44"),
      isObject = require("52"),
      isExtensible = Object.isExtensible || isObject,
      SUPPORT_DESC = require("53"),
      SIZE = SUPPORT_DESC ? '_s' : 'size',
      id = 0;
  var fastKey = function(it, create) {
    if (!isObject(it))
      return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!$has(it, ID)) {
      if (!isExtensible(it))
        return 'F';
      if (!create)
        return 'E';
      hide(it, ID, ++id);
    }
    return 'O' + it[ID];
  };
  var getEntry = function(that, key) {
    var index = fastKey(key),
        entry;
    if (index !== 'F')
      return that._i[index];
    for (entry = that._f; entry; entry = entry.n) {
      if (entry.k == key)
        return entry;
    }
  };
  module.exports = {
    getConstructor: function(wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function(that, iterable) {
        strictNew(that, C, NAME);
        that._i = $.create(null);
        that._f = undefined;
        that._l = undefined;
        that[SIZE] = 0;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, that[ADDER], that);
      });
      require("54")(C.prototype, {
        clear: function clear() {
          for (var that = this,
              data = that._i,
              entry = that._f; entry; entry = entry.n) {
            entry.r = true;
            if (entry.p)
              entry.p = entry.p.n = undefined;
            delete data[entry.i];
          }
          that._f = that._l = undefined;
          that[SIZE] = 0;
        },
        'delete': function(key) {
          var that = this,
              entry = getEntry(that, key);
          if (entry) {
            var next = entry.n,
                prev = entry.p;
            delete that._i[entry.i];
            entry.r = true;
            if (prev)
              prev.n = next;
            if (next)
              next.p = prev;
            if (that._f == entry)
              that._f = next;
            if (that._l == entry)
              that._l = prev;
            that[SIZE]--;
          }
          return !!entry;
        },
        forEach: function forEach(callbackfn) {
          var f = ctx(callbackfn, arguments[1], 3),
              entry;
          while (entry = entry ? entry.n : this._f) {
            f(entry.v, entry.k, this);
            while (entry && entry.r)
              entry = entry.p;
          }
        },
        has: function has(key) {
          return !!getEntry(this, key);
        }
      });
      if (SUPPORT_DESC)
        $.setDesc(C.prototype, 'size', {get: function() {
            return defined(this[SIZE]);
          }});
      return C;
    },
    def: function(that, key, value) {
      var entry = getEntry(that, key),
          prev,
          index;
      if (entry) {
        entry.v = value;
      } else {
        that._l = entry = {
          i: index = fastKey(key, true),
          k: key,
          v: value,
          p: prev = that._l,
          n: undefined,
          r: false
        };
        if (!that._f)
          that._f = entry;
        if (prev)
          prev.n = entry;
        that[SIZE]++;
        if (index !== 'F')
          that._i[index] = entry;
      }
      return that;
    },
    getEntry: getEntry,
    setStrong: function(C, NAME, IS_MAP) {
      require("2d")(C, NAME, function(iterated, kind) {
        this._t = iterated;
        this._k = kind;
        this._l = undefined;
      }, function() {
        var that = this,
            kind = that._k,
            entry = that._l;
        while (entry && entry.r)
          entry = entry.p;
        if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
          that._t = undefined;
          return step(1);
        }
        if (kind == 'keys')
          return step(0, entry.k);
        if (kind == 'values')
          return step(0, entry.v);
        return step(0, [entry.k, entry.v]);
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
      species(C);
      species(require("23")[NAME]);
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("39", ["3e", "2f", "43", "50", "4f", "49", "53", "55", "54", "47"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3e"),
      $def = require("2f"),
      hide = require("43"),
      forOf = require("50"),
      strictNew = require("4f");
  module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = require("49")[NAME],
        C = Base,
        ADDER = IS_MAP ? 'set' : 'add',
        proto = C && C.prototype,
        O = {};
    if (!require("53") || typeof C != 'function' || !(IS_WEAK || proto.forEach && !require("55")(function() {
      new C().entries().next();
    }))) {
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      require("54")(C.prototype, methods);
    } else {
      C = wrapper(function(target, iterable) {
        strictNew(target, C, NAME);
        target._c = new Base;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, target[ADDER], target);
      });
      $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','), function(KEY) {
        var chain = KEY == 'add' || KEY == 'set';
        if (KEY in proto && !(IS_WEAK && KEY == 'clear'))
          hide(C.prototype, KEY, function(a, b) {
            var result = this._c[KEY](a === 0 ? 0 : a, b);
            return chain ? this : result;
          });
      });
      if ('size' in proto)
        $.setDesc(C.prototype, 'size', {get: function() {
            return this._c.size;
          }});
    }
    require("47")(C, NAME);
    O[NAME] = C;
    $def($def.G + $def.W + $def.F, O);
    if (!IS_WEAK)
      common.setStrong(C, NAME, IS_MAP);
    return C;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3a", ["50", "4a"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var forOf = require("50"),
      classof = require("4a");
  module.exports = function(NAME) {
    return function toJSON() {
      if (classof(this) != NAME)
        throw TypeError(NAME + "#toJSON isn't generic");
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3b", ["52"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = require("52");
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3c", ["4a", "45", "37", "23"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = require("4a"),
      ITERATOR = require("45")('iterator'),
      Iterators = require("37");
  module.exports = require("23").isIterable = function(it) {
    var O = Object(it);
    return ITERATOR in O || '@@iterator' in O || Iterators.hasOwnProperty(classof(O));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3d", ["2f", "23", "55"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(KEY, exec) {
    var $def = require("2f"),
        fn = (require("23").Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $def($def.S + $def.F * require("55")(function() {
      fn(1);
    }), 'Object', exp);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3e", [], true, function(require, exports, module) {
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

$__System.registerDynamic("3f", [], true, function(require, exports, module) {
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

$__System.registerDynamic("40", [], true, function(require, exports, module) {
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

$__System.registerDynamic("41", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("42", ["43"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = require("43");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("43", ["3e", "56", "53"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("3e"),
      createDesc = require("56");
  module.exports = require("53") ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("44", [], true, function(require, exports, module) {
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

$__System.registerDynamic("45", ["57", "49", "51"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var store = require("57")('wks'),
      Symbol = require("49").Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || require("51"))('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("46", ["3e", "43", "45", "56", "47"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3e"),
      IteratorPrototype = {};
  require("43")(IteratorPrototype, require("45")('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: require("56")(1, next)});
    require("47")(Constructor, NAME + ' Iterator');
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("47", ["44", "43", "45"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var has = require("44"),
      hide = require("43"),
      TAG = require("45")('toStringTag');
  module.exports = function(it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG))
      hide(it, TAG, tag);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("48", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    if (typeof it != 'function')
      throw TypeError(it + ' is not a function!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("49", [], true, function(require, exports, module) {
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

$__System.registerDynamic("4a", ["58", "45"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = require("58"),
      TAG = require("45")('toStringTag'),
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

$__System.registerDynamic("4b", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function() {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4c", [], true, function(require, exports, module) {
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

$__System.registerDynamic("4d", ["59", "40"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var IObject = require("59"),
      defined = require("40");
  module.exports = function(it) {
    return IObject(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4e", ["3e", "45", "53"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3e"),
      SPECIES = require("45")('species');
  module.exports = function(C) {
    if (require("53") && !(SPECIES in C))
      $.setDesc(C, SPECIES, {
        configurable: true,
        get: function() {
          return this;
        }
      });
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4f", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it, Constructor, name) {
    if (!(it instanceof Constructor))
      throw TypeError(name + ": use the 'new' operator!");
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("50", ["2e", "31", "32", "3b", "33", "34"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = require("2e"),
      call = require("31"),
      isArrayIter = require("32"),
      anObject = require("3b"),
      toLength = require("33"),
      getIterFn = require("34");
  module.exports = function(iterable, entries, fn, that) {
    var iterFn = getIterFn(iterable),
        f = ctx(fn, that, entries ? 2 : 1),
        index = 0,
        length,
        step,
        iterator;
    if (typeof iterFn != 'function')
      throw TypeError(iterable + ' is not iterable!');
    if (isArrayIter(iterFn))
      for (length = toLength(iterable.length); length > index; index++) {
        entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      }
    else
      for (iterator = iterFn.call(iterable); !(step = iterator.next()).done; ) {
        call(iterator, f, step.value, entries);
      }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("51", [], true, function(require, exports, module) {
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

$__System.registerDynamic("52", [], true, function(require, exports, module) {
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

$__System.registerDynamic("53", ["55"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = !require("55")(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("54", ["42"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $redef = require("42");
  module.exports = function(target, src) {
    for (var key in src)
      $redef(target, key, src[key]);
    return target;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("55", [], true, function(require, exports, module) {
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

$__System.registerDynamic("58", [], true, function(require, exports, module) {
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

$__System.registerDynamic("57", ["49"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("49"),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("59", ["58"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = require("58");
  module.exports = 0 in Object('z') ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("56", [], true, function(require, exports, module) {
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

$__System.register('0', ['1', '3', '4', '5', '6', '7', '8', '9', 'a'], function (_export) {
    'use strict';

    var angular;
    return {
        setters: [function (_) {
            angular = _['default'];
        }, function (_2) {}, function (_3) {}, function (_4) {}, function (_5) {}, function (_6) {}, function (_7) {}, function (_8) {}, function (_a) {}],
        execute: function () {
            _export('default', angular.module('plotify', ['plotify.lineage', 'plotify.radial-lineage', 'plotify.radial-phylogenetic-tree', 'plotify.lineage-scatter', 'plotify.box', 'plotify.violin', 'plotify.line']));
        }
    };
});
$__System.register('3', ['1', '2', '10', '11', 'e', 'f', 'd', 'b', 'c'], function (_export) {
    var angular, d3, _getIterator, _Object$keys, _Set, _Array$from, d3tooltip, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar, createNodeTypes, createDynamicNodeAttr, testLabelLength, layoutTemplate;

    function RadialLineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-radial-lineage-plot");

                var svg = d3.select(element[0]).append("svg");

                var colours = d3.scale.category10(),
                    tooltip = new d3tooltip(d3.select(element[0])),
                    hovering = false,
                    virtualRoot = null,
                    virtualRootName = "virtual_root",
                    margin = 10,
                    r = undefined,
                    labelOffset = 20,
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    visibleSeries = new _Set();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var defs = svg.append("defs");

                    // do not continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    var seriesNames = _Array$from(new _Set(scope.value.data.map(function (d) {
                        return d.series;
                    })));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value),
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname;

                    var treeData = createTreeLayout(filterSeries(copy.data, visibleSeries)),
                        longestNodeName = treeData.length ? treeData.reduce(function (a, b) {
                        return a.name.length > b.name.length ? a : b;
                    }).name : "";

                    var elementWidth = element[0].offsetWidth;

                    r = layout.size / 2;
                    margin = layout.margin;

                    var isMultipleTree = treeData.length > 1,
                        multipleTreeOffset = isMultipleTree ? 30 : 0,
                        maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                        totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset,
                        colourBarOffset = 20,
                        start = null,
                        rotate = 0,
                        rotateOld = 0,
                        rotationDifference = undefined,
                        transitionScale = d3.scale.log().domain([1, 181]).range([0, 1500]),
                        reorgDuration = 1000,
                        prevX = 0,
                        heatmapColourScale = null,
                        heatmapCircle = d3.select(),
                        legendHeight = 0,
                        legendWidth = 0,
                        colourbarHeight = 0,
                        colourbarWidth = 0,
                        legend = d3.select(),
                        colourbar = d3.select();

                    var width = elementWidth,
                        height = layout.size;

                    var chart = svg.append("g").attr("transform", 'translate(' + margin + ',' + margin + ')');

                    if (layout.heatmap.enabled) {

                        var domain = d3.extent(copy.data, function (node) {
                            return node.z;
                        });

                        if (domain[0] == domain[1]) {
                            if (domain[0] === undefined) {
                                domain[0] = domain[1] = 0;
                            }
                            domain[0] -= 0.5;
                            domain[1] += 0.5;
                        }

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, layout.size);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, layout.size);

                            colourbar = chart.append("g").attr("class", "plotify-colourbar").attr("transform", "translate(0,0)");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect();

                            colourbarWidth = bbox.width;
                            colourbarHeight = bbox.height;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "plotify-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    width = elementWidth - 2 * margin;
                    height = layout.size + (layout.legend.position === "bottom" || layout.legend.position === "top" ? legendHeight : 0);

                    colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            posX = pos.x === "left" ? width / 2 - r : pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? height / 2 - r : pos.y === "bottom" ? height / 2 + r : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    if (isMultipleTree) {
                        virtualRoot = {
                            name: virtualRootName,
                            parent: null,
                            children: [],
                            treeId: 0,
                            _depth: 0,
                            type: undefined
                        };

                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _getIterator(treeData), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var tree = _step.value;

                                spreadNodes(tree);
                                tree.parent = virtualRootName;
                                virtualRoot.children.push(tree);
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

                        treeData = virtualRoot;
                    } else if (treeData.length) {
                        treeData = treeData[0];
                        spreadNodes(treeData);
                    }

                    var types = createNodeTypes(copy.data, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var cluster = d3.layout.cluster().size([360, 1]).sort(null).children(function (d) {
                        return d.children;
                    }).separation(function () {
                        return 1;
                    });

                    svg.attr("width", elementWidth).attr("height", height + 2 * layout.margin).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    svg.append("rect").attr("width", elementWidth).attr("height", r * 2).attr("fill", "none");

                    var visTranslate = [width / 2, r],
                        vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                    var nodes = visibleSeries.size ? cluster.nodes(treeData) : [],
                        links = cluster.links(nodes);

                    nodes.forEach(function (d) {
                        d.x0 = d.x; // remember initial position
                        if (d.name === virtualRootName) d.y = 0;else d.y = multipleTreeOffset + d._depth * totalTreeLength;
                    });

                    // TODO: implement equidistant generations
                    //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                    //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

                    if (layout.heatmap.enabled) {
                        heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodes.filter(function (n) {
                            return n.name != virtualRootName && !isNaN(parseFloat(n.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        });
                    }

                    var link = vis.selectAll("path.link").data(links).enter().append("path").attr("class", "link").attr("d", step).attr(layout.link).each(function (d) {
                        d.target.inLinkNode = this;
                        if (d.source.outLinkNodes) d.source.outLinkNodes.push(this);else d.source.outLinkNodes = [this];
                    });

                    var node = vis.selectAll("g.node").data(nodes.filter(function (n) {
                        return n.x !== undefined;
                    })).enter().append("g").attr("id", function (d) {
                        return d.name;
                    }).attr("class", "node").attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).on("click", clicked).each(function (d) {
                        d.nodeGroupNode = this;
                    });

                    if (isMultipleTree) {
                        var virtualNode = vis.select("g.node#virtual_root");

                        virtualNode.style("visibility", "hidden");
                        virtualNode.data()[0].outLinkNodes.forEach(function (link) {
                            d3.select(link).style("visibility", "hidden");
                        });
                    }

                    node.append("text").attr("class", "mouseover-label").attr("transform", "rotate(90)").attr("dy", ".25em").attr("dx", ".6em").attr(layout.nodeLabel).style("opacity", 1e-6).text(function (d) {
                        return d.name;
                    }).call(getBB);

                    node.insert("rect", "text").attr("x", function (d) {
                        return d.bbox.x - 3;
                    }).attr("y", function (d) {
                        return d.bbox.y;
                    }).attr("width", function (d) {
                        return d.bbox.width + 6;
                    }).attr("height", function (d) {
                        return d.bbox.height + 3;
                    }).attr("transform", "rotate(90)").style("fill", "white").style("opacity", 1e-6);

                    node.append("circle").style("stroke", function (d) {
                        return d.name !== virtualRootName ? colours(d.series) : "none";
                    }).attr(nodeAttr);

                    var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / nodes.filter(function (d) {
                        return !d.children || !d.children.length;
                    }).length;

                    layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                    var label = vis.selectAll("text.outer-label").data(nodes.filter(function (d) {
                        return d.x !== undefined && !d.children;
                    })).enter().append("text").attr(layout.outerNodeLabel).attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    }).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                    }).text(function (d) {
                        return d.name;
                    });

                    function mouseovered(active) {
                        return function (d) {

                            hovering = active;
                            var hoveredNode = d3.select(d.nodeGroupNode);

                            hoveredNode.select("text.mouseover-label").style("opacity", active ? 1 : 1e-6).attr("transform", active ? 'rotate(' + (-rotate - d.x + 90) + ')' : "rotate(90)");
                            hoveredNode.select("rect").style("opacity", active ? 0.9 : 1e-6).attr("transform", active ? 'rotate(' + (-rotate - d.x + 90) + ')' : "rotate(90)");

                            do {
                                d3.select(d.inLinkNode).classed("link-active", active).each(moveToFront);
                                if (d.outLinkNodes) {
                                    d.outLinkNodes.forEach(function (node) {
                                        return d3.select(node).classed("link-affected", active);
                                    });
                                }
                                d3.select(d.nodeGroupNode).classed("node-active", active).each(moveToFront).selectAll("circle").attr("stroke-width", function (d) {
                                    var strokeWidth = nodeAttr["stroke-width"](d);
                                    return active ? strokeWidth + 1 : strokeWidth;
                                });
                            } while (d = d.parent);

                            if (hoveredNode.classed("node-aligned")) {
                                d3.selectAll("g.node-aligned text.mouseover-label").style("opacity", active ? 1 : 1e-6);
                                d3.selectAll("g.node-aligned rect").style("opacity", active ? 0.9 : 1e-6);
                            }
                        };
                    }

                    function clicked(selectedNode) {
                        rotationDifference = selectedNode.x < prevX ? 360 - prevX + selectedNode.x : selectedNode.x - prevX;
                        if (rotationDifference > 180) rotationDifference = 360 - rotationDifference;
                        prevX = selectedNode.x;

                        rotate = 360 - selectedNode.x;
                        if (rotate > 360) rotate %= 360;else if (rotate < 0) rotate = (360 + rotate) % 360;

                        d3.selectAll("g.node text.mouseover-label").attr("transform", "rotate(90)").style("opacity", 1e-6);
                        d3.selectAll("g.node rect").attr("transform", "rotate(90)").style("opacity", 1e-6);

                        var alignedNotActive = d3.selectAll("g.node-aligned:not(.node-active)"),
                            duration = alignedNotActive.size() || !rotateOld ? reorgDuration : 0;

                        alignedNotActive.classed("node-aligned", false).each(function (d) {
                            d._x = d.x;
                            d.x = d.x0;
                        }).transition().duration(duration).attrTween("transform", tweenNodeGroup).each("end", function (d) {
                            return d._x = undefined;
                        });

                        heatmapCircle.transition().duration(duration).attrTween("transform", tweenNodeGroup);

                        d3.selectAll("g.node-active").classed("node-aligned", true).each(function (d) {
                            d._x = d.x;
                            d.x = selectedNode.x;
                        }).transition().duration(duration).attrTween("transform", tweenNodeGroup);

                        d3.selectAll("path.link-affected, path.link-displaced").classed("link-displaced", true).transition().duration(duration).attrTween("d", tweenPath);

                        d3.selectAll("path.link-displaced:not(.link-affected)").classed("link-displaced", false);

                        d3.selectAll("g.node-aligned text.mouseover-label").transition().style("opacity", 1);

                        d3.selectAll("g.node-aligned rect").style("opacity", 0.9);

                        if (rotationDifference > 0) {
                            vis.transition().delay(duration).duration(transitionScale(rotationDifference + 1)).attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').each("end", function () {
                                d3.select(this).selectAll("text.outer-label").attr("text-anchor", function (d) {
                                    return (d.x + rotate) % 360 < 180 ? "start" : "end";
                                }).attr("transform", function (d) {
                                    return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                                });
                            });
                        }

                        rotateOld = rotate;
                    }

                    svg.on("mousedown", function () {
                        if (!hovering) {
                            svg.style("cursor", "move");
                            start = mouse(this);
                            d3.event.preventDefault();
                        }
                    });
                    svg.on("mouseup", function () {
                        if (start && !hovering) {
                            svg.style("cursor", "auto");
                            var m = mouse(svg.node());
                            rotate += Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            if (rotate > 360) rotate %= 360;else if (rotate < 0) rotate = (360 + rotate) % 360;
                            start = null;
                            vis.attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').selectAll("text.outer-label").attr("text-anchor", function (d) {
                                return (d.x + rotate) % 360 < 180 ? "start" : "end";
                            }).attr("transform", function (d) {
                                return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                            });
                        }
                    }).on("mousemove", function () {
                        if (start) {
                            var m = mouse(svg.node());
                            var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            vis.attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + (rotate + delta) + ')');
                        }
                    });

                    function mouse(element) {
                        return d3.mouse(element).map(function (d, i) {
                            return d - visTranslate[i];
                        });
                    }

                    function getBB(selection) {
                        selection.each(function (d) {
                            d.bbox = this.getBBox();
                        });
                    }

                    function moveToFront() {
                        this.parentNode.appendChild(this);
                    }

                    function project(d) {
                        var r = d.y,
                            a = (d.x - 90) / 180 * Math.PI;
                        return [r * Math.cos(a), r * Math.sin(a)];
                    }

                    function cross(a, b) {
                        return a[0] * b[1] - a[1] * b[0];
                    }

                    function dot(a, b) {
                        return a[0] * b[0] + a[1] * b[1];
                    }

                    function step(d) {
                        var s = project(d.source),
                            m = project({ x: d.target.x, y: d.source.y }),
                            t = project(d.target),
                            r = d.source.y,
                            sweep = d.target.x > d.source.x ? 1 : 0,
                            largeArc = Math.abs(d.target.x - d.source.x) % 360 > 180 ? 1 : 0;

                        return 'M' + s[0] + ',' + s[1] + 'A' + r + ',' + r + ' 0 ' + largeArc + ',' + sweep + ' ' + m[0] + ',' + m[1] + 'L' + t[0] + ',' + t[1];
                    }

                    function tweenPath(d) {
                        var midSourceX = d.source._x !== undefined ? d3.interpolateNumber(d.source._x, d.source.x) : function () {
                            return d.source.x;
                        },
                            midTargetX = d.target._x !== undefined ? d3.interpolateNumber(d.target._x, d.target.x) : function () {
                            return d.target.x;
                        },
                            midpoints = { target: { x: 0, y: d.target.y }, source: { x: 0, y: d.source.y } };

                        return function (t) {
                            midpoints.source.x = midSourceX(t);
                            midpoints.target.x = midTargetX(t);
                            return step(midpoints);
                        };
                    }

                    function tweenNodeGroup(d) {
                        var midpointX = d._x !== undefined ? d3.interpolateNumber(d._x, d.x) : function () {
                            return d.x;
                        };

                        return function (t) {
                            var x = midpointX(t);
                            return 'rotate(' + (x - 90) + ')translate(' + d.y + ')';
                        };
                    }
                }
                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ isNewData: false });
                });

                scope.$watch("value", function () {
                    render({ isNewData: true });
                });
            }
        };
    }

    function spreadNodes(node) {
        var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        if (!node.children || !node.children.length) {
            node._depth = 1;
            return level;
        }
        var max = 1,
            childMax = undefined;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = _getIterator(node.children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var child = _step2.value;

                childMax = spreadNodes(child, level + 1);
                if (childMax > max) {
                    max = childMax;
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

        node._depth = level / max;
        return max;
    }

    function filterSeries(nodes, activeSeries) {
        var filteredNodes = [],
            nodesDict = {},
            parent = undefined;

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = _getIterator(nodes), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var node = _step3.value;

                nodesDict[node.name] = node;
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

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _getIterator(nodes), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var node = _step4.value;

                var currentNode = node;
                if (!activeSeries.has(currentNode.series)) continue;
                while (parent = currentNode.parent) {
                    var parentNode = nodesDict[parent];
                    if (activeSeries.has(parentNode.series)) {
                        node.parent = parent;
                        break;
                    }
                    currentNode = parentNode;
                }
                if (node.parent && !activeSeries.has(nodesDict[node.parent].series)) {
                    node.parent = null;
                }
                filteredNodes.push(node);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        return filteredNodes;
    }

    return {
        setters: [function (_3) {
            angular = _3['default'];
        }, function (_4) {
            d3 = _4['default'];
        }, function (_) {
            _getIterator = _['default'];
        }, function (_2) {
            _Object$keys = _2['default'];
        }, function (_e) {
            _Set = _e['default'];
        }, function (_f) {
            _Array$from = _f['default'];
        }, function (_d) {}, function (_b) {}, function (_c) {
            d3tooltip = _c.d3tooltip;
            d3legend = _c.d3legend;
            createTreeLayout = _c.createTreeLayout;
            mergeTemplateLayout = _c.mergeTemplateLayout;
            calcColourBarSize = _c.calcColourBarSize;
            drawColourBar = _c.drawColourBar;
            createNodeTypes = _c.createNodeTypes;
            createDynamicNodeAttr = _c.createDynamicNodeAttr;
            testLabelLength = _c.testLabelLength;
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: "",
                size: 700,
                margin: 25,
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                outerNodeLabel: {
                    "font-size": 14
                },
                link: {
                    stroke: "#ccc",
                    "stroke-width": 1
                },
                heatmap: {
                    enabled: false,
                    colourScale: [[0, '#008ae5'], [1, 'yellow']],
                    colourBar: {
                        show: true,
                        height: "70%",
                        width: 30
                    },
                    circle: {
                        r: 16
                    },
                    opacity: 0.4
                },
                legend: {
                    show: false,
                    position: {
                        x: "right",
                        y: "center"
                    },
                    anchor: {
                        x: "outside",
                        y: "inside"
                    },
                    orientation: "vertical"
                }
            };

            _export('default', angular.module('plotify.radial-lineage', ['plotify.utils']).directive('radialLineagePlot', RadialLineagePlotDirective));
        }
    };
});
$__System.register('4', ['1', '2', '10', '11', '12', 'e', 'f', 'b', 'c'], function (_export) {
    var angular, d3, _getIterator, _Object$keys, _Set, _Array$from, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar, createNodeTypes, createDynamicNodeAttr, testLabelLength, layoutTemplate;

    function RadialPhylogeneticTreeDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                branchlength: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-radial-phylogenetic-tree");

                var svg = d3.select(element[0]).append("svg");

                var hovering = false,
                    virtualRoot = null,
                    virtualRootName = "virtual_root",
                    margin = undefined,
                    r = undefined,
                    labelOffset = 20,
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    link = null,
                    node = null,
                    linkExtension = null,
                    totalTreeLength = undefined,
                    multipleTreeOffset = 0,
                    visibleSeries = new _Set(),
                    colours = d3.scale.category10();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var defs = svg.append("defs");

                    // do not continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    var seriesNames = _Array$from(new _Set(extractProp(scope.value.data, "series")));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value),
                        treeData = copy.data,
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname,
                        longestNodeName = treeData.length ? extractProp(treeData, "name").reduce(function (a, b) {
                        return a.length > b.length ? a : b;
                    }) : "";

                    var elementWidth = element[0].offsetWidth;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _getIterator(treeData), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var t = _step.value;

                            collapseSeries(t, visibleSeries);
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

                    r = layout.size / 2;
                    margin = layout.margin;

                    var isMultipleTree = treeData.length > 1,
                        maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                        colourBarOffset = 20,
                        start = null,
                        rotate = 0,
                        heatmapColourScale = null,
                        heatmapCircle = null,
                        trees = null,
                        legendHeight = 0,
                        legendWidth = 0,
                        colourbarHeight = 0,
                        colourbarWidth = 0,
                        legend = d3.select(),
                        colourbar = d3.select();

                    var width = elementWidth,
                        height = layout.size;

                    var chart = svg.append("g").attr("transform", 'translate(' + margin + ',' + margin + ')');

                    multipleTreeOffset = isMultipleTree ? 30 : 0;
                    totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset;

                    if (layout.heatmap.enabled) {

                        var domain = d3.extent(copy.data, function (node) {
                            return node.z;
                        });

                        if (domain[0] == domain[1]) {
                            if (domain[0] === undefined) {
                                domain[0] = domain[1] = 0;
                            }
                            domain[0] -= 0.5;
                            domain[1] += 0.5;
                        }

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, layout.size);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, layout.size);

                            colourbar = chart.append("g").attr("class", "plotify-colourbar").attr("transform", "translate(0,0)");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect();

                            colourbarWidth = bbox.width;
                            colourbarHeight = bbox.height;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "plotify-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    width = elementWidth - 2 * margin;
                    height = layout.size + (layout.legend.position === "bottom" || layout.legend.position === "top" ? legendHeight : 0);

                    colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            posX = pos.x === "left" ? width / 2 - r : pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? height / 2 - r : pos.y === "bottom" ? height / 2 + r : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    if (isMultipleTree) {
                        virtualRoot = {
                            name: virtualRootName,
                            parent: null,
                            children: [],
                            series: 0,
                            _depth: 0,
                            length: 0,
                            type: undefined
                        };

                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = _getIterator(treeData), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var tree = _step2.value;

                                spreadNodes(tree);
                                tree.parent = virtualRootName;
                                virtualRoot.children.push(tree);
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

                        trees = virtualRoot;
                    } else {
                        trees = treeData[0];
                        spreadNodes(trees);
                    }

                    var types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var cluster = d3.layout.cluster().size([360, 1]).sort(function (a, b) {
                        return d3.ascending(a.length, b.length);
                    }).children(function (d) {
                        return d.children;
                    }).separation(function () {
                        return 1;
                    });

                    svg.attr("width", elementWidth).attr("height", height + 2 * layout.margin).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    svg.append("rect").attr("width", elementWidth).attr("height", r * 2).attr("fill", "none");

                    var visTranslate = [width / 2, r],
                        vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                    var nodes = cluster.nodes(trees),
                        links = cluster.links(nodes);

                    nodes.forEach(function (d) {
                        d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d._depth * totalTreeLength;
                    });

                    if (layout.heatmap.enabled) {
                        heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodes.filter(function (n) {
                            return n.taxon && n.taxon.name !== null && !isNaN(parseFloat(n.taxon.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.taxon.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        });
                    }

                    removeNegativeLengths(trees);
                    setRadius(trees, trees.length = 0, totalTreeLength / maxLength(trees));

                    var show = scope.branchlength !== undefined ? scope.branchlength : true;
                    linkExtension = vis.append("g").selectAll("path").data(links.filter(function (d) {
                        return !d.target.children;
                    })).enter().append("path").attr("class", "link-extension").each(function (d) {
                        d.target.linkExtensionNode = this;
                    }).attr("d", function (d) {
                        return step2(d.target.x, show ? d.target.radius : d.target.y, d.target.x, totalTreeLength + multipleTreeOffset);
                    });

                    link = vis.append("g").selectAll("path").data(links).enter().append("path").attr("class", "link").attr(layout.link).each(function (d) {
                        d.target.linkNode = this;
                    }).attr("d", function (d) {
                        return step2(d.source.x, show ? d.source.radius : d.source.y, d.target.x, show ? d.target.radius : d.target.y);
                    }).style("stroke", "black");

                    if (isMultipleTree) {
                        link.filter(function (d) {
                            return d.source.name === virtualRootName;
                        }).style("opacity", 0);
                    }

                    if (layout.showLeafNodes) {
                        node = vis.selectAll("g.node").data(nodes).enter().append("g")
                        //.attr("id", d => d.name)
                        .attr("class", "node").attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).each(function (d) {
                            d.nodeGroupNode = this;
                        });

                        node.filter(function (d) {
                            return !d.taxon;
                        }).style("opacity", 0);

                        node.append("circle").style("stroke", function (d) {
                            return d.taxon && d.name !== virtualRootName ? colours(d.taxon.series) : "none";
                        }).attr(nodeAttr);
                    }

                    var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / nodes.filter(function (d) {
                        return !d.children || !d.children.length;
                    }).length;

                    layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                    var label = vis.selectAll("text.outer-label").data(nodes.filter(function (d) {
                        return !!d.taxon;
                    })).enter().append("text").attr(layout.outerNodeLabel).attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    }).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                    }).text(function (d) {
                        return d.taxon.name;
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false));

                    function mouseovered(active) {
                        return function (d) {
                            d3.select(this).classed("label-active", active);
                            d3.select(d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                            do d3.select(d.linkNode).classed("link-active", active).each(moveToFront); while (d = d.parent);
                        };
                    }

                    svg.on("mousedown", function () {
                        if (!hovering) {
                            svg.style("cursor", "move");
                            start = mouse(this);
                            d3.event.preventDefault();
                        }
                    });
                    svg.on("mouseup", function () {
                        if (start && !hovering) {
                            svg.style("cursor", "auto");
                            var m = mouse(svg.node());
                            rotate += Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            if (rotate > 360) rotate %= 360;else if (rotate < 0) rotate = (360 + rotate) % 360;
                            start = null;
                            vis.attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').selectAll("text.outer-label").attr("text-anchor", function (d) {
                                return (d.x + rotate) % 360 < 180 ? "start" : "end";
                            }).attr("transform", function (d) {
                                return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                            });
                        }
                    }).on("mousemove", function () {
                        if (start) {
                            var m = mouse(svg.node());
                            var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            vis.attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + (rotate + delta) + ')');
                        }
                    });

                    function mouse(element) {
                        return d3.mouse(element).map(function (d, i) {
                            return d - visTranslate[i];
                        });
                    }

                    function moveToFront() {
                        this.parentNode.appendChild(this);
                    }

                    function cross(a, b) {
                        return a[0] * b[1] - a[1] * b[0];
                    }

                    function dot(a, b) {
                        return a[0] * b[0] + a[1] * b[1];
                    }
                }

                function setRadius(d, y0, k) {
                    d.radius = (y0 += d.length) * k + multipleTreeOffset;
                    if (d.children && d.children.length > 0) d.children.forEach(function (d) {
                        return setRadius(d, y0, k);
                    });
                }

                function removeNegativeLengths(d) {
                    if (d.length < 0) d.length = 0;
                    if (d.children && d.children.length > 0) d.children.forEach(removeNegativeLengths);
                }

                function maxLength(d) {
                    return d.length + (d.children && d.children.length > 0 ? d3.max(d.children, maxLength) : 0);
                }

                function step2(startAngle, startRadius, endAngle, endRadius) {
                    var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
                        s0 = Math.sin(startAngle),
                        c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
                        s1 = Math.sin(endAngle);
                    return "M" + startRadius * c0 + "," + startRadius * s0 + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1) + "L" + endRadius * c1 + "," + endRadius * s1;
                }

                function extractProp(trees, prop) {
                    var names = [];
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = _getIterator(trees), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var tree = _step3.value;

                            extract(tree);
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

                    function extract(tree) {
                        if (tree.taxon !== null) names.push(tree.taxon[prop]);else {
                            extract(tree.children[0]);
                            extract(tree.children[1]);
                        }
                    }
                    return names;
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ isNewData: false });
                });

                scope.$watch("value", function () {
                    render({ isNewData: true });
                });

                scope.$watch("branchlength", function (show) {
                    if (!linkExtension || !link) return;
                    d3.transition().duration(750).each(function () {
                        linkExtension.transition().attr("d", function (d) {
                            return step2(d.target.x, show ? d.target.radius : d.target.y, d.target.x, totalTreeLength + multipleTreeOffset);
                        });
                        link.transition().attr("d", function (d) {
                            return step2(d.source.x, show ? d.source.radius : d.source.y, d.target.x, show ? d.target.radius : d.target.y);
                        });
                    });
                });
            }
        };
    }

    function spreadNodes(node) {
        var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        if (!node.children || !node.children.length) {
            node._depth = 1;
            return level;
        }
        var max = 1,
            childMax = undefined;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _getIterator(node.children), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var child = _step4.value;

                childMax = spreadNodes(child, level + 1);
                if (childMax > max) {
                    max = childMax;
                }
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        node._depth = level / max;
        return max;
    }

    function collapseSeries(tree, visibleSeries) {

        var leaves = [];
        (function findLeaves(t) {
            if (t.taxon !== null) {
                leaves.push(t);
                return;
            }
            findLeaves(t.children[0]);
            findLeaves(t.children[1]);
        })(tree);
        (function addParents(t, parent) {
            if (parent) {
                t.parent = parent;
            }
            if (t.taxon !== null) {
                return;
            }
            addParents(t.children[0], t);
            addParents(t.children[1], t);
        })(tree, null);
        var leavesOut = leaves.filter(function (l) {
            return !visibleSeries.has(l.taxon.series);
        });

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = _getIterator(leavesOut), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var leaf = _step5.value;

                var _parent = leaf.parent;
                if (!_parent && leaf.taxon) {
                    return null;
                }
                var sibling = _parent.children[_parent.children.indexOf(leaf) ^ 1];
                var parent2 = _parent.parent;
                if (!parent2) {
                    return sibling;
                }
                parent2.children[parent2.children.indexOf(_parent)] = sibling;
                sibling.length += _parent.length;
                sibling.parent = parent2;
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                    _iterator5['return']();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }
    }

    return {
        setters: [function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_) {
            _getIterator = _['default'];
        }, function (_2) {
            _Object$keys = _2['default'];
        }, function (_3) {}, function (_e) {
            _Set = _e['default'];
        }, function (_f) {
            _Array$from = _f['default'];
        }, function (_b) {}, function (_c) {
            d3legend = _c.d3legend;
            createTreeLayout = _c.createTreeLayout;
            mergeTemplateLayout = _c.mergeTemplateLayout;
            calcColourBarSize = _c.calcColourBarSize;
            drawColourBar = _c.drawColourBar;
            createNodeTypes = _c.createNodeTypes;
            createDynamicNodeAttr = _c.createDynamicNodeAttr;
            testLabelLength = _c.testLabelLength;
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: "",
                size: 600,
                margin: 25,
                nodeTypes: {},
                showLeafNodes: true,
                outerNodeLabel: {
                    "font-size": 14
                },
                link: {
                    "stroke-width": 1.5
                },
                heatmap: {
                    enabled: false,
                    colourScale: [[0, '#008ae5'], [1, 'yellow']],
                    colourBar: {
                        show: true,
                        height: "70%",
                        width: 30
                    },
                    circle: {
                        r: 16
                    },
                    opacity: 0.4
                },
                legend: {
                    show: false,
                    position: {
                        x: "right",
                        y: "center"
                    },
                    anchor: {
                        x: "outside",
                        y: "inside"
                    },
                    orientation: "vertical"
                }
            };

            _export('default', angular.module('plotify.radial-phylogenetic-tree', ['plotify.utils']).directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective));
        }
    };
});
$__System.register('5', ['1', '2', '10', '11', '13', 'e', 'f', 'b', 'c'], function (_export) {
    var angular, d3, _getIterator, _Object$keys, _Set, _Array$from, d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, labelCollisionDetection, createTreeLayout, spreadGenerations, createDynamicNodeAttr, scaleProperties, getNodeLabelBBox, drawColourBar, calcColourBarSize, layoutTemplate, labelPositions;

    function LineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-lineage-plot");

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var maxAllowedDepth = 180,
                    mouseStart = null,
                    colours = d3.scale.category10(),
                    isDrag = false,
                    selectionRect = null,
                    tooltip = new d3tooltip(d3.select(element[0])),
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    scale = 1,
                    translate = [0, 0],
                    selectedNodes = null,
                    LCD = null,
                    // label collision detection
                lastLCDUpdateTime = 0,
                    LCDUpdateID = undefined,
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    visibleSeries = new _Set();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();
                    var defs = svg.append("defs");

                    selectedNodes = new _Set();

                    if (!scope.value || !scope.value.data.length) return;

                    var seriesNames = _Array$from(new _Set(scope.value.data.map(function (d) {
                        return d.series;
                    })));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value),
                        treeData = filterSeries(copy.data, visibleSeries),
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname,
                        legendHeight = 0,
                        legendWidth = 0,
                        colourbarHeight = 0,
                        colourbarWidth = 0,
                        colourBarOffset = layout.heatmap.colourBar.show ? 20 : 0,
                        colourbar = d3.select(),
                        legend = d3.select();

                    var initialLabelPosition = labelPositions[0];

                    var virtualRootNode = { name: "virtualRoot", children: [], parent: null };

                    var allTrees = createTreeLayout(treeData),
                        root = virtualRootNode;

                    virtualRootNode.children = allTrees.map(function (node) {
                        node.parent = "virtualRoot";
                        return node;
                    });

                    if (layout.axis.valueProperty === "default") {
                        spreadGenerations(root);
                    }

                    var types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    // FIXME: time plotting not implemented / checked yet
                    var isTimePlot = false; //trees[0].generation instanceof Date;

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var margin = { top: 50, right: 10, bottom: 10, left: 30 };

                    if (!layout.title) margin.top = 25;
                    if (layout.axis.show) margin.bottom += 20;
                    if (layout.axis.title) margin.bottom += 25;

                    var width = elementWidth - margin.right - margin.left,
                        height = 600 - margin.top - margin.bottom;

                    // render chart area
                    svg.attr("width", width + margin.left + margin.top).attr("height", height + margin.top + margin.bottom);

                    var chart = svg.append("g");

                    if (layout.heatmap.enabled) {

                        var domain = d3.extent(treeData, function (node) {
                            return node.z;
                        });

                        if (domain[0] == domain[1]) {
                            if (domain[0] === undefined) {
                                domain[0] = domain[1] = 0;
                            }
                            domain[0] -= 0.5;
                            domain[1] += 0.5;
                        }

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                            colourbar = chart.append("g").attr("class", "plotify-colourbar");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect(),
                                pos = layout.heatmap.colourBar.position;
                            colourbarWidth = bbox.width;
                            colourbarHeight = bbox.height;
                            if (pos === "right" || pos === "left") margin.right += colourbarWidth + colourBarOffset;else if (pos === "top" || pos === "bottom") margin.top += colourbarHeight;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "plotify-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    width = elementWidth - margin.right - margin.left;
                    height = 600 - margin.top - margin.bottom;

                    colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            xAxisOffset = layout.axis.show ? 15 : 0,
                            posX = pos.x === "left" ? 0 : pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? 0 : pos.y === "bottom" ? height + (anchor.y === "outside" ? xAxisOffset : 0) : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    // diagonal generator
                    var diagonal = d3.svg.diagonal().target(function (d) {
                        return { x: d.target.y, y: d.target.x };
                    }).source(function (d) {
                        return { x: d.source.y, y: d.source.x };
                    }).projection(function (d) {
                        return [d.y, d.x];
                    });

                    var treeLayout = d3.layout.tree().size([height, width]),
                        nodes = treeLayout.nodes(root).reverse(),
                        links = treeLayout.links(nodes),
                        generationExtent = d3.extent(nodes, function (node) {
                        return node.generation;
                    });

                    generationExtent[1] += 1;
                    var depth = width / (generationExtent[1] - generationExtent[0]);

                    // trim depth if exceeds maximum allowed depth
                    if (depth > maxAllowedDepth) {
                        depth = maxAllowedDepth;
                        generationExtent[1] = width / depth;
                    }

                    // define x scale
                    var xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear()).domain(generationExtent).range([0, width]);

                    var xScale0 = xScale.copy();

                    var zoom = d3.behavior.zoom().scaleExtent([1, layout.maxZoom])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                    var clip = defs.append("svg:clipPath").attr("id", "lineage-clip-rect").append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                    chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')').call(zoom).on("dblclick.zoom", onDoubleClick);

                    // Define x axis and grid
                    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height);

                    // Calculate depth positions.
                    nodes.forEach(function (node) {
                        node.y = node.x;
                        node.x = xScale(node.generation);
                    });
                    //render x axis
                    if (layout.axis.show) {
                        chart.append("g").attr("class", "axis x-axis").attr("transform", 'translate(0, ' + height + ')').call(xAxis);
                    }

                    // render chart title
                    if (layout.title) {
                        chart.append("text").attr("x", width / 2).attr("y", 0 - margin.top / 2).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    // render x axis label if exists
                    if (layout.axis.title && layout.axis.show) {
                        chart.append("text") // text label for the x axis
                        .attr("class", "axis-title").style("text-anchor", "middle").text(layout.axis.title).attr("transform", 'translate(' + width / 2 + ', ' + (height + 50) + ')');
                    }

                    if (layout.axis.gridOnly) {
                        chart.selectAll("g.x-axis path.domain, g.x-axis g.tick text, text.axis-title").style("opacity", 1e-6);
                    }

                    var mouseCaptureGroup = chart.append("g");

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    var treesContainer = chart.append("g").attr("clip-path", 'url(' + pathname + '#lineage-clip-rect)').append("g").attr("id", "trees-containter");
                    //.call(zoom)

                    if (layout.heatmap.enabled) {
                        heatmapCircle = treesContainer.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodes.filter(function (n) {
                            return n.name != "virtualRoot" && !isNaN(parseFloat(n.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        });
                    }

                    // Declare the nodes
                    var node = treesContainer.selectAll("g.node").data(nodes.filter(function (n) {
                        return n.name != "virtualRoot";
                    }));

                    // Enter the nodes.
                    var nodeEnter = node.enter().append("g").attr("class", "node").classed("selected", function (d) {
                        return selectedNodes.has(d.name);
                    }).attr("transform", function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });

                    // Add node circles
                    var circle = nodeEnter.append("circle").attr("class", "node-circle").attr(nodeAttr).style("fill", function (d) {
                        return !selectedNodes.has(d.name) ? '#FFF' : colours(d.series);
                    }).style("stroke", function (d) {
                        return colours(d.series);
                    }).each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d, i) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.series) + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    // Add node labels
                    var label = nodeEnter.append("text").attr("class", "node-label").attr("dy", ".35em").attr(layout.nodeLabel).attr(initialLabelPosition).text(function (d) {
                        return d.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.width;
                    })),
                        searchRadius = 2 * maxNodeLabelLength + 10;

                    if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                        LCD = new labelCollisionDetection(nodes.slice(0, -1), labelPositions, layout.nodeLabel, function (x) {
                            return x;
                        }, function (y) {
                            return y;
                        }, width, height, searchRadius);
                        LCD.initializeLabelPositions(label);
                    }

                    // Declare the links
                    var link = treesContainer.selectAll("path.link").data(links.filter(function (l) {
                        return l.source.name != "virtualRoot";
                    }));

                    // Enter the links.
                    link.enter().insert("path", "g").attr("class", "link").attr("d", diagonal).attr(layout.link);

                    legend.each(function () {
                        this.parentNode.appendChild(this);
                    });

                    if (layout.groupSelection.enabled) {
                        mouseRect.on("mousedown", mouseDown).on("mousemove", mouseMove).on("mouseup", mouseUp).on("mouseout", mouseOut);

                        selectionRect = mouseCaptureGroup.append("rect").attr(layout.groupSelection.selectionRectangle).attr("class", "selection-rect");
                    }

                    function mouseDown() {
                        if (!d3.event.ctrlKey) return;
                        d3.event.preventDefault();
                        isDrag = true;
                        mouseStart = d3.mouse(this);
                        circle.style("pointer-events", "none");
                    }

                    function click() {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle.node-circle").style("fill", function (d) {
                                return colours(d.series);
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle.node-circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseUp(pos) {
                        if (!isDrag || !mouseStart) return;

                        var p = arguments.length == 1 ? pos : d3.mouse(this);
                        if (!selectPoints(selectionRect) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) {
                            node.classed("selected", false).selectAll("circle.node-circle").style("fill", "#FFF");
                        }
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseOut() {
                        if (!isDrag) return;
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseMove() {
                        if (!isDrag) return;
                        var p = d3.mouse(this);
                        if (!d3.event.ctrlKey) {
                            mouseUp(p);
                            return;
                        }
                        var d = {
                            x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                            y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                        selectionRect.attr(d);
                        selectPoints(selectionRect);
                    }

                    function selectPoints(rect) {
                        var rect_x1 = +rect.attr("x"),
                            rect_y1 = +rect.attr("y"),
                            rect_x2 = +rect.attr("width") + rect_x1,
                            rect_y2 = +rect.attr("height") + rect_y1,
                            any = false;

                        node.each(function (d, i) {
                            var n = d3.select(this);
                            var t = d3.transform(n.attr("transform")),
                                tx = t.translate[0],
                                ty = t.translate[1];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle.node-circle").style("fill", function (d) {
                                    return colours(d.series);
                                });
                                any = true;
                            } else if (!selectedNodes.has(d.name)) {
                                n.classed("selected", false);
                                n.select("circle.node-circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var wasChange = false;

                        svg.selectAll("g.node.selected").each(function (d) {
                            if (!selectedNodes.has(d.name)) {
                                selectedNodes.add(d.name);
                                wasChange = true;
                            }
                        });

                        svg.selectAll("g.node:not(.selected)").each(function (d) {
                            if (selectedNodes.has(d.name)) {
                                selectedNodes['delete'](d.name);
                                wasChange = true;
                            }
                        });

                        if (wasChange && scope.selectedNodes) {
                            scope.selectedNodes = _Array$from(selectedNodes);
                            scope.$apply();
                        }
                    }

                    function zoomed() {
                        if (d3.event.sourceEvent.ctrlKey) {
                            zoom.translate(translate);
                            zoom.scale(scale);
                            return;
                        }

                        var t = zoom.translate(),
                            s = zoom.scale(),
                            now = performance.now();
                        if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                        scale = s;
                        translate = t;
                        translate[0] = translate[0].clamp((1 - scale) * width, 0);
                        translate[1] = translate[1].clamp((1 - scale) * height, 0);
                        zoom.translate(translate);
                        xScale.domain(xScale0.range().map(function (x) {
                            return (x - translate[0]) / scale;
                        }).map(xScale0.invert));
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = now;
                        }
                    }

                    function applyZoom() {
                        treesContainer.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        xAxis.ticks(xScale.domain().reduce(function (a, b) {
                            return b - a;
                        }));
                        svg.select(".x-axis.axis").call(xAxis);
                        if (layout.axis.gridOnly) {
                            chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
                        }
                        svg.selectAll(".node circle.node-circle").attr(scaleProperties(nodeAttr, scale, true)).attr("stroke", function (d) {
                            return colours(d.series);
                        }).each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });
                        if (layout.heatmap.enabled) {
                            heatmapCircle.attr(scaleProperties(layout.heatmap.circle, scale));
                        }
                        svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                        if (layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay" || layout.labelCollisionDetection.enabled === "never") {
                            label.each(function (d) {
                                var self = d3.select(this);
                                self.attr(scaleProperties(layout.nodeLabel, scale)).attr(scaleProperties(d.labelPos, scale));
                            });
                        }

                        if (layout.groupSelection.enabled) {
                            selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                        }
                    }

                    function onDoubleClick() {
                        var now = performance.now();
                        scale = 1;
                        translate = [0, 0];
                        zoom.scale(1);
                        xScale.domain(xScale0.domain());
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = now;
                        }
                    }
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ isNewData: false });
                });

                scope.$watch("value", function () {
                    render({ isNewData: true });
                });
            }
        };
    }

    function filterSeries(nodes, activeSeries) {
        var filteredNodes = [],
            nodesDict = {},
            parent = undefined;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _getIterator(nodes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;

                nodesDict[node.name] = node;
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
            for (var _iterator2 = _getIterator(nodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var node = _step2.value;

                var currentNode = node;
                if (!activeSeries.has(currentNode.series)) continue;
                while (parent = currentNode.parent) {
                    var parentNode = nodesDict[parent];
                    if (activeSeries.has(parentNode.series)) {
                        node.parent = parent;
                        break;
                    }
                    currentNode = parentNode;
                }
                if (node.parent && !activeSeries.has(nodesDict[node.parent].series)) {
                    node.parent = null;
                }
                filteredNodes.push(node);
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

        return filteredNodes;
    }

    return {
        setters: [function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_2) {
            _getIterator = _2['default'];
        }, function (_) {
            _Object$keys = _['default'];
        }, function (_3) {}, function (_e) {
            _Set = _e['default'];
        }, function (_f) {
            _Array$from = _f['default'];
        }, function (_b) {}, function (_c) {
            d3legend = _c.d3legend;
            d3tooltip = _c.d3tooltip;
            mergeTemplateLayout = _c.mergeTemplateLayout;
            createNodeTypes = _c.createNodeTypes;
            labelCollisionDetection = _c.labelCollisionDetection;
            createTreeLayout = _c.createTreeLayout;
            spreadGenerations = _c.spreadGenerations;
            createDynamicNodeAttr = _c.createDynamicNodeAttr;
            scaleProperties = _c.scaleProperties;
            getNodeLabelBBox = _c.getNodeLabelBBox;
            drawColourBar = _c.drawColourBar;
            calcColourBarSize = _c.calcColourBarSize;
        }],
        execute: function () {
            'use strict';

            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };

            layoutTemplate = {
                title: "",
                size: 800,
                axis: {
                    title: "",
                    show: true,
                    gridOnly: false,
                    valueProperty: "default"
                },
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                labelCollisionDetection: {
                    enabled: false,
                    updateDelay: 500
                },
                link: {
                    stroke: "#ccc",
                    "stroke-width": 1
                },
                groupSelection: {
                    enabled: false,
                    selectionRectangle: {
                        "stroke-width": 1,
                        "stroke-dasharray": 4,
                        rx: 3,
                        ry: 3,
                        stroke: "steelblue"
                    }
                },
                maxZoom: 10,
                heatmap: {
                    enabled: false,
                    colourScale: [[0, '#008ae5'], [1, 'yellow']],
                    colourBar: {
                        show: true,
                        height: "90%",
                        width: 30,
                        position: "right"
                    },
                    circle: {
                        r: 16
                    },
                    opacity: 0.4
                },
                legend: {
                    show: false,
                    position: {
                        x: "right",
                        y: "center"
                    },
                    anchor: {
                        x: "outside",
                        y: "inside"
                    },
                    orientation: "vertical"
                }
            };
            labelPositions = [{
                x: 10,
                y: 0,
                "text-anchor": "start"
            }, {
                x: -10,
                y: 0,
                "text-anchor": "end"
            }];

            _export('default', angular.module('plotify.lineage', ['plotify.utils']).directive('lineagePlot', LineagePlotDirective));
        }
    };
});
$__System.register('6', ['1', '2', '10', '11', '14', 'e', 'f', 'b', 'c'], function (_export) {
    var angular, d3, _getIterator, _Object$keys, _Set, _Array$from, d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, roundOffFix, labelCollisionDetection, scaleProperties, getNodeLabelBBox, calcColourBarSize, drawColourBar, layoutTemplate, labelPositions;

    function LineageScatterPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-lineage-scatter-plot");

                var defaultTimeFormat = "%d %b %y",
                    defaultScalarFormat = "g";

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var //links,
                mouseStart = undefined,
                    colours = d3.scale.category10(),
                    isDrag = false,
                    selectionRect = null,
                    tooltip = new d3tooltip(d3.select(element[0])),
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    scale = 1,
                    translate = [0, 0],
                    selectedNodes = null,
                    LCD = null,
                    //label collision detection
                lastLCDUpdateTime = 0,
                    LCDUpdateID = undefined,
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    visibleSeries = new _Set();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var marginRatio = { axisX: 0.15, axisY: 0.1 };

                    // don't continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    selectedNodes = new _Set();

                    var seriesNames = _Array$from(new _Set(scope.value.data.map(function (d) {
                        return d.series;
                    })));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value);

                    var _createLinks = createLinks(copy.data, visibleSeries);

                    var nodesData = _createLinks.nodesData;
                    var links = _createLinks.links;
                    var layout = mergeTemplateLayout(copy.layout, layoutTemplate);
                    var pathname = $window.location.pathname;
                    var legendHeight = 0;var legendWidth = 0;var colourbarHeight = 0;var colourbarWidth = 0;
                    var colourBarOffset = layout.heatmap.colourBar.show ? 20 : 0;
                    var colourbar = d3.select();
                    var legend = d3.select();
                    var xAxisLabelSVG = d3.select();
                    var yAxisLabelSVG = d3.select();

                    var margin = { top: 50, right: 10, bottom: 20, left: 20 },
                        width = elementWidth - margin.left - margin.right,
                        height = 600 - margin.top - margin.bottom;

                    if (!layout.title) margin.top = 25;
                    if (layout.xAxis.title) margin.bottom += 25;
                    if (layout.yAxis.title) margin.left += 15;

                    var chart = svg.append("g");
                    var defs = chart.append("svg:defs");

                    if (layout.heatmap.enabled) {

                        var domain = d3.extent(nodesData, function (node) {
                            return node.z;
                        });

                        if (domain[0] == domain[1]) {
                            if (domain[0] === undefined) {
                                domain[0] = domain[1] = 0;
                            }
                            domain[0] -= 0.5;
                            domain[1] += 0.5;
                        }

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                            colourbar = chart.append("g").attr("class", "plotify-colourbar");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect(),
                                pos = layout.heatmap.colourBar.position;
                            colourbarWidth = bbox.width;
                            colourbarHeight = bbox.height;
                            if (pos === "right" || pos === "left") margin.right += colourbarWidth + colourBarOffset;else if (pos === "top" || pos === "bottom") margin.top += colourbarHeight;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "plotify-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    var initialLabelPosition = labelPositions[0];

                    var types = createNodeTypes(nodesData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    // check if x axis data is time data
                    //let isTimePlot = nodesData[0].x instanceof Date;
                    var isTimePlot = false;

                    // define x and y axes formats
                    var xAxisFormat = isTimePlot ? d3.time.format(layout.xAxis.format || defaultTimeFormat) : d3.format(layout.xAxis.format || defaultScalarFormat),
                        yAxisFormat = d3.format(layout.yAxis.format || defaultScalarFormat);

                    // find extent of input data and calculate margins
                    var xExtent = d3.extent(nodesData, function (node) {
                        return node.x;
                    }),
                        yExtent = d3.extent(nodesData, function (node) {
                        return node.y;
                    });

                    if (xExtent[0] === undefined || yExtent[0] === undefined) {
                        xExtent[0] = xExtent[1] = 0;
                        yExtent[0] = yExtent[1] = 0;
                    }

                    var xMargin = marginRatio.axisX * (xExtent[1] - xExtent[0]) / 2,
                        yMargin = marginRatio.axisY * (yExtent[1] - yExtent[0]) / 2;

                    // add margins to horizontal axis data
                    if (isTimePlot) {
                        xExtent[0] = new Date(xExtent[0].getTime() - xMargin);
                        xExtent[1] = new Date(xExtent[1].getTime() + xMargin);
                    } else {
                        if (xMargin == 0) xMargin = 0.5;
                        if (yMargin == 0) yMargin = 0.5;
                        xExtent[0] -= xMargin;xExtent[1] += xMargin;
                    }

                    // add margins to vertical axis data
                    yExtent[0] -= yMargin;yExtent[1] += yMargin;

                    height = 600 - margin.top - margin.bottom;

                    // define x scale
                    var xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear()).domain(xExtent).range([0, width]);

                    // define y scale
                    var yScale = d3.scale.linear().domain(yExtent).range([height, 0]);

                    var zoom = d3.behavior.zoom().scaleExtent([1, layout.maxZoom])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                    // define x axis
                    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height).tickFormat(roundOffFix(xAxisFormat));

                    // define y axis
                    var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(-width).tickFormat(roundOffFix(yAxisFormat));

                    // read x and y axes labels
                    var xAxisLabel = layout.xAxis.title;
                    var yAxisLabel = layout.yAxis.title;

                    // define node link function
                    var nodeLink = d3.svg.line().x(function (node) {
                        return xScale(node.x);
                    }).y(function (node) {
                        return yScale(node.y);
                    });

                    var mouseCaptureGroup = chart.append("g");

                    // render x axis
                    var xAxisSVG = chart.append("g").attr("class", "axis x-axis").attr("transform", 'translate(0, ' + height + ')').call(xAxis);

                    // rotate tick labels if time plot
                    if (isTimePlot) {
                        xAxisSVG.selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
                    }

                    // render x axis label if exists
                    var tickHeight = chart.selectAll("g.x-axis g.tick text")[0][0].getBBox().height;
                    if (xAxisLabel) {
                        xAxisLabel += layout.xAxis.units ? ', ' + layout.xAxis.units : "";
                        xAxisLabelSVG = chart.append("text") // text label for the x axis
                        .style("text-anchor", "middle").text(xAxisLabel);
                    }

                    // render y axis
                    var yAxisSVG = chart.append("g").attr("class", "axis y-axis").call(yAxis);

                    // render y axis label if exists
                    if (yAxisLabel) {
                        yAxisLabel += layout.yAxis.units ? ', ' + layout.yAxis.units : "";
                        yAxisLabelSVG = chart.append("text") // text label for the y axis
                        .attr("transform", "rotate(-90)").attr("y", 0).attr("x", -(height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(yAxisLabel);
                    }

                    var yAxisOffset = yAxisSVG.node().getBBox().x;
                    margin.left += Math.abs(yAxisOffset);
                    width = elementWidth - margin.right - margin.left;
                    yAxisLabelSVG.attr("y", yAxisOffset - 25);
                    xAxisLabelSVG.attr("transform", 'translate(' + width / 2 + ', ' + (height + tickHeight + 20) + ')');

                    // render chart title
                    if (layout.title) {
                        chart.append("text").attr("x", width / 2).attr("y", 0 - margin.top / 2).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            xOffset = yAxisOffset - (layout.yAxis.title ? 25 : 0),
                            yOffset = 15 + (layout.xAxis.title ? 25 : 0),
                            posX = pos.x === "left" ? xOffset : pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? 0 : pos.y === "bottom" ? height + (anchor.y === "outside" ? yOffset : 0) : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                    yScale.range([height, 0]);
                    xScale.range([0, width]);

                    var xScale0 = xScale.copy(),
                        yScale0 = yScale.copy();

                    xAxis.innerTickSize(-height);yAxis.innerTickSize(-width);
                    xAxisSVG.call(xAxis);
                    yAxisSVG.call(yAxis);

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    // render chart area
                    chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')').call(zoom).on("dblclick.zoom", onDoubleClick);

                    // define arrowhead

                    defs.append("marker").attr({
                        "id": "marker-arrowhead",
                        "viewBox": "0 -5 10 10",
                        "refX": 15,
                        "refY": 0,
                        "markerWidth": 8,
                        "markerHeight": 8,
                        "orient": "auto"
                    }).append("path").attr("d", "M0,-4L10,0L0,4").attr("fill", layout.link.stroke).attr("class", "arrowHead");

                    defs.append("svg:clipPath").attr("id", "lineage-scatter-clip-rect").append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                    // render links
                    var plotArea = chart.append("g").attr("id", "scatter-plot-area").attr("clip-path", 'url(' + pathname + '#lineage-scatter-clip-rect)').append("g");

                    if (layout.heatmap.enabled) {
                        heatmapCircle = plotArea.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodesData.filter(function (n) {
                            return !isNaN(parseFloat(n.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')';
                        });
                    }

                    plotArea.selectAll(".link").data(links).enter().append("svg:path").attr("stroke-dasharray", "3, 3").attr("d", function (conn) {
                        return nodeLink(conn);
                    }).attr(layout.link).attr("class", "link").attr("marker-end", 'url(' + pathname + '#marker-arrowhead)');

                    // create node groups
                    var node = plotArea.selectAll("g.node").data(nodesData).enter().append("g").attr("class", "node").attr("transform", function (node) {
                        return 'translate(' + xScale(node.x) + ', ' + yScale(node.y) + ')';
                    });

                    //render node circles
                    var circle = node.append("circle").attr(nodeAttr).style("stroke", function (d) {
                        return colours(d.series);
                    }).style("fill", function (d) {
                        return !selectedNodes.has(d.name) ? '#FFF' : colours(d.series);
                    }).each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.series) + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>') + ('<span class="tooltip-text">x: ' + d.x.toPrecision(3) + '</span>') + ('<span class="tooltip-text">y: ' + d.y.toPrecision(3) + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    // render node labels
                    var label = node.append("text").attr("dy", ".35em").attr(layout.nodeLabel).attr(initialLabelPosition).text(function (node) {
                        return node.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.width;
                    })),
                        searchRadius = 2 * maxNodeLabelLength + 13;

                    if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                        LCD = new labelCollisionDetection(nodesData, labelPositions, layout.nodeLabel, xScale, yScale, width, height, searchRadius);
                        LCD.initializeLabelPositions(label);
                    }

                    legend.each(function () {
                        this.parentNode.appendChild(this);
                    });

                    if (layout.groupSelection.enabled) {
                        mouseRect.on("mousedown", mouseDown).on("mousemove", mouseMove).on("mouseup", mouseUp).on("mouseout", mouseOut);

                        selectionRect = mouseCaptureGroup.append("rect").attr(layout.groupSelection.selectionRectangle).attr("class", "selection-rect");
                    }

                    function mouseDown() {
                        if (!d3.event.ctrlKey) return;
                        d3.event.preventDefault();
                        isDrag = true;
                        mouseStart = d3.mouse(this);
                        circle.style("pointer-events", "none");
                    }

                    function click(d) {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", function (d) {
                                return colours(d.series);
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseUp(pos) {
                        if (!isDrag || !mouseStart) return;

                        var p = arguments.length == 1 ? pos : d3.mouse(this);
                        if (!selectPoints(selectionRect) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) {
                            node.classed("selected", false).selectAll("circle").style("fill", "#FFF");
                        }
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseOut() {
                        if (!isDrag) return;
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseMove() {
                        if (!isDrag) return;
                        var p = d3.mouse(this);
                        if (!d3.event.ctrlKey) {
                            mouseUp(p);
                            return;
                        }
                        var d = {
                            x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                            y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                        selectionRect.attr(d);
                        selectPoints(selectionRect);
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
                                    return colours(d.series);
                                });
                                any = true;
                            } else if (!selectedNodes.has(d.name)) {
                                n.classed("selected", false);
                                n.select("circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var wasChange = false;

                        svg.selectAll("g.node.selected").each(function (d) {
                            if (!selectedNodes.has(d.name)) {
                                selectedNodes.add(d.name);
                                wasChange = true;
                            }
                        });

                        svg.selectAll("g.node:not(.selected)").each(function (d) {
                            if (selectedNodes.has(d.name)) {
                                selectedNodes['delete'](d.name);
                                wasChange = true;
                            }
                        });

                        if (wasChange && scope.selected) {
                            scope.selectedNodes = _Array$from(selectedNodes);
                            scope.$apply();
                        }
                    }

                    function zoomed() {
                        if (d3.event.sourceEvent.ctrlKey) {
                            zoom.translate(translate);
                            zoom.scale(scale);
                            return;
                        }

                        var t = zoom.translate(),
                            s = zoom.scale(),
                            now = performance.now();
                        if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                        scale = s;
                        translate = t;
                        translate[0] = translate[0].clamp((1 - scale) * width, 0);
                        translate[1] = translate[1].clamp((1 - scale) * height, 0);
                        zoom.translate(translate);
                        xScale.domain(xScale0.range().map(function (x) {
                            return (x - translate[0]) / scale;
                        }).map(xScale0.invert));
                        yScale.domain(yScale0.range().map(function (y) {
                            return (y - translate[1]) / scale;
                        }).map(yScale0.invert));
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = now;
                        }
                    }

                    function applyZoom() {
                        plotArea.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        svg.select(".x-axis.axis").call(xAxis);
                        svg.select(".y-axis.axis").call(yAxis);
                        svg.selectAll(".node circle").attr(scaleProperties(nodeAttr, scale, true)).each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });
                        svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                        if (layout.heatmap.enabled) {
                            heatmapCircle.attr(scaleProperties(layout.heatmap.circle, scale));
                        }
                        if (layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay" || layout.labelCollisionDetection.enabled === false) {
                            label.each(function (d) {
                                var self = d3.select(this);
                                self.attr(scaleProperties(layout.nodeLabel, scale)).attr(scaleProperties(d.labelPos, scale));
                            });
                        }
                        if (layout.groupSelection.enabled) {
                            selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                        }
                    }

                    function onDoubleClick() {
                        var now = performance.now();
                        scale = 1;
                        translate = [0, 0];
                        zoom.scale(1);
                        xScale.domain(xScale0.domain());
                        yScale.domain(yScale0.domain());
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.enabled.updateDelay);
                            lastLCDUpdateTime = now;
                        }
                    }
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ isNewData: false });
                });

                scope.$watch("value", function () {
                    render({ isNewData: true });
                });
            }
        };
    }

    function createLinks(nodes, activeSeries) {
        var filteredNodes = [],
            nodesDict = {},
            parent = undefined,
            links = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _getIterator(nodes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;

                nodesDict[node.name] = node;
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
            for (var _iterator2 = _getIterator(nodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var node = _step2.value;

                var currentNode = node;
                if (!activeSeries.has(currentNode.series)) continue;
                while (parent = currentNode.parent) {
                    var parentNode = nodesDict[parent];
                    if (activeSeries.has(parentNode.series)) {
                        node.parent = parent;
                        links.push([parentNode, node]);
                        break;
                    }
                    currentNode = parentNode;
                }
                if (node.parent && !activeSeries.has(nodesDict[node.parent].series)) {
                    node.parent = null;
                }
                filteredNodes.push(node);
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

        return { nodesData: filteredNodes, links: links };
    }

    return {
        setters: [function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_2) {
            _getIterator = _2['default'];
        }, function (_) {
            _Object$keys = _['default'];
        }, function (_3) {}, function (_e) {
            _Set = _e['default'];
        }, function (_f) {
            _Array$from = _f['default'];
        }, function (_b) {}, function (_c) {
            d3legend = _c.d3legend;
            d3tooltip = _c.d3tooltip;
            mergeTemplateLayout = _c.mergeTemplateLayout;
            createNodeTypes = _c.createNodeTypes;
            createDynamicNodeAttr = _c.createDynamicNodeAttr;
            roundOffFix = _c.roundOffFix;
            labelCollisionDetection = _c.labelCollisionDetection;
            scaleProperties = _c.scaleProperties;
            getNodeLabelBBox = _c.getNodeLabelBBox;
            calcColourBarSize = _c.calcColourBarSize;
            drawColourBar = _c.drawColourBar;
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: null,
                size: 800,
                xAxis: {
                    title: null,
                    units: null,
                    format: null
                },
                yAxis: {
                    title: null,
                    units: null,
                    format: null
                },
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                labelCollisionDetection: {
                    enabled: false,
                    updateDelay: 500
                },
                link: {
                    stroke: "#838383",
                    "stroke-width": 1,
                    "stroke-dasharray": 4
                },
                groupSelection: {
                    enabled: false,
                    selectionRectangle: {
                        "stroke-width": 1,
                        "stroke-dasharray": 4,
                        rx: 3,
                        ry: 3,
                        stroke: "steelblue"
                    }
                },
                maxZoom: 10,
                heatmap: {
                    enabled: false,
                    colourScale: [[0, '#008ae5'], [1, 'yellow']],
                    colourBar: {
                        show: true,
                        height: "90%",
                        width: 30,
                        position: "right"
                    },
                    circle: {
                        r: 16
                    },
                    opacity: 0.4
                },
                legend: {
                    show: false,
                    position: {
                        x: "right",
                        y: "center"
                    },
                    anchor: {
                        x: "outside",
                        y: "inside"
                    },
                    orientation: "vertical"
                }
            };
            labelPositions = [{
                x: 13,
                y: 0,
                "text-anchor": "start"
            }, {
                x: -13,
                y: 0,
                "text-anchor": "end"
            }];

            _export('default', angular.module('plotify.lineage-scatter', ['plotify.utils']).directive('lineageScatterPlot', LineageScatterPlotDirective));
        }
    };
});
$__System.register('7', ['1', '2', '10', '15', 'b', 'c'], function (_export) {
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
                    colours = null,
                    hoverBoxIndex = -1,
                    currentScrollOffset = 0,
                    pathname = $window.location.pathname;

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
                                hoverBoxIndex = i;
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
                                //let tooltipPos = tooltip.position();
                                //tooltipPos[0] += selectedBoxes[name] ? selectionMargin : -selectionMargin;
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

                    if (leftMargin !== margin.left) currentScrollOffset = 0;

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

                    var tooltipPos = -100;
                    // update translation
                    boxContainers.each(function (d, i) {
                        var isSelected = selectedBoxes[d.name],
                            selectedOffset = isSelected ? selectionMargin : 0;

                        d.x = leftMargin + d.i * (boxGroupWidth + boxGroupSpacing) + selectedOffset + (isSelected ? selectedCount++ : selectedCount) * 2 * selectionMargin;

                        if (i === hoverBoxIndex) tooltipPos = [d.x + boxGroupWidth / 2 + currentScrollOffset, this.getBoundingClientRect().top];
                    });

                    //tooltip.position(tooltipPos);console.log(tooltipPos);
                    tooltip.move(tooltipPos, transitionDuration);

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
                    var clip = svg.append("defs").append("svg:clipPath").attr("id", "clip-box-plot").append("svg:rect").attr("x", margin.left - 5).attr("y", "-20").attr("width", width + 10).attr("height", height * 2);

                    chart = svg.append("g");

                    chart.append("g").attr("class", "axis");

                    var clipBox = chart.append("g").attr("id", "scroll-clip-box").attr("clip-path", 'url(' + pathname + '#clip-box-plot)');

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
                    currentScrollOffset = d.x;

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
        setters: [function (_3) {
            angular = _3['default'];
        }, function (_4) {
            d3 = _4['default'];
        }, function (_) {
            _getIterator = _['default'];
        }, function (_2) {}, function (_b) {}, function (_c) {
            d3tooltip = _c.d3tooltip;
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
$__System.register('8', ['1', '2', '16', 'b', 'c'], function (_export) {
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
                    resolution = 12;

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

                            var area = d3.svg.area().interpolate("bundle").x0(function (d) {
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
        }, function (_) {}, function (_b) {}, function (_c) {
            d3tooltip = _c.d3tooltip;
        }],
        execute: function () {
            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };
            _export('default', angular.module('plotify.violin', ['plotify.utils']).directive('violinPlot', ViolinPlotDirective));
        }
    };
});
$__System.register('9', ['1', '2', '10', '17', '18', 'e', 'a', 'b', 'c'], function (_export) {
    var angular, d3, _getIterator, _slicedToArray, _Set, d3legend, d3tooltip;

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
                    visibleSeries = new _Set(),
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
                        return visibleSeries.has(d.name);
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

                            visibleSeries.add(_name);
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

                    //let drawLegend = d3legend()
                    //    .splitAfter(0)
                    //    .seriesNames(seriesNames)
                    //    .colourScale(colours)
                    //    .anchorHorizontal("right")
                    //    .anchorVertical("bottom")
                    //    .maxSize({width, height})
                    //    .onMouseOver(legendMouseOver)
                    //    .onMouseOut(legendMouseOut)
                    //    .onClick(legendClick)
                    //    .selectedItems(visibleSeries);
                    //
                    //
                    //let legend = chart.append("g")
                    //    .attr("class", "plotify-legend")
                    //    .attr("transform", `translate(${width},${0})`)
                    //    .call(drawLegend);

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
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
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
        setters: [function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_2) {
            _getIterator = _2['default'];
        }, function (_3) {}, function (_) {
            _slicedToArray = _['default'];
        }, function (_e) {
            _Set = _e['default'];
        }, function (_a) {}, function (_b) {}, function (_c) {
            d3legend = _c.d3legend;
            d3tooltip = _c.d3tooltip;
        }],
        execute: function () {
            'use strict';

            _export('default', angular.module('plotify.line', ['plotify.utils']).directive('linePlot', LinePlotDirective));
        }
    };
});
$__System.register('b', ['1'], function (_export) {
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
$__System.register("c", ["10", "11", "19", "1a", "e", "f"], function (_export) {
    var _getIterator, _Object$keys, _createClass, _classCallCheck, _Set, _Array$from, d3tooltip, labelCollisionDetection, colourBarID;

    function d3legend() {
        var splitAfter = 0,
            anchor = { x: "outside", y: "inside" },
            position = { x: "right", y: "center" },
            seriesNames = null,
            colourScale = null,
            onMouseOver = null,
            onMouseOut = null,
            onClick = null,
            selectedItems = new _Set(),
            verticalItemSpacing = 10,
            horizontalItemSpacing = 20,
            padding = 10,
            shapeSize = 10,
            maxSize = { width: -1, height: -1 };

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
                rowHeight = box.height;

            if (padding + splitAfter * (columnWidth + horizontalItemSpacing) > maxSize.width) splitAfter = Math.floor((maxSize.width - padding) / (columnWidth + horizontalItemSpacing));

            if (padding + Math.floor(seriesNames.length / splitAfter) * (rowHeight + verticalItemSpacing) > maxSize.height) splitAfter = Math.ceil(1.0 / ((maxSize.height - padding) / (rowHeight + verticalItemSpacing) / seriesNames.length));

            var rows = splitAfter > 0 ? Math.ceil(seriesNames.length / splitAfter) : 1,
                cols = splitAfter > 0 ? splitAfter : seriesNames.length,
                w = cols * columnWidth + (cols - 1) * horizontalItemSpacing + 2 * padding,
                h = rows * rowHeight + (rows - 1) * verticalItemSpacing + 2 * padding,
                shapeVerticalOffset = (rowHeight - shapeSize) / 2,
                textVerticalOffset = (rowHeight + box.height) / 2 - 2,
                legendHorizontalOffset = 0,
                legendVerticalOffset = 0;

            if (position.y === "top" && anchor.y === "inside" || position.y === "bottom" && anchor.y === "outside") legendVerticalOffset = 0;else if (position.y === "top" && anchor.y === "outside" || position.y === "bottom" && anchor.y === "inside") legendVerticalOffset = -h;else if (position.y === "center" && (position.x === "right" || position.x === "left")) legendVerticalOffset = -h / 2;

            if (position.x === "left" && anchor.x === "inside" || position.x === "right" && anchor.x === "outside") legendHorizontalOffset = 0;else if (position.x === "left" && anchor.x === "outside" || position.x === "right" && anchor.x === "inside") legendHorizontalOffset = -w;else if (position.x === "center" && (position.y === "top" || position.y === "bottom")) legendHorizontalOffset = -w / 2;

            g.append("rect").attr("x", legendHorizontalOffset).attr("y", legendVerticalOffset).attr("width", w).attr("height", h).attr("fill", "white").style("opacity", 0.75);

            var item = g.selectAll("g.legend-item").data(seriesNames);

            item.enter().append("g").attr("class", "legend-item");

            item.attr("transform", function (d, i) {
                return "translate(" + (legendHorizontalOffset + padding + i % splitAfter * (columnWidth + horizontalItemSpacing)) + ",\n                                            " + (legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)) + ")";
            });

            item.each(function (d, i) {
                var sel = d3.select(this);

                sel.append("rect").attr("class", "shape").attr("x", 2).attr("y", shapeVerticalOffset).attr("width", shapeSize).attr("height", shapeSize).attr("fill", selectedItems.has(d) ? colourScale(d) : "white").attr("stroke", colourScale(d));

                sel.append("text").attr("x", shapeSize + 5).attr("y", textVerticalOffset).attr("fill", "black").text(d);

                sel.append("rect").attr("class", "legend-item-mouse-capture").attr("x", 0).attr("y", 0).attr("width", columnWidth).attr("height", rowHeight).attr("fill", "white").attr("opacity", 0);
            });

            if (onMouseOver) item.on("mouseover", onMouseOver);
            if (onMouseOut) item.on("mouseout", onMouseOut);
            if (onClick) item.on("click", onClick);
        }

        legend.splitAfter = function (x) {
            if (!arguments.length) return splitAfter;
            splitAfter = x;
            return legend;
        };

        legend.position = function (x) {
            if (!arguments.length) return position;
            position = x;
            return legend;
        };

        legend.anchor = function (x) {
            if (!arguments.length) return anchor;
            if (x.x == "outside" && x.y == "outside") {
                console.warn('Anchor x and y should not be both set to "outside". Setting both to "inside"');
                anchor = { x: "inside", y: "inside" };
            } else anchor = x;
            return this;
        };

        legend.maxSize = function (x) {
            if (!arguments.length) return maxSize;
            if (x.width !== undefined && x.height !== undefined) maxSize = x;
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

    function mergeTemplateLayout(layout, templateLayout) {
        for (var p in templateLayout) {
            if (layout.hasOwnProperty(p)) {
                if (typeof templateLayout[p] == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                    layout[p] = mergeTemplateLayout(layout[p], templateLayout[p]);
                }
            } else {
                if (typeof templateLayout[p] == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                    layout[p] = mergeTemplateLayout({}, templateLayout[p]);
                } else {
                    layout[p] = templateLayout[p];
                }
            }
        }
        return layout;
    }

    function createNodeTypes(nodesArray, definedTypes, defaultType) {
        var typesFromLayout = _Object$keys(definedTypes),
            typeNames = _Array$from(new _Set(nodesArray.map(function (node) {
            return node.type;
        }))),
            types = {};
        typeNames.forEach(function (type) {
            types[type] = typesFromLayout.includes(type) ? mergeTemplateLayout(definedTypes[type], defaultType) : defaultType;
        });
        types[undefined] = defaultType;
        return types;
    }

    function createDynamicNodeAttr(types, attrNames) {
        var typeAttr = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function () {
                var attr = _step.value;

                typeAttr[attr] = function (d) {
                    return types[d.type][attr];
                };
            };

            for (var _iterator = _getIterator(attrNames), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return typeAttr;
    }

    function scaleProperties(props, scale) {
        var dynamic = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var scaledProps = {};

        var _loop2 = function (key) {
            if (!props.hasOwnProperty(key)) return "continue";
            var test = dynamic ? props[key]({ type: undefined }) : props[key];
            scaledProps[key] = !isNaN(test) && typeof test != 'string' ? dynamic ? function (d) {
                return props[key](d) / scale;
            } : props[key] / scale : props[key];
        };

        for (var key in props) {
            var _ret2 = _loop2(key);

            if (_ret2 === "continue") continue;
        }
        return scaledProps;
    }

    function createTreeLayout(nodesArray) {
        var nodes = copyNodesArray(nodesArray);
        return nodes.map(function (node) {
            node.children = nodes.filter(function (n) {
                return n.parent == node.name;
            });
            return node;
        }).filter(function (n) {
            return !n.parent;
        });
    }

    function copyNodesArray(nodesArray) {
        return nodesArray.map(function (node) {
            return JSON.parse(JSON.stringify(node));
        });
    }

    function spreadGenerations(tree) {
        var gen = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        tree.generation = gen;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = _getIterator(tree.children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var child = _step2.value;

                spreadGenerations(child, gen + 1);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                    _iterator2["return"]();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }

    function roundOffFix(format) {
        var zeroThreshold = arguments.length <= 1 || arguments[1] === undefined ? 1e-10 : arguments[1];

        return function (d) {
            var str = d.toString();
            if (d < zeroThreshold && d > -zeroThreshold) d = 0;
            return format(str.length > 10 ? d.toPrecision(4) : d);
        };
    }

    function getNodeLabelBBox(d) {
        d.bboxLabel = this.getBoundingClientRect();
        d.bboxLabel.top += d.bboxLabel.height * 0.2;
        d.bboxLabel.bottom -= d.bboxLabel.height * 0.2;

        d.bbox = this.parentNode.getBoundingClientRect();
        d.bbox.top = d.bboxLabel.top;
        d.bbox.bottom = d.bboxLabel.bottom;
    }

    function drawColourBar(selection, domain, heatmapOptions, defs, defsRoutePath) {

        var width = heatmapOptions.colourBar.width,
            height = heatmapOptions.colourBar.height,
            colourScale = heatmapOptions.colourScale,
            opacity = heatmapOptions.opacity;

        var gradient = defs.append("svg:linearGradient").attr("id", "gradient" + colourBarID).attr("x1", "0%").attr("y1", height > width ? "100%" : "0%").attr("x2", height > width ? "0%" : "100%").attr("y2", "0%").attr("spreadMethod", "pad");

        gradient.append("svg:stop").attr("offset", "0%").attr("stop-color", colourScale[0][1]).attr("stop-opacity", 1);

        gradient.append("svg:stop").attr("offset", "100%").attr("stop-color", colourScale[1][1]).attr("stop-opacity", 1);

        selection.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).style("fill", "url(" + defsRoutePath + "#gradient" + colourBarID++ + ")").attr("stroke-width", 2).attr("stroke", "grey").style("opacity", opacity);

        // Define x axis and grid
        var colourAxis = d3.svg.axis().scale(d3.scale.linear().domain(domain).range([height, 0])).orient("right");

        selection.append("g").attr("class", "axis").attr("transform", "translate(" + width + ", 0)").call(colourAxis);
    }

    function calcColourBarSize(size, relativeSize) {
        if (typeof size === 'string' || size instanceof String) {
            if (size === "auto") return relativeSize;else if (size[size.length - 1] === "%") return relativeSize * parseInt(size) / 100;else return relativeSize;
        } else return size;
    }

    function testLabelLength(svg, name, attrs) {
        var label = svg.append("text").attr(attrs).text(name);
        var length = label.node().getBoundingClientRect().width;
        label.remove();
        return length;
    }

    return {
        setters: [function (_3) {
            _getIterator = _3["default"];
        }, function (_2) {
            _Object$keys = _2["default"];
        }, function (_) {
            _createClass = _["default"];
        }, function (_a) {
            _classCallCheck = _a["default"];
        }, function (_e) {
            _Set = _e["default"];
        }, function (_f) {
            _Array$from = _f["default"];
        }],
        execute: function () {
            "use strict";

            _export("d3legend", d3legend);

            _export("mergeTemplateLayout", mergeTemplateLayout);

            _export("createNodeTypes", createNodeTypes);

            _export("createDynamicNodeAttr", createDynamicNodeAttr);

            _export("scaleProperties", scaleProperties);

            _export("createTreeLayout", createTreeLayout);

            _export("copyNodesArray", copyNodesArray);

            _export("spreadGenerations", spreadGenerations);

            _export("roundOffFix", roundOffFix);

            _export("getNodeLabelBBox", getNodeLabelBBox);

            _export("drawColourBar", drawColourBar);

            _export("calcColourBarSize", calcColourBarSize);

            _export("testLabelLength", testLabelLength);

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

            labelCollisionDetection = (function () {
                function labelCollisionDetection(nodes, labelPositions, labelLayout, xScale, yScale, width, height, searchRadius) {
                    var _this = this;

                    _classCallCheck(this, labelCollisionDetection);

                    this.xScale = xScale;
                    this.yScale = yScale;
                    this.width = width;
                    this.height = height;
                    this.nodes = nodes;
                    this.labelPositions = labelPositions;
                    this.labelLayout = labelLayout;
                    this.searchRadius = searchRadius;
                    this.quadtreeGenerator = d3.geom.quadtree().extent([[-1, -1], [this.width + 1, this.height + 1]]).x(function (d) {
                        return _this.xScale(d.x);
                    }).y(function (d) {
                        return _this.yScale(d.y);
                    });

                    this.quadtree = this.createQuadTree(this.nodes);
                }

                _createClass(labelCollisionDetection, [{
                    key: "createQuadTree",
                    value: function createQuadTree(nodes) {
                        return this.quadtreeGenerator(nodes);
                    }
                }, {
                    key: "quadtreeSearch",
                    value: function quadtreeSearch(point) {
                        var _this2 = this;

                        var foundNodes = [],
                            r = this.searchRadius,
                            px = this.xScale(point.x),
                            py = this.yScale(point.y),
                            x0 = px - r,
                            y0 = py - r,
                            x3 = px + r,
                            y3 = py + r;

                        this.quadtree.visit(function (node, x1, y1, x2, y2) {
                            var outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                            var p = node.point;
                            if (p && !outside) {
                                if (_this2.dist(px, py, _this2.xScale(p.x), _this2.yScale(p.y)) <= r && p != point) foundNodes.push(p);
                            }
                            return outside;
                        });

                        return foundNodes;
                    }
                }, {
                    key: "dist",
                    value: function dist(x1, y1, x2, y2) {
                        var dx = x2 - x1,
                            dy = y2 - y1;
                        return Math.pow(dx * dx + dy * dy, 0.5);
                    }
                }, {
                    key: "initializeLabelPositions",
                    value: function initializeLabelPositions(labels) {
                        var initialLabelPosition = this.labelPositions[0];
                        var self = this;
                        labels.each(function (d) {
                            var neighbours = self.quadtreeSearch(d),
                                sel = d3.select(this),
                                i = 1,
                                c = undefined;
                            d.labelPos = initialLabelPosition;
                            while ((c = self.isColliding(d, neighbours)) && i < self.labelPositions.length) {
                                d.labelPos = self.labelPositions[i++];
                                sel.attr(d.labelPos).each(getNodeLabelBBox);
                            }
                            if (c) {
                                sel.style("opacity", 1e-6);
                                d.bbox = d.bboxCircle || { left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0 };
                            }
                            d.isCollidingLabel = c;
                            d.neverCollidingLabel = i == 1;
                        });
                    }
                }, {
                    key: "recalculateLabelPositions",
                    value: function recalculateLabelPositions(labels, scale) {
                        var _this3 = this;

                        // create new quadtree
                        this.quadtree = this.quadtreeGenerator(this.nodes.filter(function (d) {
                            var x = _this3.xScale(d.x),
                                y = _this3.yScale(d.y);
                            return x >= 0 && x <= _this3.width && y >= 0 && y <= _this3.height;
                        }));
                        // resize label bounding boxes
                        labels.attr(scaleProperties(this.labelLayout, scale)).each(getNodeLabelBBox);

                        var self = this;
                        // prevent label overlapping
                        labels.each(function (d) {
                            var x = self.xScale(d.x),
                                y = self.yScale(d.y),
                                i = 0,
                                c = undefined,
                                sel = d3.select(this);

                            if (x < 0 || x > self.width || y < 0 || y > self.height) {
                                d.isCollidingLabel = !d.neverCollidingLabel;
                                sel.style("opacity", d.isCollidingLabel ? 1e-6 : 1);
                                return;
                            }

                            sel.attr(scaleProperties(d.labelPos, scale)).each(getNodeLabelBBox);

                            var neighbours = self.quadtreeSearch(d);
                            do {
                                d.labelPos = self.labelPositions[i++];
                                sel.attr(scaleProperties(d.labelPos, scale)).each(getNodeLabelBBox);
                            } while ((c = self.isColliding(d, neighbours)) && i < self.labelPositions.length);

                            if (c) {
                                d.bbox = d.bboxCircle || { left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0 };
                                d.bboxLabel = d.bbox;
                            }
                            sel.style("opacity", c ? 1e-6 : 1);
                            d.isCollidingLabel = c;
                        });
                    }
                }, {
                    key: "checkCollision",
                    value: function checkCollision(rect1, rect2) {
                        return rect1.left < rect2.right && rect1.right > rect2.left && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
                    }
                }, {
                    key: "isColliding",
                    value: function isColliding(object1, objects) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = _getIterator(objects), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var object2 = _step3.value;

                                if (this.checkCollision(object1.bboxLabel, object2.bbox)) return true;
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                    _iterator3["return"]();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        return false;
                    }
                }]);

                return labelCollisionDetection;
            })();

            _export("labelCollisionDetection", labelCollisionDetection);

            colourBarID = 0;
        }
    };
});
$__System.register('a', [], false, function() {});
$__System.register('d', [], false, function() {});
$__System.register('12', [], false, function() {});
$__System.register('13', [], false, function() {});
$__System.register('14', [], false, function() {});
$__System.register('15', [], false, function() {});
$__System.register('16', [], false, function() {});
$__System.register('17', [], false, function() {});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define(["angular","angular","d3","angular","d3","angular","d3","angular","d3","angular","d3","angular","d3","angular","d3","angular"], factory);
  else
    factory();
});
//# sourceMappingURL=plotify.js.map