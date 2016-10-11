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

      if (typeof name == 'object') {
        for (var p in name)
          exports[p] = name[p];
      }
      else {
        exports[name] = value;
      }

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
    }, entry.name);

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
      if ((typeof exports == 'object' || typeof exports == 'function') && exports !== global) {
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

    // node core modules
    if (name.substr(0, 6) == '@node/')
      return require(name.substr(6));

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

(["1"], ["68","69","6a"], function($__System) {

(function(__global) {
  var loader = $__System;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  function readMemberExpression(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  // bare minimum ignores for IE8
  var ignoredGlobalProps = ['_g', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'frameElement', 'external', 'mozAnimationStartTime', 'webkitStorageInfo', 'webkitIndexedDB'];

  var globalSnapshot;

  function forEachGlobal(callback) {
    if (Object.keys)
      Object.keys(__global).forEach(callback);
    else
      for (var g in __global) {
        if (!hasOwnProperty.call(__global, g))
          continue;
        callback(g);
      }
  }

  function forEachGlobalValue(callback) {
    forEachGlobal(function(globalName) {
      if (indexOf.call(ignoredGlobalProps, globalName) != -1)
        return;
      try {
        var value = __global[globalName];
      }
      catch (e) {
        ignoredGlobalProps.push(globalName);
      }
      callback(globalName, value);
    });
  }

  loader.set('@@global-helpers', loader.newModule({
    prepareGlobal: function(moduleName, exportName, globals) {
      // disable module detection
      var curDefine = __global.define;
       
      __global.define = undefined;
      __global.exports = undefined;
      if (__global.module && __global.module.exports)
        __global.module = undefined;

      // set globals
      var oldGlobals;
      if (globals) {
        oldGlobals = {};
        for (var g in globals) {
          oldGlobals[g] = __global[g];
          __global[g] = globals[g];
        }
      }

      // store a complete copy of the global object in order to detect changes
      if (!exportName) {
        globalSnapshot = {};

        forEachGlobalValue(function(name, value) {
          globalSnapshot[name] = value;
        });
      }

      // return function to retrieve global
      return function() {
        var globalValue;

        if (exportName) {
          globalValue = readMemberExpression(exportName, __global);
        }
        else {
          var singleGlobal;
          var multipleExports;
          var exports = {};

          forEachGlobalValue(function(name, value) {
            if (globalSnapshot[name] === value)
              return;
            if (typeof value == 'undefined')
              return;
            exports[name] = value;

            if (typeof singleGlobal != 'undefined') {
              if (!multipleExports && singleGlobal !== value)
                multipleExports = true;
            }
            else {
              singleGlobal = value;
            }
          });
          globalValue = multipleExports ? exports : singleGlobal;
        }

        // revert globals
        if (oldGlobals) {
          for (var g in oldGlobals)
            __global[g] = oldGlobals[g];
        }
        __global.define = curDefine;

        return globalValue;
      };
    }
  }));

})(typeof self != 'undefined' ? self : global);

(function() {
  var loader = $__System;
  
  if (typeof window != 'undefined' && typeof document != 'undefined' && window.location)
    var windowOrigin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  loader.set('@@cjs-helpers', loader.newModule({
    getPathVars: function(moduleId) {
      // remove any plugin syntax
      var pluginIndex = moduleId.lastIndexOf('!');
      var filename;
      if (pluginIndex != -1)
        filename = moduleId.substr(0, pluginIndex);
      else
        filename = moduleId;

      var dirname = filename.split('/');
      dirname.pop();
      dirname = dirname.join('/');

      if (filename.substr(0, 8) == 'file:///') {
        filename = filename.substr(7);
        dirname = dirname.substr(7);

        // on windows remove leading '/'
        if (isWindows) {
          filename = filename.substr(1);
          dirname = dirname.substr(1);
        }
      }
      else if (windowOrigin && filename.substr(0, windowOrigin.length) === windowOrigin) {
        filename = filename.substr(windowOrigin.length);
        dirname = dirname.substr(windowOrigin.length);
      }

      return {
        filename: filename,
        dirname: dirname
      };
    }
  }));
})();

$__System.registerDynamic("2", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.register('3', ['2', '4', '5', '6', '7', '8', '9', 'a', 'b'], function (_export) {
    var angular, d3, d3tooltip, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar, createNodeTypes, createDynamicNodeAttr, testLabelLength, multiAttr, createPlotControls, _Set, _Array$from, _getIterator, _Object$keys, layoutTemplate;

    function RadialLineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-radial-lineage-plot");

                var svg = d3.select(element[0]).style("position", "relative").append("svg").style("width", "100%");

                var colours = d3.scaleOrdinal(d3.schemeCategory10),
                    hovering = false,
                    virtualRoot = null,
                    virtualRootName = "virtual_root",
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

                    var isMultipleTree = treeData.length > 1,
                        multipleTreeOffset = isMultipleTree ? 30 : 0,
                        maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                        colourBarOffset = 20,
                        start = null,
                        rotate = 0,
                        rotateOld = 0,
                        rotationDifference = undefined,
                        transitionScale = d3.scaleLog().domain([1, 181]).range([0, 1500]),
                        reorgDuration = 1000,
                        prevX = 0,
                        heatmapColourScale = null,
                        heatmapCircle = d3.select(),
                        legendHeight = 0,
                        legendWidth = 0,
                        colourbarHeight = 0,
                        colourbarWidth = 0,
                        legendOut = { top: false, right: false, bottom: false, left: false },
                        showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                        colourBarOrigWidth = layout.heatmap.colourBar.width,
                        colourBarOrigHeight = layout.heatmap.colourBar.height,
                        legend = d3.select(),
                        colourbar = d3.select(),
                        titleSVG = d3.select();

                    var width = layout.width || elementWidth,
                        height = layout.height;

                    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", "white");

                    if (layout.legend.show) {
                        if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                        if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                    }

                    var margin = layout.margin;
                    if (layout.title) margin.top += legendOut.top ? 26 : 25;

                    var chart = svg.append("g").attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

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

                        heatmapColourScale = d3.scaleLinear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect();

                            colourbarWidth = bbox.width;
                            margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                            colourbarHeight = bbox.height;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? legendHeight - 11 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    width = (layout.width || elementWidth) - margin.right - margin.left;
                    height = layout.height - margin.top - margin.bottom;

                    var r = Math.min(height, width) / 2,
                        totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset;

                    chart.attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            posX = pos.x === "left" ? width / 2 - r : pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? height / 2 - r : pos.y === "bottom" ? height / 2 + r : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

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

                    var types = createNodeTypes(copy.data, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var treeLayout = d3.cluster().size([360, 1]).separation(function () {
                        return 1;
                    }),
                        treeRoot = d3.hierarchy(treeData, function (d) {
                        return d.children;
                    }).sort(function (a, b) {
                        return b.depth - a.depth;
                    }),
                        nodes = treeLayout(treeRoot),
                        descendants = nodes.descendants().filter(function (n) {
                        return n.parent != null;
                    });

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    svg.append("rect").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("fill", "none");

                    var visTranslate = [width / 2, height / 2],
                        vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                    vis.append("rect").attr("x", -r).attr("y", -r).attr("width", 2 * r).attr("height", 2 * r).style("opacity", 1e-6);

                    descendants.forEach(function (d) {
                        d.x0 = d.x; // remember initial position
                        d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d.data._depth * totalTreeLength;
                    });

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10)).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    // TODO: implement equidistant generations
                    //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                    //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, 2 * r);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    if (layout.heatmap.enabled) {
                        heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(descendants.filter(function (n) {
                            return !isNaN(parseFloat(n.data.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.data.z);
                        }).style("opacity", layout.heatmap.opacity).attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        });

                        multiAttr.call(heatmapCircle, layout.heatmap.circle);
                    }

                    var link = vis.selectAll("path.link").data(descendants.filter(function (n) {
                        return n.parent.data.name != virtualRootName;
                    })).enter().append("path").attr("class", "link").attr("fill", "none").attr("d", step).each(function (d) {
                        d.inLinkNode = this;
                        if (d.parent.outLinkNodes) d.parent.outLinkNodes.push(this);else d.parent.outLinkNodes = [this];
                    });

                    multiAttr.call(link, layout.link);

                    var node = vis.selectAll("g.node").data(descendants).enter().append("g").attr("id", function (d) {
                        return d.name;
                    }).attr("class", "node").attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).each(function (d) {
                        d.nodeGroupNode = this;
                    });

                    var nodeLabel = node.append("text").attr("class", "mouseover-label").attr("transform", "rotate(90)").attr("dy", ".25em").attr("dx", ".6em").style("opacity", 1e-6).text(function (d) {
                        return d.data.name;
                    });

                    multiAttr.call(nodeLabel, layout.nodeLabel);
                    nodeLabel.call(getBB);

                    node.insert("rect", "text").attr("x", function (d) {
                        return d.bbox.x - 3;
                    }).attr("y", function (d) {
                        return d.bbox.y;
                    }).attr("width", function (d) {
                        return d.bbox.width + 6;
                    }).attr("height", function (d) {
                        return d.bbox.height + 3;
                    }).attr("transform", "rotate(90)").style("fill", "white").style("opacity", 1e-6);

                    var circle = node.append("circle").attr("fill", "white").style("stroke", function (d) {
                        return colours(d.data.series);
                    });

                    multiAttr.call(circle, nodeAttr);

                    var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / descendants.filter(function (d) {
                        return !d.children || !d.children.length;
                    }).length;

                    layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                    var label = vis.selectAll("text.outer-label").data(descendants.filter(function (d) {
                        return d.x !== undefined && !d.children;
                    })).enter().append("text").attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    }).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                    }).text(function (d) {
                        return d.data.name;
                    });

                    multiAttr.call(label, layout.outerNodeLabel);

                    legend.each(moveToFront);
                    titleSVG.each(moveToFront);

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

                            hoveredNode.each(moveToFront);

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
                        }).transition().duration(duration).attrTween("transform", tweenNodeGroup).on("end", function (d) {
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
                            vis.transition().delay(duration).duration(transitionScale(rotationDifference + 1)).attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').on("end", function () {
                                d3.select(this).selectAll("text.outer-label").attr("text-anchor", function (d) {
                                    return (d.x + rotate) % 360 < 180 ? "start" : "end";
                                }).attr("transform", function (d) {
                                    return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                                });
                            });
                        }

                        rotateOld = rotate;
                    }

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
                        var s = project(d.parent),
                            m = project({ x: d.x, y: d.parent.y }),
                            t = project(d),
                            r = d.parent.y,
                            sweep = d.x > d.parent.x ? 1 : 0,
                            largeArc = Math.abs(d.x - d.parent.x) % 360 > 180 ? 1 : 0;

                        return 'M' + s[0] + ',' + s[1] + 'A' + r + ',' + r + ' 0 ' + largeArc + ',' + sweep + ' ' + m[0] + ',' + m[1] + 'L' + t[0] + ',' + t[1];
                    }

                    function tweenPath(d) {
                        var midSourceX = d.parent._x !== undefined ? d3.interpolateNumber(d.parent._x, d.parent.x) : function () {
                            return d.parent.x;
                        },
                            midTargetX = d._x !== undefined ? d3.interpolateNumber(d._x, d.x) : function () {
                            return d.x;
                        },
                            midpoints = { x: 0, y: d.y, parent: { x: 0, y: d.parent.y } };

                        return function (t) {
                            midpoints.parent.x = midSourceX(t);
                            midpoints.x = midTargetX(t);
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

                    var controls = {
                        'download': function download() {},
                        'zoom': toggleMove
                    };

                    createPlotControls(element[0], controls);

                    function toggleMove(toggle) {
                        if (toggle) {
                            node.on("click", clicked);
                            chart.on("mousedown", function () {
                                if (!hovering) {
                                    svg.style("cursor", "move");
                                    start = mouse(svg.node());
                                    d3.event.preventDefault();
                                }
                            }).on("mouseup", function () {
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
                        } else {
                            node.on("click", null);
                            chart.on("mousedown", null).on("mouseup", null).on("mousemove", null);
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
        setters: [function (_3) {}, function (_4) {}, function (_5) {
            angular = _5['default'];
        }, function (_6) {
            d3 = _6;
        }, function (_7) {
            d3tooltip = _7.d3tooltip;
            d3legend = _7.d3legend;
            createTreeLayout = _7.createTreeLayout;
            mergeTemplateLayout = _7.mergeTemplateLayout;
            calcColourBarSize = _7.calcColourBarSize;
            drawColourBar = _7.drawColourBar;
            createNodeTypes = _7.createNodeTypes;
            createDynamicNodeAttr = _7.createDynamicNodeAttr;
            testLabelLength = _7.testLabelLength;
            multiAttr = _7.multiAttr;
            createPlotControls = _7.createPlotControls;
        }, function (_) {
            _Set = _['default'];
        }, function (_2) {
            _Array$from = _2['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }, function (_b) {
            _Object$keys = _b['default'];
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: null,
                width: null,
                height: 600,
                margin: {
                    top: 10,
                    bottom: 10,
                    right: 10,
                    left: 10
                },
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
                        height: "90%",
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

            _export('default', angular.module('ancestry.radial-lineage', ['ancestry.utils']).directive('radialLineagePlot', RadialLineagePlotDirective));
        }
    };
});
$__System.registerDynamic("c", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.register('d', ['4', '5', '6', '7', '8', '9', 'a', 'b', 'c'], function (_export) {
    var angular, d3, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar, createNodeTypes, createDynamicNodeAttr, testLabelLength, multiAttr, createPlotControls, _Set, _Array$from, _getIterator, _Object$keys, layoutTemplate;

    function RadialPhylogeneticTreeDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                branchlength: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-radial-phylogenetic-tree");

                var svg = d3.select(element[0]).style("position", "relative").append("svg").style("width", "100%");

                var hovering = false,
                    virtualRoot = null,
                    virtualRootName = "virtual_root",
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
                    colours = d3.scaleOrdinal(d3.schemeCategory10);

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
                        pathname = $window.location.pathname;

                    var elementWidth = element[0].offsetWidth;

                    treeData = treeData.map(function (t) {
                        return collapseSeries(t, visibleSeries);
                    }).filter(function (t) {
                        return t !== null;
                    });

                    var isMultipleTree = treeData.length > 1,
                        longestNodeName = treeData.length ? extractProp(treeData, "name").reduce(function (a, b) {
                        return a.length > b.length ? a : b;
                    }) : "",
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
                        legendOut = { top: false, right: false, bottom: false, left: false },
                        colourBarOrigWidth = layout.heatmap.colourBar.width,
                        colourBarOrigHeight = layout.heatmap.colourBar.height,
                        showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                        legend = d3.select(),
                        colourbar = d3.select(),
                        titleSVG = d3.select();

                    var width = layout.width || elementWidth,
                        height = layout.height;

                    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", "white");

                    if (layout.legend.show) {
                        if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                        if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                    }

                    var margin = layout.margin;
                    if (layout.title) margin.top += legendOut.top ? 26 : 25;

                    var chart = svg.append("g");

                    multipleTreeOffset = isMultipleTree ? 30 : 0;

                    if (layout.heatmap.enabled) {

                        var domain = d3.extent(extractProp(treeData, "z").filter(function (d) {
                            return !!d;
                        }));

                        if (domain[0] == domain[1]) {
                            if (domain[0] === undefined) {
                                domain[0] = domain[1] = 0;
                            }
                            domain[0] -= 0.5;
                            domain[1] += 0.5;
                        }

                        heatmapColourScale = d3.scaleLinear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect();

                            colourbarWidth = bbox.width;
                            margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                            colourbarHeight = bbox.height;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? legendHeight - 11 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    width = (layout.width || elementWidth) - margin.right - margin.left;
                    height = layout.height - margin.top - margin.bottom;

                    var r = Math.min(height, width) / 2;

                    totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset;

                    chart.attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

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

                        trees = virtualRoot;
                    } else if (treeData.length) {
                        trees = treeData[0];
                        spreadNodes(trees);
                    }

                    var types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var treeLayout = d3.cluster().size([360, 1]).separation(function () {
                        return 1;
                    }),
                        treeRoot = d3.hierarchy(trees, function (d) {
                        return d.children;
                    }).sort(function (a, b) {
                        return b.depth - a.depth;
                    }),
                        nodes = treeLayout(treeRoot),
                        descendants = nodes.descendants().filter(function (n) {
                        return n.parent != null;
                    });

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    svg.append("rect").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("fill", "none");

                    var visTranslate = [width / 2, height / 2],
                        vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                    vis.append("rect").attr("x", -r).attr("y", -r).attr("width", 2 * r).attr("height", 2 * r).style("opacity", 1e-6);

                    descendants.forEach(function (d) {
                        d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d.data._depth * totalTreeLength;
                    });

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10)).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, 2 * r);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    if (layout.heatmap.enabled) {
                        heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(descendants.filter(function (n) {
                            return n.data.taxon && n.data.taxon.name !== null && !isNaN(parseFloat(n.data.taxon.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.data.taxon.z);
                        }).style("opacity", layout.heatmap.opacity).attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        });

                        multiAttr.call(heatmapCircle, layout.heatmap.circle);
                    }

                    if (treeData.length) {
                        removeNegativeLengths(trees);
                        setRadius(trees, trees.length = 0, totalTreeLength / maxLength(trees));
                    }

                    var show = scope.branchlength !== undefined ? scope.branchlength : true;
                    linkExtension = vis.append("g").selectAll("path").data(descendants.filter(function (d) {
                        return !d.children;
                    })).enter().append("path").attr("stroke", "black").style("opacity", 0.2).attr("class", "link-extension").each(function (d) {
                        d.linkExtensionNode = this;
                    }).attr("d", function (d) {
                        return step2(d.x, show ? d.data.radius : d.y, d.x, totalTreeLength + multipleTreeOffset);
                    });

                    link = vis.append("g").selectAll("path").data(descendants.filter(function (n) {
                        return n.parent.data.name != virtualRootName;
                    })).enter().append("path").attr("class", "link").attr("fill", "none").each(function (d) {
                        d.linkNode = this;
                    }).attr("d", function (d) {
                        return step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y);
                    }).style("stroke", "black");

                    multiAttr.call(link, layout.link);

                    if (isMultipleTree) {
                        link.filter(function (d) {
                            return d.parent.name === virtualRootName;
                        }).style("opacity", 0);
                    }

                    if (layout.showLeafNodes) {
                        node = vis.selectAll("g.node").data(descendants.filter(function (d) {
                            return !d.children || !d.children.length;
                        })).enter().append("g")
                        //.attr("id", d => d.name)
                        .attr("class", "node").attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).each(function (d) {
                            d.nodeGroupNode = this;
                        });

                        node.filter(function (d) {
                            return !d.data.taxon;
                        }).style("opacity", 0);

                        var nodeCircle = node.append("circle").attr("fill", "white").style("stroke", function (d) {
                            return d.data.taxon && d.data.name !== virtualRootName ? colours(d.data.taxon.series) : "none";
                        });

                        multiAttr.call(nodeCircle, nodeAttr);
                    }

                    var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / descendants.filter(function (d) {
                        return !d.children || !d.children.length;
                    }).length;

                    layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                    var label = vis.selectAll("text.outer-label").data(descendants.filter(function (d) {
                        return !!d.data.taxon;
                    })).enter().append("text").attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    }).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                    }).text(function (d) {
                        return d.data.taxon.name;
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false));

                    multiAttr.call(label, layout.outerNodeLabel);

                    legend.each(moveToFront);
                    titleSVG.each(moveToFront);

                    function mouseovered(active) {
                        return function (d) {
                            d3.select(this).classed("label-active", active);
                            d3.select(d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                            do d3.select(d.linkNode).classed("link-active", active).each(moveToFront); while (d = d.parent);
                        };
                    }

                    var controls = {
                        'download': function download() {},
                        'zoom': toggleMove
                    };

                    createPlotControls(element[0], controls);

                    function toggleMove(toggle) {
                        if (toggle) {
                            chart.on("mousedown", function () {
                                if (!hovering) {
                                    svg.style("cursor", "move");
                                    start = mouse(svg.node());
                                    d3.event.preventDefault();
                                }
                            }).on("mouseup", function () {
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
                        } else {
                            chart.on("mousedown", null).on("mouseup", null).on("mousemove", null);
                        }
                    }

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
                    var values = [];
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = _getIterator(trees), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var tree = _step2.value;

                            extract(tree);
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

                    function extract(tree) {
                        if (tree.taxon !== null) values.push(tree.taxon[prop]);else {
                            extract(tree.children[0]);
                            extract(tree.children[1]);
                        }
                    }
                    return values;
                }

                // Handle window resize event.
                scope.$on('window-resize', function (event) {
                    render({ isNewData: false });
                });

                scope.$watch("value", function () {
                    render({ isNewData: true });
                });

                scope.$watch("branchlength", function (show) {
                    if (!linkExtension || !link || !totalTreeLength) return;
                    d3.transition().duration(750).each(function () {
                        linkExtension.transition().attr("d", function (d) {
                            return step2(d.x, show ? d.data.radius : d.y, d.x, totalTreeLength + multipleTreeOffset);
                        });
                        link.transition().attr("d", function (d) {
                            return step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y);
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
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = _getIterator(node.children), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var child = _step3.value;

                childMax = spreadNodes(child, level + 1);
                if (childMax > max) {
                    max = childMax;
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

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _getIterator(leavesOut), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var leaf = _step4.value;

                var _parent = leaf.parent;
                if (!_parent && leaf.taxon) {
                    return null;
                }
                var sibling = _parent.children[_parent.children.indexOf(leaf) ^ 1];
                var parent2 = _parent.parent;
                if (!parent2) {
                    sibling.parent = null;
                    tree = sibling;
                    continue;
                }
                parent2.children[parent2.children.indexOf(_parent)] = sibling;
                sibling.length += _parent.length;
                sibling.parent = parent2;
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

        return !tree.children.length ? null : tree;
    }

    return {
        setters: [function (_3) {}, function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5;
        }, function (_6) {
            d3legend = _6.d3legend;
            createTreeLayout = _6.createTreeLayout;
            mergeTemplateLayout = _6.mergeTemplateLayout;
            calcColourBarSize = _6.calcColourBarSize;
            drawColourBar = _6.drawColourBar;
            createNodeTypes = _6.createNodeTypes;
            createDynamicNodeAttr = _6.createDynamicNodeAttr;
            testLabelLength = _6.testLabelLength;
            multiAttr = _6.multiAttr;
            createPlotControls = _6.createPlotControls;
        }, function (_) {
            _Set = _['default'];
        }, function (_2) {
            _Array$from = _2['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }, function (_b) {
            _Object$keys = _b['default'];
        }, function (_c) {}],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: null,
                width: null,
                height: 600,
                margin: {
                    top: 10,
                    bottom: 10,
                    right: 10,
                    left: 10
                },
                nodeTypes: {},
                showLeafNodes: true,
                outerNodeLabel: {
                    "font-size": 14
                },
                link: {
                    "stroke-width": 1
                },
                heatmap: {
                    enabled: false,
                    colourScale: [[0, '#008ae5'], [1, 'yellow']],
                    colourBar: {
                        show: true,
                        height: "90%",
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

            _export('default', angular.module('ancestry.radial-phylogenetic-tree', ['ancestry.utils']).directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective));
        }
    };
});
$__System.registerDynamic("e", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.register('f', ['4', '5', '6', '7', '8', '9', '10', 'b', 'a', 'e'], function (_export) {
    var angular, d3, d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, LabelCollisionDetection, createTreeLayout, spreadGenerations, createDynamicNodeAttr, scaleProperties, getNodeLabelBBox, resetNodeLabelBBox, drawColourBar, calcColourBarSize, getExtraSpaceForLabel, testLabelLength, multiAttr, getTranslation, createPlotControls, _Set, _Array$from, _slicedToArray, _Object$keys, _getIterator, layoutTemplate, labelPositions;

    function LineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-lineage-plot");

                var svg = d3.select(element[0]).style("position", "relative").append("svg").style('width', '100%');

                var maxAllowedDepth = 180,
                    mouseStart = null,
                    colours = d3.scaleOrdinal(d3.schemeCategory10),
                    selectionRect = null,
                    tooltip = new d3tooltip(d3.select(element[0])),
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
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
                        longestNodeName = treeData.length ? treeData.reduce(function (a, b) {
                        return a.name.length > b.name.length ? a : b;
                    }).name : "",
                        verticalExtraSpace = 40,
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname,
                        maxLabelLength = testLabelLength(svg, longestNodeName, { "font-size": 12 }),
                        maxLabelOffset = d3.max(labelPositions, function (pos) {
                        return Math.abs(pos.x);
                    }),
                        legendHeight = 0,
                        legendWidth = 0,
                        colourbarHeight = 0,
                        colourbarWidth = 0,
                        legendOut = { top: false, right: false, bottom: false, left: false },
                        lcdEnabled = layout.labelCollisionDetection.enabled != "never",
                        lastTransform = d3.zoomIdentity,
                        showAxisTitle = layout.axis.show && !layout.axis.gridOnly && layout.axis.title,
                        showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                        colourBarOrigWidth = layout.heatmap.colourBar.width,
                        colourBarOrigHeight = layout.heatmap.colourBar.height,
                        colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
                        colourbar = d3.select(),
                        legend = d3.select(),
                        xAxisOffset = 0,
                        titleSVG = d3.select(),
                        axisSVG = d3.select();

                    if (layout.legend.show) {
                        if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                        if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                    }

                    if (maxLabelLength < 40) maxLabelLength = 40;

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

                    var margin = layout.margin;

                    if (layout.title) margin.top += legendOut.top ? 26 : 25;
                    //if (!(layout.legend.position.y == "top" && layout.legend.anchor.y == "outside")) margin.top += 10;
                    if (showAxisTitle) margin.bottom += legendOut.bottom ? 16 : 18;

                    var width = layout.width || elementWidth,
                        height = layout.height;

                    // render chart area
                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", "white");

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

                        heatmapColourScale = d3.scaleLinear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect(),
                                pos = layout.heatmap.colourBar.position;
                            colourbarWidth = bbox.width;
                            colourbarHeight = bbox.height;
                            if (pos === "right" || pos === "left") margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                            //else if (pos === "top" || pos === "bottom")
                            //    margin.top += colourbarHeight;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;
                        legendWidth = bbox.width;

                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? layout.axis.show && !layout.axis.gridOnly ? legendHeight - 9 : legendHeight - 12 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    width = (layout.width || elementWidth) - margin.right - margin.left;

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    // diagonal generator
                    function diagonal(d) {
                        var c = Math.abs(d.parent.x - d.x) / 2;

                        return "M" + d.x + "," + d.y + "C" + (d.parent.x + c) + "," + d.y + " " + (d.parent.x + c) + "," + d.parent.y + " " + d.parent.x + "," + d.parent.y;
                    }

                    var generationExtent = d3.extent(treeData, function (node) {
                        return node.generation;
                    }),
                        originalExtent = angular.copy(generationExtent);

                    generationExtent[1] += 1;
                    generationExtent[0] -= 1;
                    var depth = width / (generationExtent[1] - generationExtent[0]);
                    var spaceRight = 1;
                    //trim depth if exceeds maximum allowed depth
                    if (depth > maxAllowedDepth) {
                        depth = maxAllowedDepth;
                        spaceRight = width / depth - originalExtent[1];
                        generationExtent[1] = width / depth;
                    }

                    // define x scale
                    var xScale = d3.scaleLinear().domain(generationExtent).range([0, width]);

                    var labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
                        newDomain = angular.copy(xScale.domain());

                    if (labelExtraSpace > 1) {
                        newDomain[0] = originalExtent[0] - labelExtraSpace;
                    }
                    if (labelExtraSpace > spaceRight) {
                        newDomain[1] = originalExtent[1] + labelExtraSpace;
                    }

                    xScale.domain(newDomain);

                    // Define x axis and grid
                    var xAxis = d3.axisBottom().scale(xScale).tickSizeInner(0).tickSizeOuter(0);

                    //render x axis
                    if (layout.axis.show) {
                        axisSVG = chart.append("g").attr("class", "axis x-axis").call(xAxis);

                        if (!layout.axis.gridOnly) {
                            xAxisOffset = axisSVG.node().getBBox().height;
                            margin.bottom += xAxisOffset - 3;
                        }

                        xAxis.ticks(Math.ceil(xScale.domain().reduce(function (a, b) {
                            return b - a;
                        })));
                    }

                    height = layout.height - margin.top - margin.bottom;
                    xAxis.tickSizeInner(-height);
                    axisSVG.attr("transform", 'translate(0, ' + height + ')').call(xAxis);
                    axisSVG.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
                    axisSVG.selectAll("path.domain").attr("stroke", "grey");
                    axisSVG.selectAll("path.domain").style("shape-rendering", "crispEdges");

                    chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

                    var treeLayout = d3.tree().size([height - verticalExtraSpace, width]),
                        nodes = treeLayout(d3.hierarchy(root, function (d) {
                        return d.children;
                    }));

                    var descendants = nodes.descendants().filter(function (n) {
                        return n.parent !== null;
                    });
                    // Calculate depth positions.
                    descendants.forEach(function (node) {
                        node.y = node.x + verticalExtraSpace / 2;
                        node.x = xScale(node.data.generation);
                    });

                    var clip = defs.append("svg:clipPath").attr("id", "lineage-clip-rect").append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", legendOut.top ? -legendHeight : -10).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    // render x axis label if exists
                    if (showAxisTitle) {
                        chart.append("text") // text label for the x axis
                        .attr("class", "axis-title").style("text-anchor", "middle").text(layout.axis.title).attr("transform", 'translate(' + width / 2 + ', ' + (height + xAxisOffset + 15) + ')');
                    }

                    if (layout.axis.gridOnly) {
                        chart.selectAll("g.x-axis path.domain, g.x-axis g.tick text").style("opacity", 1e-6);
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            titleOffset = showAxisTitle ? 16 : 0,
                            posX = pos.x === "left" ? 0 : pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? 0 : pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? xAxisOffset + titleOffset : 0) : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    var mouseCaptureGroup = chart.append("g");

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("width", width).attr("height", height).style("fill", "transparent");

                    var treesContainer = chart.append("g").attr("clip-path", 'url(' + pathname + '#lineage-clip-rect)').append("g").attr("id", "trees-containter");

                    if (layout.heatmap.enabled) {
                        heatmapCircle = treesContainer.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(descendants.filter(function (n) {
                            return !isNaN(parseFloat(n.data.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.data.z);
                        }).style("opacity", layout.heatmap.opacity).attr("transform", function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        });

                        multiAttr.call(heatmapCircle, layout.heatmap.circle);
                    }

                    // Declare the nodes
                    var node = treesContainer.selectAll("g.node").data(descendants).enter().append("g").attr("class", "node").classed("selected", function (d) {
                        return selectedNodes.has(d.data.name);
                    }).attr("transform", function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });

                    // Add node circles
                    var circle = node.append("circle").attr("class", "node-circle").style("fill", function (d) {
                        return !selectedNodes.has(d.data.name) ? '#FFF' : colours(d.data.series);
                    }).style("stroke", function (d) {
                        return colours(d.data.series);
                    }).on("mouseover", function (d, i) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.data.series) + '"></div>' + ('<span class="tooltip-text">' + d.data.name + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    multiAttr.call(circle, nodeAttr);
                    circle.each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                        d.bbox = d.bboxCircle;
                    });

                    // Add node labels
                    var label = node.append("text").attr("class", "node-label").attr("dy", ".35em").text(function (d) {
                        return d.data.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    multiAttr.call(label, layout.nodeLabel);
                    multiAttr.call(label, initialLabelPosition);

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.width;
                    })),
                        maxNodeLabelHeight = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.height;
                    })),
                        searchRadius = { x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight };

                    if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                        LCD = new LabelCollisionDetection(node, labelPositions, layout.nodeLabel, width, height, searchRadius);
                        LCD.recalculateLabelPositions(label, d3.zoomIdentity);
                    }

                    // Declare the links
                    var link = treesContainer.selectAll("path.link")
                    //.data(links.filter(l => l.source.name != "virtualRoot"));
                    .data(descendants.filter(function (n) {
                        return n.parent.data.name != "virtualRoot";
                    })).enter().insert("path", "g").attr("class", "link").attr("d", diagonal);

                    multiAttr.call(link, layout.link);

                    legend.each(function () {
                        this.parentNode.appendChild(this);
                    });
                    titleSVG.each(function () {
                        this.parentNode.appendChild(this);
                    });

                    if (layout.groupSelection.enabled) {
                        selectionRect = mouseCaptureGroup.append("rect").attr("class", "selection-rect");

                        multiAttr.call(selectionRect, layout.groupSelection.selectionRectangle);
                    }

                    function click() {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle.node-circle").style("fill", function (d) {
                                return colours(d.data.series);
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle.node-circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }
                    function mouseDown() {
                        d3.event.preventDefault();
                        mouseStart = d3.mouse(mouseRect.node());
                        mouseRect.on("mousemove", mouseMove).on("mouseup", finalizeSelection).on("mouseout", finalizeSelection);
                        circle.style("pointer-events", "none");
                    }

                    function finalizeSelection() {
                        selectionRect.attr("width", 0);
                        updateSelection();
                        circle.style("pointer-events", "all");
                        mouseRect.on("mousemove", null).on("mouseup", null).on("mouseout", null);
                    }

                    function mouseMove() {
                        var p = d3.mouse(mouseRect.node());
                        var d = {
                            x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                            y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                        multiAttr.call(selectionRect, d);
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

                            var _getTranslation = getTranslation(n.attr("transform"));

                            var _getTranslation2 = _slicedToArray(_getTranslation, 2);

                            var tx = _getTranslation2[0];
                            var ty = _getTranslation2[1];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle.node-circle").style("fill", function (d) {
                                    return colours(d.data.series);
                                });
                                any = true;
                            } else if (!selectedNodes.has(d.data.name)) {
                                n.classed("selected", false);
                                n.select("circle.node-circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var wasChange = false;

                        svg.selectAll("g.node.selected").each(function (d) {
                            if (!selectedNodes.has(d.data.name)) {
                                selectedNodes.add(d.data.name);
                                wasChange = true;
                            }
                        });

                        svg.selectAll("g.node:not(.selected)").each(function (d) {
                            if (selectedNodes.has(d.data.name)) {
                                selectedNodes['delete'](d.data.name);
                                wasChange = true;
                            }
                        });

                        if (wasChange && scope.selectedNodes) {
                            scope.selectedNodes = _Array$from(selectedNodes);
                            scope.$apply();
                        }
                    }

                    var zoom = d3.zoom().scaleExtent([1, layout.maxZoom]).extent([[0, 0], [width, height]]).translateExtent([[0, 0], [width, height]]).on("zoom", onZoom);

                    function onZoom() {
                        applyZoom(d3.event.transform);
                        if (lcdEnabled) {
                            applyLCD(d3.event.transform);
                        }
                        lastTransform = d3.event.transform;
                    }

                    function applyZoom(zoomTransform) {
                        var scale = zoomTransform.k;
                        treesContainer.attr("transform", zoomTransform);
                        mouseCaptureGroup.attr("transform", zoomTransform);
                        xAxis.ticks(Math.ceil(xScale.domain().reduce(function (a, b) {
                            return b - a;
                        }) / scale));
                        axisSVG.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
                        axisSVG.selectAll(".tick line").style("shape-rendering", "crispEdges").attr("opacity", 0.2);
                        if (layout.axis.gridOnly) {
                            chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
                        }

                        multiAttr.call(circle, scaleProperties(nodeAttr, scale, true));

                        circle.attr("stroke", function (d) {
                            return colours(d.data.series);
                        }).each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });

                        if (layout.heatmap.enabled) {
                            multiAttr.call(heatmapCircle, scaleProperties(layout.heatmap.circle, scale));
                        }
                        multiAttr.call(svg.selectAll("path.link"), scaleProperties(layout.link, scale));
                        label.each(function (d) {
                            var self = d3.select(this);
                            multiAttr.call(self, scaleProperties(layout.nodeLabel, scale));
                            multiAttr.call(self, scaleProperties(d.labelPos, scale));
                        });

                        if (layout.groupSelection.enabled) {
                            multiAttr.call(selectionRect, scaleProperties(layout.groupSelection.selectionRectangle, scale));
                        }
                    }

                    function onDoubleClick() {
                        var I = d3.zoomIdentity;
                        chart.call(zoom.transform, I);
                        applyZoom(I);
                        if (lcdEnabled) {
                            applyLCD(I);
                        }
                        lastTransform = I;
                    }

                    function applyLCD(transform) {
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, transform);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, transform);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = performance.now();
                        }
                    }

                    var controls = {
                        'download': function download() {},
                        'zoom': toggleZoom,
                        'select': toggleSelect,
                        'label': toggleLabels
                    };
                    var activeControls = [];
                    if (layout.showLabel) activeControls.push("label");

                    createPlotControls(element[0], controls, activeControls);

                    function toggleZoom(toggle) {
                        if (toggle) {
                            chart.call(zoom).on('dblclick.zoom', onDoubleClick);
                        } else {
                            chart.on("wheel.zoom", null).on("mousedown.zoom", null).on("dblclick.zoom", null).on("touchstart.zoom", null).on("touchmove.zoom", null).on("touchend.zoom", null).on("touchcancel.zoom", null);
                        }
                    }

                    function toggleSelect(toggle) {
                        mouseRect.on("mousedown", toggle ? mouseDown : null);
                        circle.on("click", toggle ? click : null);
                    }

                    function toggleLabels(toggle) {
                        label.style("opacity", function (d) {
                            return toggle && !d.isColliding ? 1 : 1e-6;
                        });
                        if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                            lcdEnabled = !lcdEnabled;
                            if (lcdEnabled) {
                                LCD.recalculateLabelPositions(label, lastTransform);
                            }
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
        setters: [function (_4) {}, function (_5) {
            angular = _5['default'];
        }, function (_6) {
            d3 = _6;
        }, function (_7) {
            d3legend = _7.d3legend;
            d3tooltip = _7.d3tooltip;
            mergeTemplateLayout = _7.mergeTemplateLayout;
            createNodeTypes = _7.createNodeTypes;
            LabelCollisionDetection = _7.LabelCollisionDetection;
            createTreeLayout = _7.createTreeLayout;
            spreadGenerations = _7.spreadGenerations;
            createDynamicNodeAttr = _7.createDynamicNodeAttr;
            scaleProperties = _7.scaleProperties;
            getNodeLabelBBox = _7.getNodeLabelBBox;
            resetNodeLabelBBox = _7.resetNodeLabelBBox;
            drawColourBar = _7.drawColourBar;
            calcColourBarSize = _7.calcColourBarSize;
            getExtraSpaceForLabel = _7.getExtraSpaceForLabel;
            testLabelLength = _7.testLabelLength;
            multiAttr = _7.multiAttr;
            getTranslation = _7.getTranslation;
            createPlotControls = _7.createPlotControls;
        }, function (_2) {
            _Set = _2['default'];
        }, function (_3) {
            _Array$from = _3['default'];
        }, function (_) {
            _slicedToArray = _['default'];
        }, function (_b) {
            _Object$keys = _b['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }, function (_e) {}],
        execute: function () {
            'use strict';

            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };

            layoutTemplate = {
                title: null,
                width: null,
                height: 600,
                margin: {
                    right: 10,
                    left: 10,
                    top: 10,
                    bottom: 10
                },
                axis: {
                    title: "",
                    show: true,
                    gridOnly: false,
                    valueProperty: "default"
                },
                showLabel: true,
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                labelCollisionDetection: {
                    enabled: "never",
                    updateDelay: 500
                },
                link: {
                    fill: "none",
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
                    title: null,
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

            _export('default', angular.module('ancestry.lineage', ['ancestry.utils']).directive('lineagePlot', LineagePlotDirective));
        }
    };
});
$__System.registerDynamic("11", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.register('4', ['5'], function (_export) {
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
            _export('default', angular.module('ancestry.utils', []).service("WindowResize", WindowResize));
        }
    };
});
$__System.registerDynamic("12", ["13"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('13');
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("14", ["12"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('12'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("15", ["14"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var _Object$defineProperty = $__require('14')["default"];
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

$__System.registerDynamic("16", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("17", ["18", "19", "1a", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = $__require('18'),
      ITERATOR = $__require('19')('iterator'),
      Iterators = $__require('1a');
  module.exports = $__require('1b').isIterable = function(it) {
    var O = Object(it);
    return O[ITERATOR] !== undefined || '@@iterator' in O || Iterators.hasOwnProperty(classof(O));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1c", ["1d", "1e", "17"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('1d');
  $__require('1e');
  module.exports = $__require('17');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1f", ["1c"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('1c'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("10", ["a", "1f"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var _getIterator = $__require('a')["default"];
  var _isIterable = $__require('1f')["default"];
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

$__System.registerDynamic("20", ["13", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('13'),
      hide = $__require('21'),
      redefineAll = $__require('22'),
      ctx = $__require('23'),
      strictNew = $__require('24'),
      defined = $__require('25'),
      forOf = $__require('26'),
      $iterDefine = $__require('27'),
      step = $__require('28'),
      ID = $__require('29')('id'),
      $has = $__require('2a'),
      isObject = $__require('2b'),
      setSpecies = $__require('2c'),
      DESCRIPTORS = $__require('2d'),
      isExtensible = Object.isExtensible || isObject,
      SIZE = DESCRIPTORS ? '_s' : 'size',
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
      redefineAll(C.prototype, {
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
          var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3),
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
      if (DESCRIPTORS)
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
      $iterDefine(C, NAME, function(iterated, kind) {
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
      setSpecies(NAME);
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2e", ["13", "2f", "30", "31", "21", "22", "26", "24", "2b", "32", "2d"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('13'),
      global = $__require('2f'),
      $export = $__require('30'),
      fails = $__require('31'),
      hide = $__require('21'),
      redefineAll = $__require('22'),
      forOf = $__require('26'),
      strictNew = $__require('24'),
      isObject = $__require('2b'),
      setToStringTag = $__require('32'),
      DESCRIPTORS = $__require('2d');
  module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = global[NAME],
        C = Base,
        ADDER = IS_MAP ? 'set' : 'add',
        proto = C && C.prototype,
        O = {};
    if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function() {
      new C().entries().next();
    }))) {
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      redefineAll(C.prototype, methods);
    } else {
      C = wrapper(function(target, iterable) {
        strictNew(target, C, NAME);
        target._c = new Base;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, target[ADDER], target);
      });
      $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','), function(KEY) {
        var IS_ADDER = KEY == 'add' || KEY == 'set';
        if (KEY in proto && !(IS_WEAK && KEY == 'clear'))
          hide(C.prototype, KEY, function(a, b) {
            if (!IS_ADDER && IS_WEAK && !isObject(a))
              return KEY == 'get' ? undefined : false;
            var result = this._c[KEY](a === 0 ? 0 : a, b);
            return IS_ADDER ? this : result;
          });
      });
      if ('size' in proto)
        $.setDesc(C.prototype, 'size', {get: function() {
            return this._c.size;
          }});
    }
    setToStringTag(C, NAME);
    O[NAME] = C;
    $export($export.G + $export.W + $export.F, O);
    if (!IS_WEAK)
      common.setStrong(C, NAME, IS_MAP);
    return C;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("33", ["20", "2e"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var strong = $__require('20');
  $__require('2e')('Set', function(get) {
    return function Set() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  }, {add: function add(value) {
      return strong.def(this, value = value === 0 ? 0 : value, value);
    }}, strong);
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("34", ["26", "18"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var forOf = $__require('26'),
      classof = $__require('18');
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

$__System.registerDynamic("35", ["30", "34"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $export = $__require('30');
  $export($export.P, 'Set', {toJSON: $__require('34')('Set')});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("36", ["37", "1e", "1d", "33", "35", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('37');
  $__require('1e');
  $__require('1d');
  $__require('33');
  $__require('35');
  module.exports = $__require('1b').Set;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("8", ["36"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('36'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("38", ["30", "1b", "31"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $export = $__require('30'),
      core = $__require('1b'),
      fails = $__require('31');
  module.exports = function(KEY, exec) {
    var fn = (core.Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $export($export.S + $export.F * fails(function() {
      fn(1);
    }), 'Object', exp);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("39", ["3a", "38"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toObject = $__require('3a');
  $__require('38')('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3b", ["39", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('39');
  module.exports = $__require('1b').Object.keys;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("b", ["3b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('3b'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("37", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("24", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("26", ["23", "3c", "3d", "3e", "3f", "40"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = $__require('23'),
      call = $__require('3c'),
      isArrayIter = $__require('3d'),
      anObject = $__require('3e'),
      toLength = $__require('3f'),
      getIterFn = $__require('40');
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

$__System.registerDynamic("41", ["13", "2b", "3e", "23"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var getDesc = $__require('13').getDesc,
      isObject = $__require('2b'),
      anObject = $__require('3e');
  var check = function(O, proto) {
    anObject(O);
    if (!isObject(proto) && proto !== null)
      throw TypeError(proto + ": can't set as prototype!");
  };
  module.exports = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? function(test, buggy, set) {
      try {
        set = $__require('23')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) {
        buggy = true;
      }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy)
          O.__proto__ = proto;
        else
          set(O, proto);
        return O;
      };
    }({}, false) : undefined),
    check: check
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("42", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = Object.is || function is(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("43", ["3e", "44", "19"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = $__require('3e'),
      aFunction = $__require('44'),
      SPECIES = $__require('19')('species');
  module.exports = function(O, D) {
    var C = anObject(O).constructor,
        S;
    return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("45", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0:
        return un ? fn() : fn.call(that);
      case 1:
        return un ? fn(args[0]) : fn.call(that, args[0]);
      case 2:
        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
      case 3:
        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
      case 4:
        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
    }
    return fn.apply(that, args);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("46", ["2f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('2f').document && document.documentElement;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("47", ["2b", "2f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('2b'),
      document = $__require('2f').document,
      is = isObject(document) && isObject(document.createElement);
  module.exports = function(it) {
    return is ? document.createElement(it) : {};
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("48", ["23", "45", "46", "47", "2f", "4a", "49"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    var ctx = $__require('23'),
        invoke = $__require('45'),
        html = $__require('46'),
        cel = $__require('47'),
        global = $__require('2f'),
        process = global.process,
        setTask = global.setImmediate,
        clearTask = global.clearImmediate,
        MessageChannel = global.MessageChannel,
        counter = 0,
        queue = {},
        ONREADYSTATECHANGE = 'onreadystatechange',
        defer,
        channel,
        port;
    var run = function() {
      var id = +this;
      if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    };
    var listner = function(event) {
      run.call(event.data);
    };
    if (!setTask || !clearTask) {
      setTask = function setImmediate(fn) {
        var args = [],
            i = 1;
        while (arguments.length > i)
          args.push(arguments[i++]);
        queue[++counter] = function() {
          invoke(typeof fn == 'function' ? fn : Function(fn), args);
        };
        defer(counter);
        return counter;
      };
      clearTask = function clearImmediate(id) {
        delete queue[id];
      };
      if ($__require('4a')(process) == 'process') {
        defer = function(id) {
          process.nextTick(ctx(run, id, 1));
        };
      } else if (MessageChannel) {
        channel = new MessageChannel;
        port = channel.port2;
        channel.port1.onmessage = listner;
        defer = ctx(port.postMessage, port, 1);
      } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
        defer = function(id) {
          global.postMessage(id + '', '*');
        };
        global.addEventListener('message', listner, false);
      } else if (ONREADYSTATECHANGE in cel('script')) {
        defer = function(id) {
          html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function() {
            html.removeChild(this);
            run.call(id);
          };
        };
      } else {
        defer = function(id) {
          setTimeout(ctx(run, id, 1), 0);
        };
      }
    }
    module.exports = {
      set: setTask,
      clear: clearTask
    };
  })($__require('49'));
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4b", ["2f", "48", "4a", "49"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    var global = $__require('2f'),
        macrotask = $__require('48').set,
        Observer = global.MutationObserver || global.WebKitMutationObserver,
        process = global.process,
        Promise = global.Promise,
        isNode = $__require('4a')(process) == 'process',
        head,
        last,
        notify;
    var flush = function() {
      var parent,
          domain,
          fn;
      if (isNode && (parent = process.domain)) {
        process.domain = null;
        parent.exit();
      }
      while (head) {
        domain = head.domain;
        fn = head.fn;
        if (domain)
          domain.enter();
        fn();
        if (domain)
          domain.exit();
        head = head.next;
      }
      last = undefined;
      if (parent)
        parent.enter();
    };
    if (isNode) {
      notify = function() {
        process.nextTick(flush);
      };
    } else if (Observer) {
      var toggle = 1,
          node = document.createTextNode('');
      new Observer(flush).observe(node, {characterData: true});
      notify = function() {
        node.data = toggle = -toggle;
      };
    } else if (Promise && Promise.resolve) {
      notify = function() {
        Promise.resolve().then(flush);
      };
    } else {
      notify = function() {
        macrotask.call(global, flush);
      };
    }
    module.exports = function asap(fn) {
      var task = {
        fn: fn,
        next: undefined,
        domain: isNode && process.domain
      };
      if (last)
        last.next = task;
      if (!head) {
        head = task;
        notify();
      }
      last = task;
    };
  })($__require('49'));
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("22", ["4c"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var redefine = $__require('4c');
  module.exports = function(target, src) {
    for (var key in src)
      redefine(target, key, src[key]);
    return target;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2c", ["1b", "13", "2d", "19"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var core = $__require('1b'),
      $ = $__require('13'),
      DESCRIPTORS = $__require('2d'),
      SPECIES = $__require('19')('species');
  module.exports = function(KEY) {
    var C = core[KEY];
    if (DESCRIPTORS && C && !C[SPECIES])
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

$__System.registerDynamic("4d", ["13", "4e", "2f", "23", "18", "30", "2b", "3e", "44", "24", "26", "41", "42", "19", "43", "4b", "2d", "22", "32", "2c", "1b", "4f", "49"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var $ = $__require('13'),
        LIBRARY = $__require('4e'),
        global = $__require('2f'),
        ctx = $__require('23'),
        classof = $__require('18'),
        $export = $__require('30'),
        isObject = $__require('2b'),
        anObject = $__require('3e'),
        aFunction = $__require('44'),
        strictNew = $__require('24'),
        forOf = $__require('26'),
        setProto = $__require('41').set,
        same = $__require('42'),
        SPECIES = $__require('19')('species'),
        speciesConstructor = $__require('43'),
        asap = $__require('4b'),
        PROMISE = 'Promise',
        process = global.process,
        isNode = classof(process) == 'process',
        P = global[PROMISE],
        empty = function() {},
        Wrapper;
    var testResolve = function(sub) {
      var test = new P(empty),
          promise;
      if (sub)
        test.constructor = function(exec) {
          exec(empty, empty);
        };
      (promise = P.resolve(test))['catch'](empty);
      return promise === test;
    };
    var USE_NATIVE = function() {
      var works = false;
      function P2(x) {
        var self = new P(x);
        setProto(self, P2.prototype);
        return self;
      }
      try {
        works = P && P.resolve && testResolve();
        setProto(P2, P);
        P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
        if (!(P2.resolve(5).then(function() {}) instanceof P2)) {
          works = false;
        }
        if (works && $__require('2d')) {
          var thenableThenGotten = false;
          P.resolve($.setDesc({}, 'then', {get: function() {
              thenableThenGotten = true;
            }}));
          works = thenableThenGotten;
        }
      } catch (e) {
        works = false;
      }
      return works;
    }();
    var sameConstructor = function(a, b) {
      if (LIBRARY && a === P && b === Wrapper)
        return true;
      return same(a, b);
    };
    var getConstructor = function(C) {
      var S = anObject(C)[SPECIES];
      return S != undefined ? S : C;
    };
    var isThenable = function(it) {
      var then;
      return isObject(it) && typeof(then = it.then) == 'function' ? then : false;
    };
    var PromiseCapability = function(C) {
      var resolve,
          reject;
      this.promise = new C(function($$resolve, $$reject) {
        if (resolve !== undefined || reject !== undefined)
          throw TypeError('Bad Promise constructor');
        resolve = $$resolve;
        reject = $$reject;
      });
      this.resolve = aFunction(resolve), this.reject = aFunction(reject);
    };
    var perform = function(exec) {
      try {
        exec();
      } catch (e) {
        return {error: e};
      }
    };
    var notify = function(record, isReject) {
      if (record.n)
        return;
      record.n = true;
      var chain = record.c;
      asap(function() {
        var value = record.v,
            ok = record.s == 1,
            i = 0;
        var run = function(reaction) {
          var handler = ok ? reaction.ok : reaction.fail,
              resolve = reaction.resolve,
              reject = reaction.reject,
              result,
              then;
          try {
            if (handler) {
              if (!ok)
                record.h = true;
              result = handler === true ? value : handler(value);
              if (result === reaction.promise) {
                reject(TypeError('Promise-chain cycle'));
              } else if (then = isThenable(result)) {
                then.call(result, resolve, reject);
              } else
                resolve(result);
            } else
              reject(value);
          } catch (e) {
            reject(e);
          }
        };
        while (chain.length > i)
          run(chain[i++]);
        chain.length = 0;
        record.n = false;
        if (isReject)
          setTimeout(function() {
            var promise = record.p,
                handler,
                console;
            if (isUnhandled(promise)) {
              if (isNode) {
                process.emit('unhandledRejection', value, promise);
              } else if (handler = global.onunhandledrejection) {
                handler({
                  promise: promise,
                  reason: value
                });
              } else if ((console = global.console) && console.error) {
                console.error('Unhandled promise rejection', value);
              }
            }
            record.a = undefined;
          }, 1);
      });
    };
    var isUnhandled = function(promise) {
      var record = promise._d,
          chain = record.a || record.c,
          i = 0,
          reaction;
      if (record.h)
        return false;
      while (chain.length > i) {
        reaction = chain[i++];
        if (reaction.fail || !isUnhandled(reaction.promise))
          return false;
      }
      return true;
    };
    var $reject = function(value) {
      var record = this;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      record.v = value;
      record.s = 2;
      record.a = record.c.slice();
      notify(record, true);
    };
    var $resolve = function(value) {
      var record = this,
          then;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      try {
        if (record.p === value)
          throw TypeError("Promise can't be resolved itself");
        if (then = isThenable(value)) {
          asap(function() {
            var wrapper = {
              r: record,
              d: false
            };
            try {
              then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
            } catch (e) {
              $reject.call(wrapper, e);
            }
          });
        } else {
          record.v = value;
          record.s = 1;
          notify(record, false);
        }
      } catch (e) {
        $reject.call({
          r: record,
          d: false
        }, e);
      }
    };
    if (!USE_NATIVE) {
      P = function Promise(executor) {
        aFunction(executor);
        var record = this._d = {
          p: strictNew(this, P, PROMISE),
          c: [],
          a: undefined,
          s: 0,
          d: false,
          v: undefined,
          h: false,
          n: false
        };
        try {
          executor(ctx($resolve, record, 1), ctx($reject, record, 1));
        } catch (err) {
          $reject.call(record, err);
        }
      };
      $__require('22')(P.prototype, {
        then: function then(onFulfilled, onRejected) {
          var reaction = new PromiseCapability(speciesConstructor(this, P)),
              promise = reaction.promise,
              record = this._d;
          reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
          reaction.fail = typeof onRejected == 'function' && onRejected;
          record.c.push(reaction);
          if (record.a)
            record.a.push(reaction);
          if (record.s)
            notify(record, false);
          return promise;
        },
        'catch': function(onRejected) {
          return this.then(undefined, onRejected);
        }
      });
    }
    $export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
    $__require('32')(P, PROMISE);
    $__require('2c')(PROMISE);
    Wrapper = $__require('1b')[PROMISE];
    $export($export.S + $export.F * !USE_NATIVE, PROMISE, {reject: function reject(r) {
        var capability = new PromiseCapability(this),
            $$reject = capability.reject;
        $$reject(r);
        return capability.promise;
      }});
    $export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {resolve: function resolve(x) {
        if (x instanceof P && sameConstructor(x.constructor, this))
          return x;
        var capability = new PromiseCapability(this),
            $$resolve = capability.resolve;
        $$resolve(x);
        return capability.promise;
      }});
    $export($export.S + $export.F * !(USE_NATIVE && $__require('4f')(function(iter) {
      P.all(iter)['catch'](function() {});
    })), PROMISE, {
      all: function all(iterable) {
        var C = getConstructor(this),
            capability = new PromiseCapability(C),
            resolve = capability.resolve,
            reject = capability.reject,
            values = [];
        var abrupt = perform(function() {
          forOf(iterable, false, values.push, values);
          var remaining = values.length,
              results = Array(remaining);
          if (remaining)
            $.each.call(values, function(promise, index) {
              var alreadyCalled = false;
              C.resolve(promise).then(function(value) {
                if (alreadyCalled)
                  return;
                alreadyCalled = true;
                results[index] = value;
                --remaining || resolve(results);
              }, reject);
            });
          else
            resolve(results);
        });
        if (abrupt)
          reject(abrupt.error);
        return capability.promise;
      },
      race: function race(iterable) {
        var C = getConstructor(this),
            capability = new PromiseCapability(C),
            reject = capability.reject;
        var abrupt = perform(function() {
          forOf(iterable, false, function(promise) {
            C.resolve(promise).then(capability.resolve, reject);
          });
        });
        if (abrupt)
          reject(abrupt.error);
        return capability.promise;
      }
    });
  })($__require('49'));
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("50", ["37", "1e", "1d", "4d", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('37');
  $__require('1e');
  $__require('1d');
  $__require('4d');
  module.exports = $__require('1b').Promise;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("51", ["50"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('50'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3a", ["25"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var defined = $__require('25');
  module.exports = function(it) {
    return Object(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3c", ["3e"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = $__require('3e');
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

$__System.registerDynamic("3d", ["1a", "19"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var Iterators = $__require('1a'),
      ITERATOR = $__require('19')('iterator'),
      ArrayProto = Array.prototype;
  module.exports = function(it) {
    return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3f", ["52"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = $__require('52'),
      min = Math.min;
  module.exports = function(it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4f", ["19"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ITERATOR = $__require('19')('iterator'),
      SAFE_CLOSING = false;
  try {
    var riter = [7][ITERATOR]();
    riter['return'] = function() {
      SAFE_CLOSING = true;
    };
    Array.from(riter, function() {
      throw 2;
    });
  } catch (e) {}
  module.exports = function(exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING)
      return false;
    var safe = false;
    try {
      var arr = [7],
          iter = arr[ITERATOR]();
      iter.next = function() {
        return {done: safe = true};
      };
      arr[ITERATOR] = function() {
        return iter;
      };
      exec(arr);
    } catch (e) {}
    return safe;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("53", ["23", "30", "3a", "3c", "3d", "3f", "40", "4f"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = $__require('23'),
      $export = $__require('30'),
      toObject = $__require('3a'),
      call = $__require('3c'),
      isArrayIter = $__require('3d'),
      toLength = $__require('3f'),
      getIterFn = $__require('40');
  $export($export.S + $export.F * !$__require('4f')(function(iter) {
    Array.from(iter);
  }), 'Array', {from: function from(arrayLike) {
      var O = toObject(arrayLike),
          C = typeof this == 'function' ? this : Array,
          $$ = arguments,
          $$len = $$.length,
          mapfn = $$len > 1 ? $$[1] : undefined,
          mapping = mapfn !== undefined,
          index = 0,
          iterFn = getIterFn(O),
          length,
          result,
          step,
          iterator;
      if (mapping)
        mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) {
          result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
        }
      } else {
        length = toLength(O.length);
        for (result = new C(length); length > index; index++) {
          result[index] = mapping ? mapfn(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("54", ["1e", "53", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('1e');
  $__require('53');
  module.exports = $__require('1b').Array.from;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("9", ["54"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('54'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("55", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function() {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("28", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("56", ["55", "28", "1a", "57", "27"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var addToUnscopables = $__require('55'),
      step = $__require('28'),
      Iterators = $__require('1a'),
      toIObject = $__require('57');
  module.exports = $__require('27')(Array, 'Array', function(iterated, kind) {
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
  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1d", ["56", "1a"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('56');
  var Iterators = $__require('1a');
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("52", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("58", ["52", "25"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = $__require('52'),
      defined = $__require('25');
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

$__System.registerDynamic("4e", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4c", ["21"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('21');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("59", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("31", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("2d", ["31"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = !$__require('31')(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("21", ["13", "59", "2d"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('13'),
      createDesc = $__require('59');
  module.exports = $__require('2d') ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("5a", ["13", "59", "32", "21", "19"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('13'),
      descriptor = $__require('59'),
      setToStringTag = $__require('32'),
      IteratorPrototype = {};
  $__require('21')(IteratorPrototype, $__require('19')('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
    setToStringTag(Constructor, NAME + ' Iterator');
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2a", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("32", ["13", "2a", "19"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var def = $__require('13').setDesc,
      has = $__require('2a'),
      TAG = $__require('19')('toStringTag');
  module.exports = function(it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG))
      def(it, TAG, {
        configurable: true,
        value: tag
      });
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("27", ["4e", "30", "4c", "21", "2a", "1a", "5a", "32", "13", "19"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var LIBRARY = $__require('4e'),
      $export = $__require('30'),
      redefine = $__require('4c'),
      hide = $__require('21'),
      has = $__require('2a'),
      Iterators = $__require('1a'),
      $iterCreate = $__require('5a'),
      setToStringTag = $__require('32'),
      getProto = $__require('13').getProto,
      ITERATOR = $__require('19')('iterator'),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    $iterCreate(Constructor, NAME, next);
    var getMethod = function(kind) {
      if (!BUGGY && kind in proto)
        return proto[kind];
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
        DEF_VALUES = DEFAULT == VALUES,
        VALUES_BUG = false,
        proto = Base.prototype,
        $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
        $default = $native || getMethod(DEFAULT),
        methods,
        key;
    if ($native) {
      var IteratorPrototype = getProto($default.call(new Base));
      setToStringTag(IteratorPrototype, TAG, true);
      if (!LIBRARY && has(proto, FF_ITERATOR))
        hide(IteratorPrototype, ITERATOR, returnThis);
      if (DEF_VALUES && $native.name !== VALUES) {
        VALUES_BUG = true;
        $default = function values() {
          return $native.call(this);
        };
      }
    }
    if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
      hide(proto, ITERATOR, $default);
    }
    Iterators[NAME] = $default;
    Iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: !DEF_VALUES ? $default : getMethod('entries')
      };
      if (FORCED)
        for (key in methods) {
          if (!(key in proto))
            redefine(proto, key, methods[key]);
        }
      else
        $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1e", ["58", "27"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $at = $__require('58')(true);
  $__require('27')(String, 'String', function(iterated) {
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

$__System.registerDynamic("2b", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3e", ["2b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('2b');
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("18", ["4a", "19"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = $__require('4a'),
      TAG = $__require('19')('toStringTag'),
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

$__System.registerDynamic("5b", ["2f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = $__require('2f'),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("29", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("19", ["5b", "29", "2f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var store = $__require('5b')('wks'),
      uid = $__require('29'),
      Symbol = $__require('2f').Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1a", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {};
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("40", ["18", "19", "1a", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = $__require('18'),
      ITERATOR = $__require('19')('iterator'),
      Iterators = $__require('1a');
  module.exports = $__require('1b').getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("5c", ["3e", "40", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = $__require('3e'),
      get = $__require('40');
  module.exports = $__require('1b').getIterator = function(it) {
    var iterFn = get(it);
    if (typeof iterFn != 'function')
      throw TypeError(it + ' is not iterable!');
    return anObject(iterFn.call(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("5d", ["1d", "1e", "5c"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('1d');
  $__require('1e');
  module.exports = $__require('5c');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("a", ["5d"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('5d'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2f", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("44", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("23", ["44"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var aFunction = $__require('44');
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

$__System.registerDynamic("30", ["2f", "1b", "23"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = $__require('2f'),
      core = $__require('1b'),
      ctx = $__require('23'),
      PROTOTYPE = 'prototype';
  var $export = function(type, name, source) {
    var IS_FORCED = type & $export.F,
        IS_GLOBAL = type & $export.G,
        IS_STATIC = type & $export.S,
        IS_PROTO = type & $export.P,
        IS_BIND = type & $export.B,
        IS_WRAP = type & $export.W,
        exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
        target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE],
        key,
        own,
        out;
    if (IS_GLOBAL)
      source = name;
    for (key in source) {
      own = !IS_FORCED && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key] : IS_BIND && own ? ctx(out, global) : IS_WRAP && target[key] == out ? (function(C) {
        var F = function(param) {
          return this instanceof C ? new C(param) : C(param);
        };
        F[PROTOTYPE] = C[PROTOTYPE];
        return F;
      })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
      if (IS_PROTO)
        (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
    }
  };
  $export.F = 1;
  $export.G = 2;
  $export.S = 4;
  $export.P = 8;
  $export.B = 16;
  $export.W = 32;
  module.exports = $export;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("13", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("4a", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("5e", ["4a"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = $__require('4a');
  module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("25", [], true, function($__require, exports, module) {
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

$__System.registerDynamic("57", ["5e", "25"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var IObject = $__require('5e'),
      defined = $__require('25');
  module.exports = function(it) {
    return IObject(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("5f", ["13", "57"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('13'),
      toIObject = $__require('57'),
      isEnum = $.isEnum;
  module.exports = function(isEntries) {
    return function(it) {
      var O = toIObject(it),
          keys = $.getKeys(O),
          length = keys.length,
          i = 0,
          result = [],
          key;
      while (length > i)
        if (isEnum.call(O, key = keys[i++])) {
          result.push(isEntries ? [key, O[key]] : O[key]);
        }
      return result;
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("60", ["30", "5f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $export = $__require('30'),
      $entries = $__require('5f')(true);
  $export($export.S, 'Object', {entries: function entries(it) {
      return $entries(it);
    }});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1b", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var core = module.exports = {version: '1.2.6'};
  if (typeof __e == 'number')
    __e = core;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("61", ["60", "1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('60');
  module.exports = $__require('1b').Object.entries;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("62", ["61"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('61'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("63", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {
    this["SVG2Bitmap"] = SVG2Bitmap;
    function SVG2Bitmap(svg, receiver, params) {
      "use strict";
      if (!params) {
        params = {};
      }
      if (!params.scale || params.scale < 0) {
        params.scale = 1;
      }
      if (!svg || !svg.nodeName) {
        console.error('Wrong arguments : should be \n SVG2Bitmap(SVGElement, function([canvasElement],[dataURL]) || IMGElement || CanvasElement [, {parameters})');
        return;
      }
      var frame;
      var loadHandler = function() {
        this.removeEventListener('load', loadHandler);
        SVG2Bitmap(this, receiver, params);
      };
      if (svg.nodeName === "OBJECT" || svg.nodeName === "IFRAME") {
        if (!svg.contentDocument || (svg.contentDocument.readyState === 'complete' && !svg.contentDocument.documentElement)) {
          console.error('Unable to access the svg node : make sure it comes from the same domain or that the container has finished loading');
          return;
        }
        if (svg.contentDocument.readyState !== 'complete') {
          svg.addEventListener('load', loadHandler);
          return;
        }
        frame = svg;
        svg = svg.contentDocument.documentElement;
      } else if (svg.nodeName === 'EMBED' && svg.getSVGDocument) {
        frame = svg;
        svg = svg.getSVGDocument();
        if (!svg) {
          frame.addEventListener('load', loadHandler);
          frame.onerror = function() {
            console.error('Unable to access the svg node : make sure it comes from the same domain or that the container has finished loading');
          };
          frame.src = frame.src;
          return;
        }
      }
      if (svg.nodeName !== 'svg') {
        var target = svg.querySelector('svg');
        if (!target) {
          var qS = '[src*=".svg"]';
          var obj = svg.querySelector('iframe' + qS + ', embed' + qS) || svg.querySelector('object[data*=".svg"]');
          if (obj) {
            SVG2Bitmap(obj, receiver, params);
            return;
          }
          console.error('unable to access the svg node, make sure it has been appended to the document');
          return;
        } else {
          svg = target;
        }
      }
      var xlinkNS = "http://www.w3.org/1999/xlink",
          svgNS = 'http://www.w3.org/2000/svg';
      var clone = svg.cloneNode(true);
      var defs;
      var getDef = function() {
        defs = clone.querySelector('defs') || document.createElementNS(svgNS, 'defs');
        if (!defs.parentNode) {
          clone.insertBefore(defs, clone.firstElementChild);
        }
      };
      var tester = (function() {
        var tCanvas = document.createElement('canvas');
        var tCtx = tCanvas.getContext('2d');
        tCanvas.width = tCanvas.height = 1;
        var isTainted = function(canvas) {
          var tainted = false;
          tCtx.drawImage(canvas, 0, 0);
          try {
            tCanvas.toDataURL();
          } catch (e) {
            tainted = true;
            tCanvas = tCanvas.cloneNode(true);
            tCtx = tCanvas.getContext('2d');
          }
          return tainted;
        };
        var doc = document.implementation.createHTMLDocument('test');
        var base = document.createElement('base');
        doc.head.appendChild(base);
        var anchor = document.createElement('a');
        doc.body.appendChild(anchor);
        var URL = function(url, baseIRI) {
          base.href = baseIRI;
          anchor.href = url;
          return anchor;
        };
        return {
          isTainted: isTainted,
          URL: URL
        };
      })();
      var cleanedNS = false;
      var exportDoc = function() {
        var bbox = frame ? frame.getBoundingClientRect() : svg.getBoundingClientRect();
        if (svg.width.baseVal.unitType !== 1) {
          clone.setAttribute('width', bbox.width);
        }
        if (svg.height.baseVal.unitType !== 1) {
          clone.setAttribute('height', bbox.height);
        }
        var svgData;
        if (typeof ActiveXObject !== 'undefined') {
          var cleanNS = function(el) {
            var attr = Array.prototype.slice.call(el.attributes);
            for (var i = 0; i < attr.length; i++) {
              var name = attr[i].name;
              if (name.indexOf(':') > -1 && name.indexOf('xlink') < 0) {
                el.removeAttribute(name);
              }
            }
          };
          cleanNS(clone);
          var children = clone.querySelectorAll('*');
          for (var i = 0; i < children.length; i++) {
            cleanNS(children[i]);
          }
        }
        clone.removeAttribute('style');
        svgData = (new XMLSerializer()).serializeToString(clone);
        var svgURL = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData);
        var svgImg = new Image();
        var load_handler = function() {
          var canvas = (receiver && receiver.nodeName === 'CANVAS') ? receiver : document.createElement('canvas');
          canvas.originalSVG = frame || svg;
          canvas.width = bbox.width * params.scale;
          canvas.height = bbox.height * params.scale;
          if (!canvas.width || !canvas.height) {
            console.error('The document is not visible and can not be rendered');
            return;
          }
          var ctx = canvas.getContext('2d');
          if (params.backgroundColor) {
            ctx.fillStyle = params.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          var s = params.scale;
          var innerRect = frame ? svg.getBoundingClientRect() : {
            top: 0,
            left: 0
          };
          try {
            ctx.drawImage(this, innerRect.left, innerRect.top, this.width * s || canvas.width, this.height * s || canvas.height);
          } catch (e) {
            setTimeout(load_handler.bind(this), 200);
          }
          if (!receiver) {
            receiver = function(c) {
              var original = frame || svg;
              original.parentNode.replaceChild(c, original);
            };
          }
          if (tester.isTainted(canvas)) {
            console.warn("Your browser has tainted the canvas.");
            if (receiver.nodeName === 'IMG') {
              receiver.parentNode.replaceChild(canvas, receiver);
            } else {
              canvas.setAttribute('style', getSVGStyles(canvas));
              if (receiver !== canvas && receiver.appendChild) {
                receiver.appendChild(canvas);
              } else if (typeof receiver === 'function') {
                receiver(canvas, null);
              }
            }
            return;
          }
          if (receiver.nodeName === 'IMG') {
            receiver.setAttribute('style', getSVGStyles(receiver));
            receiver.src = canvas.toDataURL(params.type, params.quality);
          } else {
            canvas.setAttribute('style', getSVGStyles(canvas));
            if (receiver !== canvas && receiver.appendChild) {
              receiver.appendChild(canvas);
            } else if (typeof receiver === 'function') {
              receiver(canvas, canvas.toDataURL(params.type, params.quality));
            }
          }
        };
        var error_handler = function(e) {
          console.error("Couldn't export svg, please check that the svgElement passed is a valid svg document.");
          return;
        };
        svgImg.onload = load_handler;
        svgImg.onerror = error_handler;
        svgImg.src = svgURL;
      };
      var parseStyles = function() {
        var cssIRIs = [],
            styleSheets = [];
        var i;
        var docStyles = svg.ownerDocument.styleSheets;
        for (i = 0; i < docStyles.length; i++) {
          styleSheets.push(docStyles[i]);
        }
        if (styleSheets.length) {
          getDef();
          svg.matches = svg.matches || svg.webkitMatchesSelector || svg.mozMatchesSelector || svg.msMatchesSelector || svg.oMatchesSelector;
        }
        for (i = 0; i < styleSheets.length; i++) {
          var currentStyle = styleSheets[i];
          var rules;
          try {
            rules = currentStyle.cssRules;
          } catch (e) {
            continue;
          }
          var style = document.createElement('style');
          var l = rules && rules.length;
          for (var j = 0; j < l; j++) {
            var selector = rules[j].selectorText;
            if (!selector) {
              continue;
            }
            selector = selector.replace(/:/g, '\\:');
            var matchesTest;
            try {
              matchesTest = svg.querySelector(selector);
            } catch (e) {
              continue;
            }
            if ((svg.matches && svg.matches(selector)) || matchesTest) {
              var cssText = rules[j].cssText;
              var reg = new RegExp(/url\((.*?)\)/g);
              var matched = [];
              while ((matched = reg.exec(cssText)) !== null) {
                var ext = matched[1].replace(/\"/g, '');
                var href = currentStyle.href || location.href;
                cssIRIs.push([ext, href]);
                var a = tester.URL(ext, href);
                var iri = (href === location.href && ext.indexOf('.svg') < 0) ? a.hash : a.href.substring(a.href.lastIndexOf('/') + 1);
                var newId = '#' + iri.replace(/\//g, '_').replace(/\./g, '_').replace('#', '_');
                cssText = cssText.replace(ext, newId);
              }
              style.innerHTML += cssText + '\n';
            }
          }
          if (style.innerHTML) {
            defs.appendChild(style);
          }
        }
        var s = clone.style;
        s.border = s.padding = s.margin = 0;
        s.transform = 'initial';
        parseXlinks(cssIRIs);
      };
      var getSVGStyles = function(node) {
        var dest = node.cloneNode(true);
        if (!svg.parentNode.documentElement) {
          svg.parentNode.insertBefore(dest, svg);
        } else {
          svg.parentNode.documentElement.appendChild(dest);
        }
        var dest_comp = getComputedStyle(dest);
        var svg_comp = getComputedStyle(frame || svg);
        var mods = "";
        for (var i = 0; i < svg_comp.length; i++) {
          if (svg_comp[i] === 'width' || svg_comp[i] === 'height') {
            continue;
          }
          if (svg_comp[svg_comp[i]] !== dest_comp[svg_comp[i]]) {
            mods += svg_comp[i] + ':' + svg_comp[svg_comp[i]] + ';';
          }
        }
        dest.parentNode.removeChild(dest);
        return mods;
      };
      var parseImages = function() {
        var images = clone.querySelectorAll('image'),
            total = images.length,
            encoded = 0,
            i;
        if (total === 0) {
          exportDoc();
          return;
        }
        var originalImages = [];
        var oImg = svg.querySelectorAll('image');
        for (i = 0; i < images.length; i++) {
          if (oImg[i] && oImg[i].isEqualNode(images[i])) {
            originalImages.push(oImg[i]);
            continue;
          } else {
            var found = null;
            for (var j = 0; j < oImg.length; j++) {
              if (oImg[j].isEqualNode(images[i])) {
                found = oImg[j];
                break;
              }
            }
            originalImages.push(found);
          }
        }
        var preserveAspectRatio = function(source, destination, userString) {
          var srcWidth = source.width,
              srcHeight = source.height,
              destinationW = destination.width,
              destinationH = destination.height;
          var aRMeet = function(args) {
            var srcRatio = (srcHeight / srcWidth),
                destRatio = (destinationH / destinationW),
                resultWidth = destRatio > srcRatio ? destinationW : destinationH / srcRatio,
                resultHeight = destRatio > srcRatio ? destinationW * srcRatio : destinationH;
            var getPos = function(arg, res, dest) {
              var max = Math.max(res, dest),
                  min = Math.min(res, dest);
              switch (arg) {
                case 'Min':
                  return 0;
                case 'Mid':
                  return (max - min) / 2;
                case 'Max':
                  return max - min;
                default:
                  return 'invalid';
              }
            };
            var obj = [returnedImg, 0, 0, srcWidth, srcHeight, getPos(args[0], resultWidth, destinationW), getPos(args[1], resultHeight, destinationH), resultWidth, resultHeight];
            if (obj[5] === 'invalid' || obj[6] === 'invalid') {
              return default_obj;
            }
            return obj;
          };
          var aRSlice = function(args) {
            var resultWidth,
                resultHeight;
            var a = function() {
              resultWidth = destinationW;
              resultHeight = srcHeight * destinationW / srcWidth;
            };
            var b = function() {
              resultWidth = srcWidth * destinationH / srcHeight;
              resultHeight = destinationH;
            };
            if (destinationW > destinationH) {
              a();
              if (destinationH > resultHeight) {
                b();
              }
            } else if (destinationW === destinationH) {
              if (srcWidth > srcHeight) {
                b();
              } else {
                a();
              }
            } else {
              b();
              if (destinationW > resultWidth) {
                a();
              }
            }
            var getPos = function(arg, res, dest, src) {
              switch (arg) {
                case 'Min':
                  return 0;
                case 'Mid':
                  return (res - dest) / 2 * src / res;
                case 'Max':
                  return (res - dest) * src / res;
                default:
                  return 'invalid';
              }
            };
            var x = getPos(args[0], resultWidth, destinationW, srcWidth);
            var y = getPos(args[1], resultHeight, destinationH, srcHeight);
            var obj = [returnedImg, x, y, srcWidth - x, srcHeight - y, 0, 0, resultWidth - (x * (resultWidth / srcWidth)), resultHeight - (y * (resultHeight / srcHeight))];
            if (obj[1] === 'invalid' || obj[2] === 'invalid') {
              return default_obj;
            }
            return obj;
          };
          var returnedImg = source.nodeName === 'IMG' || source.nodeName === 'VIDEO' || source.nodeName === 'CANVAS' ? source : null;
          var default_obj = aRMeet(['Mid', 'Mid']);
          if (!userString) {
            return default_obj;
          } else {
            var args = userString.trim().split(' '),
                minMidMax = args[0].replace('x', '').split('Y');
            switch (args[args.length - 1]) {
              case "meet":
                return aRMeet(minMidMax);
              case "slice":
                return aRSlice(minMidMax);
              default:
                return default_obj;
            }
          }
        };
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var loader = function(url) {
          var img = new Image();
          img.onload = function() {
            if (++encoded === total) {
              exportDoc();
            }
          };
          img.src = url;
        };
        var toDataURL = function(image, original) {
          var img = new Image();
          var error_handler = function() {
            console.warn('failed to load an image at : ', img.src);
            if (!params.keepImageHolder) {
              image.parentNode.removeChild(image);
            }
            if (--total === encoded) {
              exportDoc();
            }
          };
          if (!params.noCORS) {
            img.crossOrigin = 'Anonymous';
          }
          img.onload = function() {
            var attr,
                rect;
            if (original) {
              attr = image.getAttribute('preserveAspectRatio');
              rect = original.getBoundingClientRect();
            }
            if (original && rect && (rect.width * params.scale < this.width || rect.height * params.scale < this.height)) {
              canvas.width = rect.width * params.scale;
              canvas.height = rect.height * params.scale;
              var ar = preserveAspectRatio(this, canvas, attr);
              ctx.drawImage.apply(ctx, ar);
            } else {
              canvas.width = this.width;
              canvas.height = this.height;
              ctx.drawImage(this, 0, 0);
            }
            if (tester.isTainted(canvas)) {
              error_handler();
              return;
            }
            var dataURL = canvas.toDataURL();
            image.setAttributeNS(xlinkNS, 'href', dataURL);
            loader(dataURL);
          };
          img.onerror = function() {
            var oldSrc = this.src;
            this.onerror = error_handler;
            this.removeAttribute('crossorigin');
            this.src = '';
            this.src = oldSrc;
          };
          img.src = image.getAttributeNS(xlinkNS, 'href');
        };
        var parseFromUrl = function(url, element) {
          var xhr = new XMLHttpRequest();
          xhr.onload = function() {
            if (this.status === 200) {
              var response = this.responseText || this.response;
              var dataUrl = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent('<svg' + response.split('<svg')[1]);
              element.setAttributeNS(xlinkNS, 'href', dataUrl);
              loader(dataUrl);
            } else {
              toDataURL(element);
            }
          };
          xhr.onerror = function() {
            toDataURL(element);
          };
          try {
            xhr.open('GET', url);
          } catch (e) {
            toDataURL(element);
            return;
          }
          xhr.send();
        };
        for (i = 0; i < images.length; i++) {
          var href = images[i].getAttributeNS(xlinkNS, 'href');
          if (href && href.indexOf('data:image') < 0) {
            if (href.indexOf('.svg') > 0) {
              parseFromUrl(href, images[i]);
            } else {
              toDataURL(images[i], originalImages[i]);
            }
          } else if (++encoded === total) {
            exportDoc();
            return;
          }
        }
      };
      var parseXlinks = function(css) {
        var i;
        var elemToParse = 0;
        var docsToFetch = 0;
        var current_doc = {
          href: location.href.replace(location.hash, '').replace(/#/g, ''),
          pathname: location.pathname,
          filename: '',
          innerElements: [],
          parsedElements: [],
          doc: svg.ownerDocument,
          base: location.href.replace(location.hash, '').replace(/#/g, '')
        };
        var documents = [current_doc];
        var nsSelector_support = (function() {
          var test = document.createElementNS(svgNS, 'use');
          test.setAttributeNS(xlinkNS, 'href', '#__#');
          clone.appendChild(test);
          var supported = !!clone.querySelector('[*|href*="#"]');
          clone.removeChild(test);
          return supported;
        })();
        var queryXlinks = function(el) {
          return nsSelector_support ? el.querySelectorAll('[*|href*="#"]') : (function() {
            var arr = [];
            var children = el.querySelectorAll('*');
            for (i = 0; i < children.length; i++) {
              var xl_attr = children[i].getAttributeNS(xlinkNS, 'href');
              if (xl_attr && xl_attr.indexOf('#') > -1) {
                arr.push(children[i]);
              }
            }
            return arr;
          })();
        };
        var getURLs = function(el) {
          var url_attrs = ["style", "clip-path", "src", "cursor", "fill", "filter", "marker", "marker-start", "marker-mid", "marker-end", "mask", "stroke"];
          var urlSelector = '[*|' + url_attrs.join('*="url"], *[*|') + '*="url"]';
          var list = el.querySelectorAll(urlSelector);
          return list;
        };
        var getXternalAttributes = function(el, doc) {
          var externals = [];
          var ext_attr = function(ele, type) {
            var that = {};
            that.element = ele;
            that.type = type;
            that.attributes = [];
            that.requestedElements = [];
            that.parentDoc = doc;
            var att;
            if (type === 'xl') {
              att = ele.attributes['xlink:href'];
              if (!att) {
                var href = ele.attributes.href;
                if (href && href.namespaceURI && href.namespaceURI.indexOf('xlink') > -1) {
                  att = href;
                } else {
                  return false;
                }
              }
              that.attributes.push(att);
              that.requestedElements.push(att.value);
            } else {
              att = ele.attributes;
              for (var j = 0; j < att.length; j++) {
                var reg = new RegExp(/url\((.*?)\)/g);
                var matched = [];
                while ((matched = reg.exec(att[j].value)) !== null) {
                  that.attributes.push(att[j]);
                  that.requestedElements.push(matched[1].replace(/"/g, ''));
                }
              }
            }
            return that;
          };
          var xl = queryXlinks(el);
          var url = getURLs(el);
          var i;
          var att;
          for (i = 0; i < xl.length; i++) {
            att = ext_attr(xl[i], 'xl');
            if (!att) {
              continue;
            }
            externals.push(att);
            att = null;
          }
          for (i = 0; i < url.length; i++) {
            att = ext_attr(url[i], 'url');
            if (!att) {
              continue;
            }
            externals.push(att);
            att = null;
          }
          var self_attrs = el.attributes;
          for (i = 0; i < self_attrs.length; i++) {
            var self_attr = self_attrs[i];
            if (self_attr.name === 'xlink:href') {
              externals.push(new ext_attr(el, 'xl'));
            } else {
              var matched = self_attr.value.match(/url\((.*)\)/);
              if (matched && matched.length > 1) {
                externals.push(new ext_attr(el, 'url'));
              }
            }
          }
          return externals;
        };
        var changeImagesHref = function(elem, base) {
          var images = elem.querySelectorAll('image');
          for (var i = 0; i < images.length; i++) {
            var href = images[i].getAttributeNS(xlinkNS, 'href');
            var newHref = tester.URL(href, base).href;
            if (href !== newHref) {
              images[i].setAttributeNS(xlinkNS, 'href', newHref);
            }
          }
        };
        var getInnerElements = function() {
          var i;
          for (i = 0; i < documents.length; i++) {
            var doc = documents[i];
            if (!doc.doc) {
              continue;
            }
            var inners = doc.innerElements;
            if (inners.length === doc.parsedElements.length) {
              continue;
            }
            var j;
            for (j = 0; j < inners.length; j++) {
              var node = doc.doc.getElementById(inners[j]);
              if (!node) {
                console.warn("Couldn't find this element", inners[j]);
                elemToParse--;
                continue;
              }
              var clone = node.cloneNode(true);
              clone.id = doc.filename + '_' + inners[j];
              changeImagesHref(clone, doc.base);
              defs.appendChild(clone);
              parse_attributes(getXternalAttributes(clone, doc));
              doc.parsedElements.push(inners[j]);
              elemToParse--;
            }
          }
          if (!docsToFetch && !elemToParse) {
            parseImages();
          }
        };
        var fetchExternalDoc = function(ext_doc) {
          var url = ext_doc.href;
          var xhr = new XMLHttpRequest();
          xhr.onload = function() {
            if (this.status === 200) {
              var response = this.responseText || this.response;
              if (!response) {
                return;
              }
              try {
                ext_doc.doc = new DOMParser().parseFromString(response, 'text/html');
              } catch (ie) {
                ext_doc.doc = document.implementation.createHTMLDocument(ext_doc.filename);
                ext_doc.doc.body.innerHTML = response;
              }
              ext_doc.base = url;
            } else {
              ext_doc.doc = null;
              elemToParse -= ext_doc.innerElements.length;
              console.warn('could not load this external document :', url, '\n' + 'Those elements are lost : ', ext_doc.innerElements.join(' , '));
            }
            if (!--docsToFetch) {
              getInnerElements();
            }
          };
          xhr.onerror = function(e) {
            ext_doc.doc = null;
            elemToParse -= ext_doc.innerElements.length;
            console.warn('could not load this external document', url);
            console.warn('Those elements are lost : ', ext_doc.innerElements.join(' , '));
            if (!--docsToFetch) {
              getInnerElements();
            }
          };
          xhr.open('GET', url);
          xhr.send();
        };
        var append_doc = function(iri, doc) {
          var a = tester.URL(iri, doc.base);
          var original_filename = a.href.substring(a.href.lastIndexOf('/') + 1).replace(a.hash, '');
          var filename = original_filename.replace(/\./g, '_');
          var hash = a.hash.replace('#', '');
          var href = a.href.replace(a.hash, '');
          var newId = filename + '_' + hash;
          for (var i = 0; i < documents.length; i++) {
            var docI = documents[i];
            if (docI.href === href) {
              if (i === 0) {
                if (clone.getElementById(hash)) {
                  return hash;
                } else {
                  newId = '_' + hash;
                }
              }
              if (docI.innerElements.indexOf(hash) < 0) {
                if (docI.doc !== null) {
                  elemToParse++;
                } else {
                  console.warn('this element is also lost ', hash);
                }
                docI.innerElements.push(hash);
                return newId;
              } else {
                return newId;
              }
            }
          }
          elemToParse++;
          docsToFetch++;
          var that = {
            href: href,
            filename: filename,
            innerElements: [hash],
            parsedElements: []
          };
          documents.push(that);
          fetchExternalDoc(that);
          return newId;
        };
        var parse_attributes = function(external_attributes) {
          if (external_attributes.length && !defs) {
            getDef();
          }
          var i,
              j;
          for (i = 0; i < external_attributes.length; i++) {
            var ext = external_attributes[i];
            for (j = 0; j < ext.requestedElements.length; j++) {
              var requested = ext.requestedElements[j];
              var newId = '#' + append_doc(requested, ext.parentDoc);
              var attr = ext.attributes[j];
              var newValue = attr.value.replace(requested, newId);
              var name = (attr.name.toUpperCase() === attr.name) ? attr.name.toLowerCase() : attr.name;
              ext.element.setAttribute(name, newValue);
            }
          }
        };
        for (i = 0; i < css.length; i++) {
          append_doc(css[i][0], {base: css[i][1]});
        }
        parse_attributes(getXternalAttributes(clone, documents[0]));
        if (!docsToFetch) {
          if (!elemToParse) {
            parseImages();
          } else {
            getInnerElements();
          }
        }
      };
      parseStyles();
    }
  })();
  return _retrieveGlobal();
});

$__System.register("7", ["6", "8", "9", "10", "15", "16", "51", "62", "63", "b", "a"], function (_export) {
    var d3, _Set, _Array$from, _slicedToArray, _createClass, _classCallCheck, _Promise, _Object$entries, _Object$keys, _getIterator, d3tooltip, LabelCollisionDetection, colourBarID;

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

        function legend(g) {
            splitAfter = splitAfter.clamp(0, seriesNames.length);
            if (splitAfter === 0) splitAfter = seriesNames.length;
            var longestName = seriesNames.reduce(function (a, b) {
                return a.length > b.length ? a : b;
            });

            var lengthTestString = g.append("text").attr("visibility", false).text(longestName);
            var box = lengthTestString.node().getBBox();
            box.height = parseInt(window.getComputedStyle(lengthTestString.node()).fontSize, 10);
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

            var itemEnter = item.enter().append("g").attr("class", "legend-item");

            itemEnter.attr("transform", function (d, i) {
                return "translate(" + (legendHorizontalOffset + padding + i % splitAfter * (columnWidth + horizontalItemSpacing)) + ",\n                                            " + (legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)) + ")";
            });

            itemEnter.each(function (d, i) {
                var sel = d3.select(this);

                sel.append("rect").attr("class", "shape").attr("x", 2).attr("y", shapeVerticalOffset).attr("width", shapeSize).attr("height", shapeSize).attr("fill", selectedItems.has(d) ? colourScale(d) : "white").attr("stroke", colourScale(d));

                sel.append("text").attr("x", shapeSize + 5).attr("y", textVerticalOffset).attr("fill", "black").text(d);

                sel.append("rect").attr("class", "legend-item-mouse-capture").attr("x", 0).attr("y", 0).attr("width", columnWidth).attr("height", rowHeight).attr("fill", "white").attr("opacity", 0);
            });

            if (onMouseOver) itemEnter.on("mouseover", onMouseOver);
            if (onMouseOut) itemEnter.on("mouseout", onMouseOut);
            if (onClick) itemEnter.on("click", onClick);
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

    function createPlotControls(root, controls) {
        var activeControls = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        var ICONS = {
            'download': 'fa-camera',
            'select': 'fa-dot-circle-o',
            'zoom': 'fa-arrows',
            'label': 'fa-tag'
        };
        var plotRoot = d3.select(root),
            ctrls = _Object$keys(controls),
            timeoutId = null,
            isVisible = false;

        plotRoot.selectAll("div.plot-control-panel").remove();

        var controlPanel = plotRoot.append("div").attr("class", "plot-control-panel").style("visibility", "hidden");

        controlPanel.selectAll("i").data(ctrls).enter().append("i").attr("class", function (action) {
            return "plot-control fa " + ICONS[action] + " action-" + action;
        });

        plotRoot.select("svg").on("mousemove", function () {
            if (!isVisible) {
                controlPanel.style("visibility", "visible").transition().style("opacity", 1);
                isVisible = true;
            }
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                controlPanel.style("opacity", 0).style("visibility", "hidden");
                isVisible = false;
            }, 2500);
        });

        plotRoot.select("i.action-zoom").classed("active", activeControls.includes("zoom")).on('click', function () {
            var self = d3.select(this);
            var active = self.classed("active");
            controls['zoom'](!active);
            self.classed("active", !active);
            var selectMode = plotRoot.select("i.action-select");
            if (!selectMode.empty() && selectMode.classed("active") && !active) {
                selectMode.classed("active", false);
                controls['select'](false);
            }
        });

        plotRoot.select("i.action-select").classed("active", activeControls.includes("select")).on('click', function () {
            var self = d3.select(this);
            var active = self.classed("active");
            controls['select'](!active);
            self.classed("active", !active);
            var zoomMode = plotRoot.select("i.action-zoom");
            if (!zoomMode.empty() && zoomMode.classed("active") && !active) {
                zoomMode.classed("active", false);
                controls['zoom'](false);
            }
        });

        plotRoot.select("i.action-label").classed("active", activeControls.includes("label")).on('click', function () {
            var self = d3.select(this);
            var active = self.classed("active");
            controls['label'](!active);
            self.classed("active", !active);
        });

        plotRoot.select("i.action-download").on('click', function () {
            var canvas = plotRoot.append("canvas").style("position", "absolute").style("display", "none");

            SVG2Bitmap(plotRoot.select("svg").node(), canvas.node());

            function sleep(time) {
                return new _Promise(function (resolve) {
                    return setTimeout(resolve, time);
                });
            }

            sleep(100).then(function () {
                var imgURI = canvas.node().toDataURL('image/png').replace('image/png', 'image/octet-stream');
                triggerDownload(imgURI);
                canvas.remove();
            });
        });

        function triggerDownload(imgURI) {
            var evt = new MouseEvent('click', {
                view: window,
                bubbles: false,
                cancelable: true
            });

            var a = document.createElement('a');
            a.setAttribute('download', 'plot.png');
            a.setAttribute('href', imgURI);
            a.setAttribute('target', '_blank');

            a.dispatchEvent(evt);
        }
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
                    return types[d.hasOwnProperty("data") ? d.data.type : d.type][attr];
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

    function createTreeLayout(nodes) {
        //let nodes = copyNodesArray(nodesArray);
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

        var xs = [d.bboxCircle.left, d.bboxCircle.right, d.bboxLabel.left, d.bboxLabel.right],
            ys = [d.bboxCircle.top, d.bboxCircle.bottom, d.bboxLabel.top, d.bboxLabel.bottom],
            left = Math.min.apply(Math, xs),
            right = Math.max.apply(Math, xs),
            top = Math.min.apply(Math, ys),
            bottom = Math.max.apply(Math, ys),
            height = bottom - top,
            width = right - left;
        d.bbox = { left: left, right: right, top: top, bottom: bottom, width: width, height: height };
    }

    function resetNodeLabelBBox(d) {
        d.bboxLabel = d.bboxCircle;
        d.bbox = d.bboxCircle;
    }

    function drawColourBar(selection, domain, heatmapOptions, defs, defsRoutePath) {

        selection.selectAll("*").remove();

        var width = heatmapOptions.colourBar.width,
            height = heatmapOptions.colourBar.height,
            colourScale = heatmapOptions.colourScale,
            opacity = heatmapOptions.opacity,
            title = heatmapOptions.title,
            titleOffset = title ? 22 : 0;

        var gradient = defs.append("svg:linearGradient").attr("id", "gradient" + colourBarID).attr("x1", "0%").attr("y1", height > width ? "100%" : "0%").attr("x2", height > width ? "0%" : "100%").attr("y2", "0%").attr("spreadMethod", "pad");

        gradient.append("svg:stop").attr("offset", "0%").attr("stop-color", colourScale[0][1]).attr("stop-opacity", 1);

        gradient.append("svg:stop").attr("offset", "100%").attr("stop-color", colourScale[1][1]).attr("stop-opacity", 1);

        selection.append("rect").attr("x", titleOffset).attr("y", 0).attr("width", width).attr("height", height).style("fill", "url(" + defsRoutePath + "#gradient" + colourBarID++ + ")").attr("stroke-width", 2).attr("stroke", "grey").style("opacity", opacity);

        if (title) {
            selection.append("text").attr("class", "axis-title").attr("transform", "rotate(-90)").attr("dy", 12).attr("x", -(height / 2)).style("text-anchor", "middle").text(title);
        }

        // Define x axis and grid
        var colourAxis = d3.axisRight().scale(d3.scaleLinear().domain(domain).range([height, 0]));

        selection.append("g").attr("class", "axis").attr("transform", "translate(" + (width + titleOffset) + ", 0)").call(colourAxis);
    }

    function calcColourBarSize(size, relativeSize) {
        if (typeof size === 'string' || size instanceof String) {
            if (size === "auto") return relativeSize;else if (size[size.length - 1] === "%") return relativeSize * parseInt(size) / 100;else return relativeSize;
        } else return size;
    }

    function testLabelLength(svg, name, _attrs) {
        var label = svg.append("text").text(name);
        multiAttr.call(label, _attrs);
        var length = label.node().getBoundingClientRect().width;
        label.remove();
        return length;
    }

    function getExtraSpaceForLabel(scale, labelLength) {
        var d = scale.domain(),
            dd = d[1] - d[0],
            r = scale.range(),
            dr = r[1] - r[0];
        return labelLength * dd / (dr - 2 * labelLength);
    }

    function multiAttr(attrs) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _getIterator(_Object$entries(attrs)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _step4$value = _slicedToArray(_step4.value, 2);

                var attr = _step4$value[0];
                var value = _step4$value[1];

                this.attr(attr, value);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                    _iterator4["return"]();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        return this;
    }

    function getTranslation(transform) {
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttributeNS(null, "transform", transform);
        var matrix = g.transform.baseVal.consolidate().matrix;
        return [matrix.e, matrix.f];
    }

    return {
        setters: [function (_8) {
            d3 = _8;
        }, function (_4) {
            _Set = _4["default"];
        }, function (_6) {
            _Array$from = _6["default"];
        }, function (_3) {
            _slicedToArray = _3["default"];
        }, function (_) {
            _createClass = _["default"];
        }, function (_2) {
            _classCallCheck = _2["default"];
        }, function (_5) {
            _Promise = _5["default"];
        }, function (_7) {
            _Object$entries = _7["default"];
        }, function (_9) {}, function (_b) {
            _Object$keys = _b["default"];
        }, function (_a) {
            _getIterator = _a["default"];
        }],
        execute: function () {
            "use strict";

            _export("d3legend", d3legend);

            _export("createPlotControls", createPlotControls);

            _export("mergeTemplateLayout", mergeTemplateLayout);

            _export("createNodeTypes", createNodeTypes);

            _export("createDynamicNodeAttr", createDynamicNodeAttr);

            _export("scaleProperties", scaleProperties);

            _export("createTreeLayout", createTreeLayout);

            _export("copyNodesArray", copyNodesArray);

            _export("spreadGenerations", spreadGenerations);

            _export("roundOffFix", roundOffFix);

            _export("getNodeLabelBBox", getNodeLabelBBox);

            _export("resetNodeLabelBBox", resetNodeLabelBBox);

            _export("drawColourBar", drawColourBar);

            _export("calcColourBarSize", calcColourBarSize);

            _export("testLabelLength", testLabelLength);

            _export("getExtraSpaceForLabel", getExtraSpaceForLabel);

            _export("multiAttr", multiAttr);

            _export("getTranslation", getTranslation);

            d3tooltip = (function () {
                function d3tooltip(g) {
                    _classCallCheck(this, d3tooltip);

                    this.tip = g.append("div").attr("class", "ancestry-tooltip");
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

            LabelCollisionDetection = (function () {
                function LabelCollisionDetection(nodes, labelPositions, labelLayout, width, height, searchRadius) {
                    _classCallCheck(this, LabelCollisionDetection);

                    this.width = width;
                    this.height = height;
                    this.nodes = nodes;
                    this.nodesData = nodes.data();
                    this.labelPositions = labelPositions;
                    this.labelLayout = labelLayout;
                    this.searchRadius = searchRadius;
                    this.quadtree = d3.quadtree().extent([[-1, -1], [this.width + 1, this.height + 1]]);
                }

                _createClass(LabelCollisionDetection, [{
                    key: "createQuadTree",
                    value: function createQuadTree(nodes, t /*transform*/) {
                        this.quadtree.removeAll(this.nodesData).x(function (d) {
                            return d.x * t.k + t.x;
                        }).y(function (d) {
                            return d.y * t.k + t.y;
                        }).addAll(nodes);
                    }
                }, {
                    key: "quadtreeSearchWithTransform",
                    value: function quadtreeSearchWithTransform(point) {
                        var _this = this;

                        var _ref = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0, k: 1 } : arguments[1];

                        var tx = _ref.x;
                        var ty = _ref.y;
                        var k = _ref.k;

                        var foundNodes = [],
                            rx = this.searchRadius.x,
                            ry = this.searchRadius.y,
                            r = Math.sqrt(rx * rx + ry * ry),
                            px = point.x * k + tx,
                            py = point.y * k + ty,
                            x0 = px - rx,
                            y0 = py - ry,
                            x3 = px + rx,
                            y3 = py + ry;

                        this.quadtree.visit(function (node, x1, y1, x2, y2) {
                            var outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                            if (outside) return true;
                            var p = node.data;
                            if (p) {
                                if (_this.dist(px, py, p.x * k + tx, p.y * k + ty) <= r && p != point) foundNodes.push(p);
                            }
                            return false;
                        });

                        return foundNodes.sort(function (a, b) {
                            return b.x - a.x;
                        });
                    }
                }, {
                    key: "dist",
                    value: function dist(x1, y1, x2, y2) {
                        var dx = x2 - x1,
                            dy = y2 - y1;
                        return Math.pow(dx * dx + dy * dy, 0.5);
                    }
                }, {
                    key: "recalculateLabelPositions",
                    value: function recalculateLabelPositions(labels) {
                        var _this2 = this;

                        var transform = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0, k: 1 } : arguments[1];

                        // remove all labels' bounding boxes
                        labels.each(resetNodeLabelBBox);
                        // find only the labels that are in the display to reduce computing time and sort them to promote right-size orientation
                        var filteredLabels = this.nodes.filter(function (d) {
                            var dx = d.x * transform.k + transform.x,
                                dy = d.y * transform.k + transform.y;
                            return dx >= -10 && dx <= _this2.width + 10 && dy >= -10 && dy <= _this2.height + 10;
                        }).selectAll('text.node-label').sort(function (a, b) {
                            return b.x - a.x;
                        });
                        // generate a new quad tree
                        this.createQuadTree(filteredLabels.data(), transform);

                        var self = this,
                            N = self.labelPositions.length;
                        // prevent label overlapping
                        filteredLabels.each(function (d) {
                            var i = 0,
                                collision = false,
                                sel = d3.select(this);

                            var neighbours = self.quadtreeSearchWithTransform(d, transform);

                            do {
                                // set next position from the position's list
                                d.labelPos = self.labelPositions[i++];
                                // apply the new position to DOM element
                                multiAttr.call(sel, scaleProperties(d.labelPos, transform.k));
                                // recalculate label and node's new bounding boxes
                                sel.each(getNodeLabelBBox);
                                // check if the label collides with its neighbours
                                collision = self.isColliding(d, neighbours);
                            } while (collision && i < N);

                            if (collision) {
                                // reset bounding boxes if no non-colliding postions were found
                                resetNodeLabelBBox(d);
                            }
                            // hide label if it collides
                            sel.style("opacity", collision ? 1e-6 : 1);
                            d.isColliding = collision;
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

                return LabelCollisionDetection;
            })();

            _export("LabelCollisionDetection", LabelCollisionDetection);

            colourBarID = 0;
        }
    };
});
$__System.register('64', ['4', '5', '6', '7', '8', '9', '10', '11', 'b', 'a'], function (_export) {
    var angular, d3, d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, roundOffFix, LabelCollisionDetection, scaleProperties, getNodeLabelBBox, calcColourBarSize, drawColourBar, testLabelLength, getExtraSpaceForLabel, multiAttr, getTranslation, createPlotControls, _Set, _Array$from, _slicedToArray, _Object$keys, _getIterator, layoutTemplate, labelPositions;

    function LineageScatterPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-lineage-scatter-plot");

                var defaultTimeFormat = "%d %b %y",
                    defaultScalarFormat = "g";

                var svg = d3.select(element[0]).style("position", "relative").append("svg").style('width', '100%');

                var //links,
                mouseStart = undefined,
                    colours = d3.scaleOrdinal(d3.schemeCategory10),
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
                    var longestNodeName = nodesData.length ? nodesData.reduce(function (a, b) {
                        return a.name.length > b.name.length ? a : b;
                    }).name : "";
                    var layout = mergeTemplateLayout(copy.layout, layoutTemplate);
                    var pathname = $window.location.pathname;
                    var maxLabelLength = testLabelLength(svg, longestNodeName, { "font-size": 12 });
                    var maxLabelOffset = d3.max(labelPositions, function (pos) {
                        return Math.abs(pos.x);
                    });
                    var legendHeight = 0;var legendWidth = 0;var colourbarHeight = 0;var colourbarWidth = 0;
                    var colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0;
                    var legendOut = { top: false, right: false, bottom: false, left: false };
                    var lcdEnabled = layout.labelCollisionDetection.enabled != "never";
                    var lastTransform = d3.zoomIdentity;
                    var showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null;
                    var colourBarOrigWidth = layout.heatmap.colourBar.width;var colourBarOrigHeight = layout.heatmap.colourBar.height;
                    var colourbar = d3.select();
                    var legend = d3.select();
                    var xAxisLabelSVG = d3.select();
                    var yAxisLabelSVG = d3.select();
                    var titleSVG = d3.select();

                    if (layout.legend.show) {
                        if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                        if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                    }

                    if (maxLabelLength < 40) maxLabelLength = 40;

                    var margin = layout.margin,
                        width = layout.width || elementWidth,
                        height = layout.height;

                    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", "white");

                    if (layout.title) margin.top += legendOut.top ? 26 : 25;
                    if (layout.xAxis.title) margin.bottom += legendOut.bottom ? 15 : 18;
                    if (layout.yAxis.title) margin.left += 21;

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

                        heatmapColourScale = d3.scaleLinear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                            var bbox = colourbar.node().getBoundingClientRect(),
                                pos = layout.heatmap.colourBar.position;
                            colourbarWidth = bbox.width;
                            colourbarHeight = bbox.height;
                            if (pos === "right" || pos === "left") margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                            //else if (pos === "top" || pos === "bottom")
                            //    margin.top += colourbarHeight;
                        }
                    }

                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? legendHeight - 8 : legendOut.top ? legendHeight - 11 : legendHeight;
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

                    //// add margins to horizontal axis data
                    //if (isTimePlot) {
                    //    xExtent[0] = new Date(xExtent[0].getTime() - xMargin);
                    //    xExtent[1] = new Date(xExtent[1].getTime() + xMargin);
                    //} else {
                    //    if (xMargin == 0) xMargin = 0.5;
                    //    if (yMargin == 0) yMargin = 0.5;
                    //    xExtent[0] -= xMargin; xExtent[1] += xMargin;
                    //}

                    // add margins to vertical axis data
                    yExtent[0] -= yMargin;yExtent[1] += yMargin;

                    height = layout.height - margin.top - margin.bottom;

                    // define x scale
                    var xScale = d3.scaleLinear() //(isTimePlot ? d3.time.scale() : d3.scaleLinear())
                    .domain(xExtent).range([0, width]);

                    // define x axis
                    var xAxis = d3.axisBottom().scale(xScale).tickSizeInner(0).tickSizeOuter(0).tickFormat(xAxisFormat);

                    // define y scale
                    var yScale = d3.scaleLinear().domain(yExtent).range([height, 0]);

                    // define y axis
                    var yAxis = d3.axisLeft().scale(yScale).tickSizeInner(0).tickSizeOuter(0).tickFormat(yAxisFormat);

                    // read x and y axes labels
                    var xAxisLabel = layout.xAxis.title;
                    var yAxisLabel = layout.yAxis.title;

                    var mouseCaptureGroup = chart.append("g");

                    // render x axis
                    var xAxisSVG = chart.append("g").attr("class", "axis x-axis").call(xAxis);

                    // rotate tick labels if time plot
                    if (isTimePlot) {
                        xAxisSVG.selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
                    }

                    // render x axis label if exists
                    var xAxisOffset = chart.selectAll("g.x-axis").node().getBBox().height;
                    margin.bottom += xAxisOffset - 3;
                    height = layout.height - margin.top - margin.bottom;

                    if (xAxisLabel) {
                        xAxisLabelSVG = chart.append("text") // text label for the x axis
                        .attr("class", "axis-title").style("text-anchor", "middle").text(xAxisLabel);
                    }

                    // render y axis
                    var yAxisSVG = chart.append("g").attr("class", "axis y-axis").call(yAxis);

                    svg.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
                    svg.selectAll("path.domain").attr("stroke", "grey");
                    svg.selectAll("path.domain").style("shape-rendering", "crispEdges");

                    var yAxisOffset = chart.selectAll("g.y-axis").node().getBBox().width;
                    margin.left += yAxisOffset;
                    width = (layout.width || elementWidth) - margin.right - margin.left;
                    //yAxisLabelSVG.attr("y", yAxisOffset - 25);
                    xAxisLabelSVG.attr("transform", 'translate(' + width / 2 + ', ' + (height + xAxisOffset + 15) + ')');

                    // define node link function
                    var nodeLink = d3.line().x(function (node) {
                        return xScale(node.x);
                    }).y(function (node) {
                        return yScale(node.y);
                    });

                    colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            xOffset = anchor.x === "outside" ? -yAxisOffset - (layout.yAxis.title ? 25 : 0) : 1,
                            yOffset = 15 + (layout.xAxis.title ? 15 : 0),
                            posX = pos.x === "left" ? xOffset : pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? 0 : pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? yOffset : 0) : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", legendOut.top ? -legendHeight : -10).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                    yScale.range([height, 0]);
                    xScale.range([0, width]);

                    var labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
                        currentDomain = xScale.domain();

                    if (labelExtraSpace > 0) {
                        xScale.domain([currentDomain[0] - labelExtraSpace, currentDomain[1] + labelExtraSpace]);
                    }

                    var xScale0 = xScale.copy(),
                        yScale0 = yScale.copy();

                    xAxis.tickSizeInner(-height);
                    yAxis.tickSizeInner(-width);

                    xAxisSVG.attr("transform", 'translate(0, ' + height + ')').call(xAxis);
                    yAxisSVG.call(yAxis);

                    // render y axis label if exists
                    if (yAxisLabel) {
                        yAxisLabelSVG = chart.append("text") // text label for the y axis
                        .attr("class", "axis-title").attr("transform", "rotate(-90)").attr("y", -yAxisOffset - 10).attr("x", -(height / 2)).style("text-anchor", "middle").text(yAxisLabel);
                    }

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    // render chart area
                    chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

                    // define arrowhead
                    var marker = defs.append("marker"),
                        markerAttrs = {
                        "id": "marker-arrowhead",
                        "viewBox": "0 -5 10 10",
                        "refX": 15,
                        "refY": 0,
                        "markerWidth": 8,
                        "markerHeight": 8,
                        "orient": "auto"
                    };

                    multiAttr.call(marker, markerAttrs);

                    marker.append("path").attr("d", "M0,-4L10,0L0,4").attr("fill", layout.link.stroke).attr("class", "arrowHead");

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

                    var link = plotArea.selectAll(".link").data(links).enter().append("svg:path").attr("stroke-dasharray", "3, 3").attr("d", function (conn) {
                        return nodeLink(conn);
                    }).attr("class", "link").attr("marker-end", 'url(' + pathname + '#marker-arrowhead)');

                    multiAttr.call(link, layout.link);

                    // create node groups
                    var node = plotArea.selectAll("g.node").data(nodesData.map(function (d) {
                        return { data: d };
                    })).enter().append("g").attr("class", "node").each(function (d) {
                        d.x = xScale(d.data.x);
                        d.y = yScale(d.data.y);
                    }).attr("transform", function (node) {
                        return 'translate(' + node.x + ', ' + node.y + ')';
                    });

                    //render node circles
                    var circle = node.append("circle").style("stroke", function (d) {
                        return colours(d.data.series);
                    }).style("fill", function (d) {
                        return !selectedNodes.has(d.data.name) ? '#FFF' : colours(d.data.series);
                    }).each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    }).on("mouseover", function (d) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.data.series) + '"></div>' + ('<span class="tooltip-text">' + d.data.name + '</span>') + ('<span class="tooltip-text">x: ' + d.data.x.toPrecision(3) + '</span>') + ('<span class="tooltip-text">y: ' + d.data.y.toPrecision(3) + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    multiAttr.call(circle, nodeAttr);

                    // render node labels
                    var label = node.append("text").attr("dy", ".35em").attr("class", "node-label").text(function (node) {
                        return node.data.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    multiAttr.call(label, layout.nodeLabel);
                    multiAttr.call(label, initialLabelPosition);

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.width;
                    })),
                        maxNodeLabelHeight = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.height;
                    })),
                        searchRadius = { x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight };

                    if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                        LCD = new LabelCollisionDetection(node, labelPositions, layout.nodeLabel, width, height, searchRadius);
                        LCD.recalculateLabelPositions(label, d3.zoomIdentity);
                    }

                    legend.each(function () {
                        this.parentNode.appendChild(this);
                    });
                    titleSVG.each(function () {
                        this.parentNode.appendChild(this);
                    });

                    if (layout.groupSelection.enabled) {
                        selectionRect = mouseCaptureGroup.append("rect").attr("class", "selection-rect");

                        multiAttr.call(selectionRect, layout.groupSelection.selectionRectangle);
                    }

                    function mouseDown() {
                        d3.event.preventDefault();
                        mouseStart = d3.mouse(mouseRect.node());
                        mouseRect.on("mousemove", mouseMove).on("mouseup", finalizeSelection).on("mouseout", finalizeSelection);
                        circle.style("pointer-events", "none");
                    }

                    function finalizeSelection() {
                        selectionRect.attr("width", 0);
                        updateSelection();
                        circle.style("pointer-events", "all");
                        mouseRect.on("mousemove", null).on("mouseup", null).on("mouseout", null);
                    }

                    function click(d) {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", function (d) {
                                return colours(d.data.series);
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseMove() {
                        var p = d3.mouse(mouseRect.node());
                        var d = {
                            x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                            y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                        multiAttr.call(selectionRect, d);
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

                            var _getTranslation = getTranslation(n.attr("transform"));

                            var _getTranslation2 = _slicedToArray(_getTranslation, 2);

                            var tx = _getTranslation2[0];
                            var ty = _getTranslation2[1];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle").style("fill", function (d) {
                                    return colours(d.data.series);
                                });
                                any = true;
                            } else if (!selectedNodes.has(d.data.name)) {
                                n.classed("selected", false);
                                n.select("circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var wasChange = false;

                        svg.selectAll("g.node.selected").each(function (d) {
                            if (!selectedNodes.has(d.data.name)) {
                                selectedNodes.add(d.data.name);
                                wasChange = true;
                            }
                        });

                        svg.selectAll("g.node:not(.selected)").each(function (d) {
                            if (selectedNodes.has(d.data.name)) {
                                selectedNodes['delete'](d.data.name);
                                wasChange = true;
                            }
                        });

                        if (wasChange && scope.selected) {
                            scope.selectedNodes = _Array$from(selectedNodes);
                            scope.$apply();
                        }
                    }

                    var zoom = d3.zoom().scaleExtent([1, layout.maxZoom]).extent([[0, 0], [width, height]]).translateExtent([[0, 0], [width, height]]).on("zoom", onZoom);

                    function onZoom() {
                        applyZoom(d3.event.transform);
                        if (lcdEnabled) {
                            applyLCD(d3.event.transform);
                        }
                        lastTransform = d3.event.transform;
                    }

                    function applyZoom(zoomTransform) {
                        var scale = zoomTransform.k;
                        plotArea.attr("transform", zoomTransform);
                        mouseCaptureGroup.attr("transform", zoomTransform);
                        xAxisSVG.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
                        yAxisSVG.call(yAxis.scale(zoomTransform.rescaleY(yScale)));

                        svg.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
                        svg.selectAll("path.domain").attr("stroke", "grey");
                        svg.selectAll("path.domain").style("shape-rendering", "crispEdges");

                        multiAttr.call(circle, scaleProperties(nodeAttr, scale, true));

                        circle.attr("stroke", function (d) {
                            return colours(d.data.series);
                        }).each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });

                        if (layout.heatmap.enabled) {
                            multiAttr.call(heatmapCircle, scaleProperties(layout.heatmap.circle, scale));
                        }
                        multiAttr.call(svg.selectAll("path.link"), scaleProperties(layout.link, scale));
                        label.each(function (d) {
                            var self = d3.select(this);
                            multiAttr.call(self, scaleProperties(layout.nodeLabel, scale));
                            multiAttr.call(self, scaleProperties(d.labelPos, scale));
                        });

                        if (layout.groupSelection.enabled) {
                            multiAttr.call(selectionRect, scaleProperties(layout.groupSelection.selectionRectangle, scale));
                        }
                    }

                    function onDoubleClick() {
                        var I = d3.zoomIdentity;
                        chart.call(zoom.transform, I);
                        applyZoom(I);
                        if (lcdEnabled) {
                            applyLCD(I);
                        }
                        lastTransform = I;
                    }

                    function applyLCD(transform) {
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, transform);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, transform);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = performance.now();
                        }
                    }

                    var controls = {
                        'download': function download() {},
                        'zoom': toggleZoom,
                        'select': toggleSelect,
                        'label': toggleLabels
                    };
                    var activeControls = [];
                    if (layout.showLabel) activeControls.push("label");

                    createPlotControls(element[0], controls, activeControls);

                    function toggleZoom(toggle) {
                        if (toggle) {
                            chart.call(zoom).on('dblclick.zoom', onDoubleClick);
                        } else {
                            chart.on("wheel.zoom", null).on("mousedown.zoom", null).on("dblclick.zoom", null).on("touchstart.zoom", null).on("touchmove.zoom", null).on("touchend.zoom", null).on("touchcancel.zoom", null);
                        }
                    }

                    function toggleSelect(toggle) {
                        mouseRect.on("mousedown", toggle ? mouseDown : null);
                        circle.on("click", toggle ? click : null);
                    }

                    function toggleLabels(toggle) {
                        label.style("opacity", function (d) {
                            return toggle && !d.isColliding ? 1 : 1e-6;
                        });
                        if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                            lcdEnabled = !lcdEnabled;
                            if (lcdEnabled) {
                                LCD.recalculateLabelPositions(label, lastTransform);
                            }
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
        setters: [function (_5) {}, function (_6) {
            angular = _6['default'];
        }, function (_7) {
            d3 = _7;
        }, function (_8) {
            d3legend = _8.d3legend;
            d3tooltip = _8.d3tooltip;
            mergeTemplateLayout = _8.mergeTemplateLayout;
            createNodeTypes = _8.createNodeTypes;
            createDynamicNodeAttr = _8.createDynamicNodeAttr;
            roundOffFix = _8.roundOffFix;
            LabelCollisionDetection = _8.LabelCollisionDetection;
            scaleProperties = _8.scaleProperties;
            getNodeLabelBBox = _8.getNodeLabelBBox;
            calcColourBarSize = _8.calcColourBarSize;
            drawColourBar = _8.drawColourBar;
            testLabelLength = _8.testLabelLength;
            getExtraSpaceForLabel = _8.getExtraSpaceForLabel;
            multiAttr = _8.multiAttr;
            getTranslation = _8.getTranslation;
            createPlotControls = _8.createPlotControls;
        }, function (_2) {
            _Set = _2['default'];
        }, function (_3) {
            _Array$from = _3['default'];
        }, function (_) {
            _slicedToArray = _['default'];
        }, function (_4) {}, function (_b) {
            _Object$keys = _b['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: null,
                width: null,
                height: 600,
                margin: {
                    right: 10,
                    left: 10,
                    top: 10,
                    bottom: 10
                },
                xAxis: {
                    title: null,
                    format: null
                },
                yAxis: {
                    title: null,
                    format: null
                },
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                showLabel: true,
                labelCollisionDetection: {
                    enabled: "never",
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
                    title: null,
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

            _export('default', angular.module('ancestry.lineage-scatter', ['ancestry.utils']).directive('lineageScatterPlot', LineageScatterPlotDirective));
        }
    };
});
$__System.registerDynamic("65", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.registerDynamic("66", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.registerDynamic("67", ["66"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('66');
  global.define = __define;
  return module.exports;
});

$__System.register('1', ['3', '5', '64', '65', '67', 'd', 'f'], function (_export) {
    'use strict';

    var angular;
    return {
        setters: [function (_2) {}, function (_) {
            angular = _['default'];
        }, function (_3) {}, function (_4) {}, function (_5) {}, function (_d) {}, function (_f) {}],
        execute: function () {
            _export('default', angular.module('ancestry', ['ancestry.lineage', 'ancestry.radial-lineage', 'ancestry.radial-phylogenetic-tree', 'ancestry.lineage-scatter']));
        }
    };
});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define(["angular","d3","process"], factory);
  else
    factory();
});
//# sourceMappingURL=ancestry.js.map