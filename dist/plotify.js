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

(['0', '1', '2'], ["1","1","2","1","2","1","2","1","2","1","2","1","2","1"], function($__System) {

$__System.registerDynamic("d", ["19"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("19"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("e", ["1a"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("1a"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("10", ["1b"], true, function(require, exports, module) {
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

$__System.registerDynamic("f", ["1c"], true, function(require, exports, module) {
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

$__System.registerDynamic("16", ["e", "1d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _getIterator = require("e")["default"];
  var _isIterable = require("1d")["default"];
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

$__System.registerDynamic("18", [], true, function(require, exports, module) {
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

$__System.registerDynamic("17", ["1e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("1e")["default"];
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

$__System.registerDynamic("19", ["1f", "20", "21", "22", "23", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("1f");
  require("20");
  require("21");
  require("22");
  require("23");
  module.exports = require("24").Set;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1a", ["21", "20", "25"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("21");
  require("20");
  module.exports = require("25");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1b", ["20", "26", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("20");
  require("26");
  module.exports = require("24").Array.from;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1c", ["27", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("27");
  module.exports = require("24").Object.keys;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1d", ["28"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("28"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1f", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1e", ["29"], true, function(require, exports, module) {
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

$__System.registerDynamic("23", ["2a", "2b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $def = require("2a");
  $def($def.P, 'Set', {toJSON: require("2b")('Set')});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("24", [], true, function(require, exports, module) {
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

$__System.registerDynamic("20", ["2c", "2d"], true, function(require, exports, module) {
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

$__System.registerDynamic("22", ["2e", "2f"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var strong = require("2e");
  require("2f")('Set', function(get) {
    return function Set() {
      return get(this, arguments[0]);
    };
  }, {add: function add(value) {
      return strong.def(this, value = value === 0 ? 0 : value, value);
    }}, strong);
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("21", ["30", "31"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("30");
  var Iterators = require("31");
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("25", ["32", "33", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = require("32"),
      get = require("33");
  module.exports = require("24").getIterator = function(it) {
    var iterFn = get(it);
    if (typeof iterFn != 'function')
      throw TypeError(it + ' is not iterable!');
    return anObject(iterFn.call(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("26", ["34", "2a", "35", "36", "37", "38", "33", "39"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ctx = require("34"),
      $def = require("2a"),
      toObject = require("35"),
      call = require("36"),
      isArrayIter = require("37"),
      toLength = require("38"),
      getIterFn = require("33");
  $def($def.S + $def.F * !require("39")(function(iter) {
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

$__System.registerDynamic("27", ["35", "3a"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toObject = require("35");
  require("3a")('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("28", ["21", "20", "3b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("21");
  require("20");
  module.exports = require("3b");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("29", ["3c"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("3c");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2b", ["3d", "3e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var forOf = require("3d"),
      classof = require("3e");
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

$__System.registerDynamic("2a", ["3f", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("3f"),
      core = require("24"),
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

$__System.registerDynamic("2c", ["40", "41"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = require("40"),
      defined = require("41");
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

$__System.registerDynamic("2f", ["3c", "2a", "42", "3d", "43", "3f", "44", "45", "46", "47"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3c"),
      $def = require("2a"),
      hide = require("42"),
      forOf = require("3d"),
      strictNew = require("43");
  module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = require("3f")[NAME],
        C = Base,
        ADDER = IS_MAP ? 'set' : 'add',
        proto = C && C.prototype,
        O = {};
    if (!require("44") || typeof C != 'function' || !(IS_WEAK || proto.forEach && !require("45")(function() {
      new C().entries().next();
    }))) {
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      require("46")(C.prototype, methods);
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

$__System.registerDynamic("2d", ["48", "2a", "49", "42", "4a", "4b", "31", "4c", "3c", "47"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var LIBRARY = require("48"),
      $def = require("2a"),
      $redef = require("49"),
      hide = require("42"),
      has = require("4a"),
      SYMBOL_ITERATOR = require("4b")('iterator'),
      Iterators = require("31"),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
    require("4c")(Constructor, NAME, next);
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
      var IteratorPrototype = require("3c").getProto(_default.call(new Base));
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

$__System.registerDynamic("30", ["4d", "4e", "31", "4f", "2d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var setUnscope = require("4d"),
      step = require("4e"),
      Iterators = require("31"),
      toIObject = require("4f");
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

$__System.registerDynamic("31", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("32", ["50"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = require("50");
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("33", ["3e", "4b", "31", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = require("3e"),
      ITERATOR = require("4b")('iterator'),
      Iterators = require("31");
  module.exports = require("24").getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2e", ["3c", "42", "34", "51", "43", "41", "3d", "4e", "52", "4a", "50", "44", "46", "2d", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3c"),
      hide = require("42"),
      ctx = require("34"),
      species = require("51"),
      strictNew = require("43"),
      defined = require("41"),
      forOf = require("3d"),
      step = require("4e"),
      ID = require("52")('id'),
      $has = require("4a"),
      isObject = require("50"),
      isExtensible = Object.isExtensible || isObject,
      SUPPORT_DESC = require("44"),
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
      require("46")(C.prototype, {
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
      species(require("24")[NAME]);
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("36", ["32"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = require("32");
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

$__System.registerDynamic("37", ["31", "4b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var Iterators = require("31"),
      ITERATOR = require("4b")('iterator');
  module.exports = function(it) {
    return (Iterators.Array || Array.prototype[ITERATOR]) === it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("34", ["53"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var aFunction = require("53");
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

$__System.registerDynamic("39", ["4b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var SYMBOL_ITERATOR = require("4b")('iterator'),
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

$__System.registerDynamic("3a", ["2a", "24", "45"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(KEY, exec) {
    var $def = require("2a"),
        fn = (require("24").Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $def($def.S + $def.F * require("45")(function() {
      fn(1);
    }), 'Object', exp);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3b", ["3e", "4b", "31", "24"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = require("3e"),
      ITERATOR = require("4b")('iterator'),
      Iterators = require("31");
  module.exports = require("24").isIterable = function(it) {
    var O = Object(it);
    return ITERATOR in O || '@@iterator' in O || Iterators.hasOwnProperty(classof(O));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("38", ["40"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = require("40"),
      min = Math.min;
  module.exports = function(it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("35", ["41"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var defined = require("41");
  module.exports = function(it) {
    return Object(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3c", [], true, function(require, exports, module) {
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
  var UNDEFINED = 'undefined';
  var global = module.exports = typeof window != UNDEFINED && window.Math == Math ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3e", ["54", "4b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = require("54"),
      TAG = require("4b")('toStringTag'),
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

$__System.registerDynamic("3d", ["34", "36", "37", "32", "38", "33"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = require("34"),
      call = require("36"),
      isArrayIter = require("37"),
      anObject = require("32"),
      toLength = require("38"),
      getIterFn = require("33");
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

$__System.registerDynamic("42", ["3c", "55", "44"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("3c"),
      createDesc = require("55");
  module.exports = require("44") ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("41", [], true, function(require, exports, module) {
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

$__System.registerDynamic("44", ["45"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = !require("45")(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("45", [], true, function(require, exports, module) {
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

$__System.registerDynamic("46", ["49"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $redef = require("49");
  module.exports = function(target, src) {
    for (var key in src)
      $redef(target, key, src[key]);
    return target;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("40", [], true, function(require, exports, module) {
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

$__System.registerDynamic("43", [], true, function(require, exports, module) {
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

$__System.registerDynamic("47", ["4a", "42", "4b"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var has = require("4a"),
      hide = require("42"),
      TAG = require("4b")('toStringTag');
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
  module.exports = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("49", ["42"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = require("42");
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4b", ["56", "3f", "52"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var store = require("56")('wks'),
      Symbol = require("3f").Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || require("52"))('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4a", [], true, function(require, exports, module) {
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

$__System.registerDynamic("4d", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function() {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4c", ["3c", "42", "4b", "55", "47"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3c"),
      IteratorPrototype = {};
  require("42")(IteratorPrototype, require("4b")('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: require("55")(1, next)});
    require("47")(Constructor, NAME + ' Iterator');
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4f", ["57", "41"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var IObject = require("57"),
      defined = require("41");
  module.exports = function(it) {
    return IObject(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4e", [], true, function(require, exports, module) {
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

$__System.registerDynamic("51", ["3c", "4b", "44"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("3c"),
      SPECIES = require("4b")('species');
  module.exports = function(C) {
    if (require("44") && !(SPECIES in C))
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

$__System.registerDynamic("50", [], true, function(require, exports, module) {
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

$__System.registerDynamic("52", [], true, function(require, exports, module) {
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

$__System.registerDynamic("53", [], true, function(require, exports, module) {
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

$__System.registerDynamic("56", ["3f"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("3f"),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("54", [], true, function(require, exports, module) {
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

$__System.registerDynamic("57", ["54"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = require("54");
  module.exports = 0 in Object('z') ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("55", [], true, function(require, exports, module) {
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

$__System.register('0', ['1', '3', '4', '5', '6', '7', '8', '9'], function (_export) {
    'use strict';

    var angular;
    return {
        setters: [function (_) {
            angular = _['default'];
        }, function (_2) {}, function (_3) {}, function (_4) {}, function (_5) {}, function (_6) {}, function (_7) {}, function (_8) {}],
        execute: function () {
            _export('default', angular.module('plotify', ['plotify.lineage', 'plotify.radial-lineage', 'plotify.lineage-scatter', 'plotify.box', 'plotify.violin', 'plotify.line']));
        }
    };
});
$__System.register('4', ['1', '2', '10', 'd', 'e', 'f', 'c', 'a', 'b'], function (_export) {
    var angular, d3, _Array$from, _Set, _getIterator, _Object$keys, d3tooltip, mergeTemplateLayout, createNodeTypes, labelCollisionDetection, createTreeLayout, spreadGenerations, createDynamicNodeAttr, scaleProperties, getNodeLabelBBox, layoutTemplate, labelPositions;

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
                    colours = d3.scale.category10().range(),
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
                    LCD = null; // label collision detection

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();
                    selectedNodes = new _Set();

                    if (!scope.value || !scope.value.data.length) return;

                    var treeData = scope.value.data,
                        layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);
                    // do not continue rendering if there is no data

                    var initialLabelPosition = labelPositions[0];

                    var virtualRootNode = { name: "virtualRoot", children: [], parent: null };

                    var allTrees = createTreeLayout(treeData),
                        trees = [virtualRootNode];

                    virtualRootNode.children = allTrees.map(function (node) {
                        node.parent = "virtualRoot";
                        return node;
                    });

                    if (layout.axis.valueProperty === "default") {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _getIterator(trees), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var tree = _step.value;

                                spreadGenerations(tree);
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
                    }

                    var types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    // FIXME: time plotting not implemented / checked yet
                    var isTimePlot = false; //trees[0].generation instanceof Date;

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var margin = { top: 50, right: 30, bottom: 50, left: 30 },
                        width = elementWidth - margin.right - margin.left,
                        height = 600 - margin.top - margin.bottom;

                    var nodesInGenerations = [],
                        maxNodesInGeneration = [];

                    // calculate maximum number of nodes in any generation for each tree
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        var _loop = function () {
                            var tree = _step2.value;

                            var tempLayout = d3.layout.tree().size([height, width]),
                                nodes = tempLayout.nodes(tree),
                                counts = {};

                            _iteratorNormalCompletion3 = true;
                            _didIteratorError3 = false;
                            _iteratorError3 = undefined;

                            try {
                                for (_iterator3 = _getIterator(nodes); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var _node = _step3.value;

                                    if (counts[_node.generation]) {
                                        counts[_node.generation]++;
                                    } else {
                                        counts[_node.generation] = 1;
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

                            nodesInGenerations.push(counts);
                            maxNodesInGeneration.push(d3.max(_Object$keys(counts).map(function (k) {
                                return counts[k];
                            })));
                        };

                        for (var _iterator2 = _getIterator(trees), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _iteratorNormalCompletion3;

                            var _didIteratorError3;

                            var _iteratorError3;

                            var _iterator3, _step3;

                            _loop();
                        }

                        // calculate cumulative offset of consecutive trees
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
                    var diagonal = d3.svg.diagonal().target(function (d) {
                        return { x: d.target.y, y: d.target.x };
                    }).source(function (d) {
                        return { x: d.source.y, y: d.source.x };
                    }).projection(function (d) {
                        return [d.y, d.x];
                    });

                    var roots = trees;

                    var treesData = [],
                        generationExtents = [];

                    // create tree layouts
                    for (var i = 0; i < roots.length; i++) {
                        var treeLayout = d3.layout.tree().size([heights[i], width]),
                            nodes = treeLayout.nodes(roots[i]).reverse(),
                            links = treeLayout.links(nodes);

                        treesData.push({ nodes: nodes, links: links });
                        generationExtents = generationExtents.concat(d3.extent(nodes, function (node) {
                            return node.generation;
                        }));
                    }

                    // calculate generation extent
                    var generationExtent = d3.extent(generationExtents);
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

                    var zoom = d3.behavior.zoom().scaleExtent([1, 10])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                    if (!layout.title) margin.top = 25;
                    if (!layout.axis.title) margin.bottom = 25;

                    var clip = svg.append("defs").append("svg:clipPath").attr("id", "lineage-clip-rect").append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                    // render chart area
                    var chart = svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").datum(offsets).attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')').call(zoom).on("dblclick.zoom", onDoubleClick);

                    // Define x axis and grid
                    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height);

                    // Calculate depth positions.
                    treesData.forEach(function (tree) {
                        tree.nodes.forEach(function (node) {
                            node.y = node.x;
                            node.x = xScale(node.generation);
                        });
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
                        chart.selectAll("g.axis path.domain, g.axis g.tick text, text.axis-title").style("opacity", 1e-6);
                    }

                    var mouseCaptureGroup = chart.append("g");

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    // add plotting areas for each separate tree
                    var treesContainer = chart.append("g").attr("clip-path", "url(#lineage-clip-rect)").append("g").attr("id", "trees-containter");
                    //.call(zoom)

                    var treeArea = treesContainer.selectAll("g.tree-area").data(treesData).enter().append("g").attr("class", "tree-area").attr("transform", function (d, i) {
                        return 'translate(0, ' + offsets[i] + ')';
                    });

                    // Declare the nodes
                    var node = treeArea.selectAll("g.node").data(function (d) {
                        return d.nodes.filter(function (n) {
                            return n.name != "virtualRoot";
                        });
                    });

                    // Enter the nodes.
                    var nodeEnter = node.enter().append("g").attr("class", "node").classed("selected", function (d) {
                        return selectedNodes.has(d.name);
                    }).attr("transform", function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });

                    // Add node circles
                    var circle = nodeEnter.append("circle").attr(nodeAttr).style("fill", function (d) {
                        return !selectedNodes.has(d.name) ? '#FFF' : colours[d.treeId];
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
                    var label = nodeEnter.append("text").attr("class", "node-label").attr("dy", ".35em").attr(layout.nodeLabel).attr(initialLabelPosition).text(function (d) {
                        return d.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bbox.width;
                    })),
                        searchRadius = 2 * maxNodeLabelLength;

                    if (layout.labelCollisionDetection === true || layout.labelCollisionDetection === "onlyOnInit") {
                        var nodes = treesData[0].nodes.slice(0, -1);
                        LCD = new labelCollisionDetection(nodes, labelPositions, layout.nodeLabel, function (x) {
                            return x;
                        }, function (y) {
                            return y;
                        }, width, height, searchRadius);
                        LCD.initializeLabelPositions(label);
                    }

                    // Declare the links
                    var link = treeArea.selectAll("path.link").data(function (d) {
                        return d.links.filter(function (l) {
                            return l.source.name != "virtualRoot";
                        });
                    });

                    // Enter the links.
                    link.enter().insert("path", "g").attr("class", "link").attr("d", diagonal).attr(layout.link);

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
                            n.select("circle").style("fill", function (d) {
                                return colours[d.treeId];
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
                                ty = t.translate[1] + offsets[j];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle").style("fill", function (d) {
                                    return colours[d.treeId];
                                });
                                any = true;
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
                            s = zoom.scale();
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
                        if (layout.labelCollisionDetection === true) {
                            LCD.recalculateLabelPositions(label, scale);
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
                            chart.selectAll("g.tick text").style("opacity", 1e-6);
                        }
                        svg.selectAll(".node circle").attr(scaleProperties(nodeAttr, scale, true));
                        svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                        if (layout.labelCollisionDetection === "onlyOnInit" || layout.labelCollisionDetection === false) {
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
                        scale = 1;
                        translate = [0, 0];
                        zoom.scale(1);
                        xScale.domain(xScale0.domain());
                        applyZoom();
                        if (layout.labelCollisionDetection === true) {
                            LCD.recalculateLabelPositions(label, scale);
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

    return {
        setters: [function (_2) {
            angular = _2['default'];
        }, function (_3) {
            d3 = _3['default'];
        }, function (_) {
            _Array$from = _['default'];
        }, function (_d) {
            _Set = _d['default'];
        }, function (_e) {
            _getIterator = _e['default'];
        }, function (_f) {
            _Object$keys = _f['default'];
        }, function (_c) {}, function (_a) {}, function (_b) {
            d3tooltip = _b.d3tooltip;
            mergeTemplateLayout = _b.mergeTemplateLayout;
            createNodeTypes = _b.createNodeTypes;
            labelCollisionDetection = _b.labelCollisionDetection;
            createTreeLayout = _b.createTreeLayout;
            spreadGenerations = _b.spreadGenerations;
            createDynamicNodeAttr = _b.createDynamicNodeAttr;
            scaleProperties = _b.scaleProperties;
            getNodeLabelBBox = _b.getNodeLabelBBox;
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
                labelCollisionDetection: false,
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
$__System.register('5', ['1', '2', '10', '11', 'd', 'f', 'e', 'a', 'b'], function (_export) {
    var angular, d3, _Array$from, _Set, _Object$keys, _getIterator, d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, roundOffFix, labelCollisionDetection, scaleProperties, getNodeLabelBBox, layoutTemplate, labelPositions;

    function LineageScatterPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                externalSelection: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-lineage-scatter-plot");

                var defaultTimeFormat = "%d %b %y",
                    defaultScalarFormat = "g";

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var links = undefined,
                    mouseStart = undefined,
                    colours = d3.scale.category10().range(),
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
                    LCD = null; //label collision detection

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();
                    selectedNodes = new _Set();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var margin = { top: 40, right: 30, bottom: 50, left: 70 },
                        marginRatio = { axisX: 0.15, axisY: 0.1 },
                        width = elementWidth - margin.left - margin.right,
                        height = 600 - margin.top - margin.bottom;

                    // don't continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    var nodesData = scope.value.data,
                        layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);

                    var initialLabelPosition = labelPositions[0];

                    if (scope.externalSelection) {
                        if (scope.externalSelection.length) nodesData = nodesData.filter(function (node) {
                            return scope.externalSelection.indexOf(node.name) !== -1;
                        });

                        selectedNodes.forEach(function (name) {
                            if (scope.externalSelection.indexOf(name) !== -1) selectedNodes['delete'](name);
                        });
                    }

                    createLinks();

                    var types = createNodeTypes(nodesData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    // check if x axis data is time data
                    var isTimePlot = nodesData[0].x instanceof Date;

                    // define x and y axes formats
                    var xAxisFormat = isTimePlot ? d3.time.format(layout.xAxis.format || defaultTimeFormat) : d3.format(layout.xAxis.format || defaultScalarFormat),
                        yAxisFormat = d3.format(layout.yAxis.format || defaultScalarFormat);

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

                    var xScale0 = xScale.copy(),
                        yScale0 = yScale.copy();

                    var zoom = d3.behavior.zoom().scaleExtent([1, 10])
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

                    if (!layout.title) margin.top = 20;
                    if (!layout.xAxis.title) margin.bottom = 25;
                    if (!layout.yAxis.title) margin.left = 50;

                    // render chart area
                    var chart = svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')').call(zoom).on("dblclick.zoom", onDoubleClick);

                    var mouseCaptureGroup = chart.append("g");

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    // render x axis
                    var xAxisSVG = chart.append("g").attr("class", "axis x-axis").attr("transform", 'translate(0, ' + height + ')').call(xAxis);

                    // rotate tick labels if time plot
                    if (isTimePlot) {
                        xAxisSVG.selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
                    }

                    // render x axis label if exists
                    if (xAxisLabel) {
                        var tickHeight = chart.selectAll("g.x-axis g.tick text")[0][0].getBBox().height;
                        xAxisLabel += layout.xAxis.units ? ', ' + layout.xAxis.units : "";
                        chart.append("text") // text label for the x axis
                        .style("text-anchor", "middle").text(xAxisLabel).attr("transform", 'translate(' + width / 2 + ', ' + (height + tickHeight + 20) + ')');
                    }

                    // render y axis
                    chart.append("g").attr("class", "axis y-axis").call(yAxis);

                    // render y axis label if exists
                    if (yAxisLabel) {
                        yAxisLabel += layout.yAxis.units ? ', ' + layout.yAxis.units : "";
                        chart.append("text") // text label for the y axis
                        .attr("transform", "rotate(-90)").attr("y", -margin.left + 10).attr("x", -(height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(yAxisLabel);
                    }

                    // render chart title
                    if (layout.title) {
                        chart.append("text").attr("x", width / 2).attr("y", 0 - margin.top / 2).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    // define arrowhead
                    var defs = chart.append("svg:defs");

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
                    var plotArea = chart.append("g").attr("id", "scatter-plot-area").attr("clip-path", "url(#lineage-scatter-clip-rect)").append("g");

                    plotArea.selectAll(".link").data(links).enter().append("svg:path").attr("stroke-dasharray", "3, 3").attr("d", function (conn) {
                        return nodeLink(conn);
                    }).attr(layout.link).attr("class", "link").attr("marker-end", "url(#marker-arrowhead)");

                    // create node groups
                    var node = plotArea.selectAll("g.node").data(nodesData).enter().append("g").attr("class", "node").attr("transform", function (node) {
                        return 'translate(' + xScale(node.x) + ', ' + yScale(node.y) + ')';
                    });

                    //render node circles
                    var circle = node.append("circle").attr(nodeAttr).style("stroke", function (d) {
                        return colours[d.treeId];
                    }).style("fill", function (d) {
                        return !selectedNodes.has(d.name) ? '#FFF' : colours[d.treeId];
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d, i) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours[d.treeId] + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>') + ('<span class="tooltip-text">x: ' + d.x.toPrecision(3) + '</span>') + ('<span class="tooltip-text">y: ' + d.y.toPrecision(3) + '</span>');
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
                        return d.bbox.width;
                    })),
                        searchRadius = 2 * maxNodeLabelLength;

                    if (layout.labelCollisionDetection === true || layout.labelCollisionDetection === "onlyOnInit") {
                        LCD = new labelCollisionDetection(nodesData, labelPositions, layout.nodeLabel, xScale, yScale, width, height, searchRadius);
                        LCD.initializeLabelPositions(label);
                    }

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
                                return colours[d.treeId];
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
                                    return colours[d.treeId];
                                });
                                any = true;
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
                            s = zoom.scale();
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
                        if (layout.labelCollisionDetection === true) {
                            LCD.recalculateLabelPositions(label, scale);
                        }
                    }

                    function applyZoom() {
                        plotArea.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        svg.select(".x-axis.axis").call(xAxis);
                        svg.select(".y-axis.axis").call(yAxis);
                        svg.selectAll(".node circle").attr(scaleProperties(nodeAttr, scale, true));
                        svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                        if (layout.labelCollisionDetection === "onlyOnInit" || layout.labelCollisionDetection === false) {
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
                        scale = 1;
                        translate = [0, 0];
                        zoom.scale(1);
                        xScale.domain(xScale0.domain());
                        yScale.domain(yScale0.domain());
                        applyZoom();
                        if (layout.labelCollisionDetection === true) {
                            LCD.recalculateLabelPositions(label, scale);
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
                        for (var _iterator = _getIterator(scope.value.data), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
                        for (var _iterator2 = _getIterator(scope.value.data), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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

                    var nodes = scope.externalSelection && scope.externalSelection.length ? scope.externalSelection : scope.value.data.map(function (node) {
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
                                if (!scope.externalSelection || (scope.externalSelection.indexOf(_parent) !== -1 || !scope.externalSelection.length)) {
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

                scope.$watch("externalSelection", function (ext) {
                    translate = [0, 0];
                    scale = 1;
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
        }, function (_) {
            _Array$from = _['default'];
        }, function (_2) {}, function (_d) {
            _Set = _d['default'];
        }, function (_f) {
            _Object$keys = _f['default'];
        }, function (_e) {
            _getIterator = _e['default'];
        }, function (_a) {}, function (_b) {
            d3tooltip = _b.d3tooltip;
            mergeTemplateLayout = _b.mergeTemplateLayout;
            createNodeTypes = _b.createNodeTypes;
            createDynamicNodeAttr = _b.createDynamicNodeAttr;
            roundOffFix = _b.roundOffFix;
            labelCollisionDetection = _b.labelCollisionDetection;
            scaleProperties = _b.scaleProperties;
            getNodeLabelBBox = _b.getNodeLabelBBox;
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
                labelCollisionDetection: false,
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
$__System.register('6', ['1', '2', '12', 'e', 'a', 'b'], function (_export) {
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
                    currentScrollOffset = 0;

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
        setters: [function (_2) {
            angular = _2['default'];
        }, function (_3) {
            d3 = _3['default'];
        }, function (_) {}, function (_e) {
            _getIterator = _e['default'];
        }, function (_a) {}, function (_b) {
            d3tooltip = _b.d3tooltip;
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
$__System.register('3', ['1', '2', '13', 'e', 'f', 'a', 'b'], function (_export) {
    var angular, d3, _getIterator, _Object$keys, d3tooltip, createTreeLayout, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, layoutTemplate;

    function RadialLineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("plotify plotify-radial-lineage-plot");

                var svg = d3.select(element[0]).append("svg");

                var colours = d3.scale.category10().range(),
                    tooltip = new d3tooltip(d3.select(element[0])),
                    hovering = false,
                    virtualRoot = null,
                    margin = undefined,
                    r = undefined,
                    labelOffset = 15,
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                };

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    // do not continue rendering if there is no data
                    if (!scope.value) return;

                    var treeData = scope.value,
                        layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);

                    treeData.trees = createTreeLayout(treeData.data);

                    r = layout.size / 2;
                    margin = layout.margin;

                    var isMultipleTree = treeData.trees.length > 1,
                        multipleTreeOffset = isMultipleTree ? 30 : 0,
                        totalTreeLength = r - margin - multipleTreeOffset,
                        start = null,
                        rotate = 0,
                        rotateOld = 0,
                        rotationDifference = undefined,
                        div = element[0],
                        transitionScale = d3.scale.log().domain([1, 181]).range([0, 1500]),
                        colours = d3.scale.category10(),
                        reorgDuration = 1000,
                        prevX = 0;

                    if (isMultipleTree) {
                        virtualRoot = {
                            name: "virtual_root",
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
                            for (var _iterator = _getIterator(treeData.trees), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var tree = _step.value;

                                spreadNodes(tree);
                                tree.parent = "virtual_root";
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

                        treeData.trees = virtualRoot;
                    } else {
                        treeData.trees = treeData.trees[0];
                        spreadNodes(treeData.trees);
                    }

                    var types = createNodeTypes(treeData.data, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var cluster = d3.layout.cluster().size([360, 1]).sort(null).children(function (d) {
                        return d.children;
                    }).separation(function () {
                        return 1;
                    });

                    var wrap = svg.attr("width", r * 2).attr("height", r * 2).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    wrap.append("rect").attr("width", r * 2).attr("height", r * 2).attr("fill", "none");

                    var vis = wrap.append("g").attr("transform", 'translate(' + r + ',' + r + ')');

                    var nodes = cluster.nodes(treeData.trees);
                    var links = cluster.links(nodes);
                    nodes.forEach(function (d) {
                        d.x0 = d.x; // remember initial position
                        if (d.name === "virtual_root") d.y = 0;else d.y = multipleTreeOffset + d._depth * totalTreeLength;
                    });

                    // TODO: implement equidistant generations
                    //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                    //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

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
                        return colours(d.treeId);
                    }).attr(nodeAttr);

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

                        d3.selectAll("g.node-active").classed("node-aligned", true).each(function (d) {
                            d._x = d.x;
                            d.x = selectedNode.x;
                        }).transition().duration(duration).attrTween("transform", tweenNodeGroup);

                        d3.selectAll("path.link-affected, path.link-displaced").classed("link-displaced", true).transition().duration(duration).attrTween("d", tweenPath);

                        d3.selectAll("path.link-displaced:not(.link-affected)").classed("link-displaced", false);

                        d3.selectAll("g.node-aligned text.mouseover-label").transition().style("opacity", 1);

                        d3.selectAll("g.node-aligned rect").style("opacity", 0.9);

                        if (rotationDifference > 0) {
                            vis.transition().delay(duration).duration(transitionScale(rotationDifference + 1)).attr("transform", 'translate(' + r + ',' + r + ')rotate(' + rotate + ')').each("end", function () {
                                d3.select(this).selectAll("text.outer-label").attr("text-anchor", function (d) {
                                    return (d.x + rotate) % 360 < 180 ? "start" : "end";
                                }).attr("transform", function (d) {
                                    return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                                });
                            });
                        }

                        rotateOld = rotate;
                    }

                    wrap.on("mousedown", function () {
                        if (!hovering) {
                            wrap.style("cursor", "move");
                            start = mouse(d3.event);
                            d3.event.preventDefault();
                        }
                    });
                    d3.select(window).on("mouseup", function () {
                        if (start && !hovering) {
                            wrap.style("cursor", "auto");
                            var m = mouse(d3.event);
                            var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            rotate += delta;
                            if (rotate > 360) rotate %= 360;else if (rotate < 0) rotate = (360 + rotate) % 360;
                            start = null;
                            wrap.style("-webkit-transform", null);
                            vis.attr("transform", 'translate(' + r + ',' + r + ')rotate(' + rotate + ')').selectAll("text.outer-label").attr("text-anchor", function (d) {
                                return (d.x + rotate) % 360 < 180 ? "start" : "end";
                            }).attr("transform", function (d) {
                                return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                            });
                        }
                    }).on("mousemove", function () {
                        if (start) {
                            var m = mouse(d3.event);
                            var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            wrap.style("-webkit-transform", 'rotateZ(' + delta + 'deg)');
                        }
                    });

                    function mouse(e) {
                        return [e.pageX - div.offsetLeft - r, e.pageY - div.offsetTop - r];
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
                //scope.$on('window-resize', (event) => {
                //    render(scope.value);
                //});

                scope.$watch("value", function () {
                    render(scope.value);
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

    return {
        setters: [function (_2) {
            angular = _2['default'];
        }, function (_3) {
            d3 = _3['default'];
        }, function (_) {}, function (_e) {
            _getIterator = _e['default'];
        }, function (_f) {
            _Object$keys = _f['default'];
        }, function (_a) {}, function (_b) {
            d3tooltip = _b.d3tooltip;
            createTreeLayout = _b.createTreeLayout;
            mergeTemplateLayout = _b.mergeTemplateLayout;
            createNodeTypes = _b.createNodeTypes;
            createDynamicNodeAttr = _b.createDynamicNodeAttr;
        }],
        execute: function () {
            'use strict';

            ;layoutTemplate = {
                title: "",
                size: 800,
                margin: 150,
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
                }
            };

            _export('default', angular.module('plotify.radial-lineage', ['plotify.utils']).directive('radialLineagePlot', RadialLineagePlotDirective));
        }
    };
});
$__System.register('7', ['1', '2', '14', 'a', 'b'], function (_export) {
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
        }, function (_) {}, function (_a) {}, function (_b) {
            d3tooltip = _b.d3tooltip;
        }],
        execute: function () {
            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };
            _export('default', angular.module('plotify.violin', ['plotify.utils']).directive('violinPlot', ViolinPlotDirective));
        }
    };
});
$__System.register('8', ['1', '2', '9', '15', '16', 'e', 'a', 'b'], function (_export) {
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
        setters: [function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_3) {}, function (_2) {}, function (_) {
            _slicedToArray = _['default'];
        }, function (_e) {
            _getIterator = _e['default'];
        }, function (_a) {}, function (_b) {
            d3legend = _b.d3legend;
            d3tooltip = _b.d3tooltip;
        }],
        execute: function () {
            'use strict';

            _export('default', angular.module('plotify.line', ['plotify.utils']).directive('linePlot', LinePlotDirective));
        }
    };
});
$__System.register('a', ['1'], function (_export) {
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
$__System.register("b", ["10", "17", "18", "f", "d", "e"], function (_export) {
    var _Array$from, _createClass, _classCallCheck, _Object$keys, _Set, _getIterator, d3tooltip, labelCollisionDetection;

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
                    legendHorizontalOffset = 0;
                    break;
                case "center":
                    legendHorizontalOffset = -w / 2;
                    break;
                case "right":
                    legendHorizontalOffset = -w;
                    break;
            }

            switch (anchorVertical) {
                case "top":
                    legendVerticalOffset = 0;
                    break;
                case "center":
                    legendVerticalOffset = -h / 2;
                    break;
                case "bottom":
                    legendVerticalOffset = -h;
                    break;
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

    function mergeTemplateLayout(layout, templateLayout) {
        for (var p in templateLayout) {
            if (layout.hasOwnProperty(p)) {
                if (typeof templateLayout[p] == 'object' && templateLayout[p] != null) {
                    layout[p] = mergeTemplateLayout(layout[p], templateLayout[p]);
                }
            } else {
                if (typeof templateLayout[p] == 'object' && templateLayout[p] != null) {
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
        return function (d) {
            var str = d.toString(),
                last = str.slice(-9, -1);
            return str.length > 10 && (last == "00000000" || last == "99999999") ? format(Number(str.slice(0, -1))) : format(d);
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

    return {
        setters: [function (_3) {
            _Array$from = _3["default"];
        }, function (_) {
            _createClass = _["default"];
        }, function (_2) {
            _classCallCheck = _2["default"];
        }, function (_f) {
            _Object$keys = _f["default"];
        }, function (_d) {
            _Set = _d["default"];
        }, function (_e) {
            _getIterator = _e["default"];
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
                                d.bbox = { left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0 };
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
                                d.bbox = { left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0 };
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
        }
    };
});
$__System.register('9', [], false, function() {});
$__System.register('c', [], false, function() {});
$__System.register('11', [], false, function() {});
$__System.register('12', [], false, function() {});
$__System.register('13', [], false, function() {});
$__System.register('14', [], false, function() {});
$__System.register('15', [], false, function() {});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define(["angular","angular","d3","angular","d3","angular","d3","angular","d3","angular","d3","angular","d3","angular"], factory);
  else
    factory();
});
//# sourceMappingURL=plotify.js.map