/*
 * ********************************************************************************************************************
 *  Backendless SDK for JavaScript. Version: 4.0.10
 *
 *  Copyright 2012-2017 BACKENDLESS.COM. All Rights Reserved.
 *
 *  NOTICE: All information contained herein is, and remains the property of Backendless.com and its suppliers,
 *  if any. The intellectual and technical concepts contained herein are proprietary to Backendless.com and its
 *  suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret
 *  or copyright law. Dissemination of this information or reproduction of this material is strictly forbidden
 *  unless prior written permission is obtained from Backendless.com.
 * ********************************************************************************************************************
 */
(function(factory) {
    var root = (typeof self === 'object' && self.self === self && self) ||
      (typeof global === 'object' && global.global === global && global);
  
    if (typeof define === "function" && define.amd) {
      define([], function() {
        return root.Backendless = factory(root);
      });
  
    } else if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = root.Backendless = factory(root);
    } else {
      root.Backendless = factory(root);
    }
  
  })(function(root) {
    'use strict';
  
    var DEVICE = null;
  
    var isBrowser = (new Function("try {return this===window;}catch(e){ return false;}"))();
  
    var WebSocket = null; // isBrowser ? window.WebSocket || window.MozWebSocket : {};
    var UIState = null;
  
    var localStorageName = 'localStorage';
  
    var previousBackendless = root.Backendless;
  
    var Backendless = {},
        emptyFn     = (function() {
        });
  
    Backendless.serverURL = 'https://api.backendless.com';
  
    Backendless.noConflict = function() {
      root.Backendless = previousBackendless;
      return this;
    };
  
    Backendless.XMLHttpRequest = typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest;
  
    var browser = (function() {
      var ua = 'NodeJS';
  
      if (isBrowser) {
        ua = navigator.userAgent ? navigator.userAgent.toLowerCase() : 'hybrid-app';
      }
  
      var match   = (/(chrome)[ \/]([\w.]+)/.exec(ua) ||
          /(webkit)[ \/]([\w.]+)/.exec(ua) ||
          /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
          /(msie) ([\w.]+)/.exec(ua) ||
          ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || []),
          matched = {
            browser: match[1] || '',
            version: match[2] || '0'
          },
          browser = {};
      if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
      }
  
      return browser;
    })();
  
    var getNow = function() {
      return new Date().getTime();
    };
  
    Backendless.browser = browser;
  
    var Utils = {
      isObject  : function(obj) {
        return obj === Object(obj);
      },
      isString  : function(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1) === 'String';
      },
      isNumber  : function(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1) === 'Number';
      },
      isFunction: function(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1) === 'Function';
      },
      isBoolean : function(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1) === 'Boolean';
      },
      isDate    : function(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1) === 'Date';
      }
    };
  
    Utils.isArray = (Array.isArray || function(obj) {
      return Object.prototype.toString.call(obj).slice(8, -1) === 'Array';
    });
  
    /**
     * @param {*} value
     * @returns {Array}
     */
    Utils.castArray = function(value) {
      if (Utils.isArray(value)) {
        return value;
      }
  
      return [value];
    };
  
    Utils.addEvent = function(evnt, elem, func) {
      if (elem.addEventListener) {
        elem.addEventListener(evnt, func, false);
      }
      else if (elem.attachEvent) {
        elem.attachEvent("on" + evnt, func);
      }
      else {
        elem[evnt] = func;
      }
    };
  
    Utils.isEmpty = function(obj) {
      if (obj == null) {
        return true;
      }
  
      if (Utils.isArray(obj) || Utils.isString(obj)) {
        return obj.length === 0;
      }
  
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
          return false;
        }
      }
  
      return true;
    };
  
    Utils.removeEvent = function(evnt, elem) {
      if (elem.removeEventListener) {
        elem.removeEventListener(evnt, null, false);
      } else if (elem.detachEvent) {
        elem.detachEvent("on" + evnt, null);
      } else {
        elem[evnt] = null;
      }
    };
  
    Utils.stringToBiteArray = function(str) {
      var data = new ArrayBuffer(str.length);
      var ui8a = new Uint8Array(data, 0);
      for (var i = 0; i < str.length; i++) {
        ui8a[i] = (str.charCodeAt(i) & 0xff);
      }
  
      return ui8a;
    };
  
    Utils.onHttpRequestErrorHandler = function(xhr, errorHandler, responseParser) {
      return function() {
        var errorMessage = 'Unable to connect to the network';
  
        //this part is needed for those implementations of XMLHttpRequest
        //which call the onerror handler on an any bad request
        if (xhr.status >= 400) {
          errorMessage = responseParser(xhr);
        }
  
        errorHandler(errorMessage);
      };
    };
  
    /**
     * Create http query string
     * @param params {Object} - map of params
     * @returns {string}
     */
    Utils.toQueryParams = function(params) {
      var result = [];
  
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          result.push(key + '=' + encodeURIComponent(params[key]));
        }
      }
  
      return result.join('&');
    };
  
    /**
     * @returns {string}
     */
    Utils.toUri = function() {
      var uri = '';
      var arg;
  
      for (var i = 0; i < arguments.length; i++) {
        arg = arguments[i];
  
        if (!arg) {
          continue;
        }
  
        if (Utils.isArray(arg)) {
          uri += this.toUri.apply(this, arg);
        } else if (Utils.isString(arg)) {
          uri += '/';
          uri += encodeURIComponent(arg);
        }
      }
  
      return uri;
    };
  
    /**
     * Parse JSON if it possible if not returns the input parameter
     * @param s
     * @returns {*}
     */
  
    Utils.tryParseJSON = function(s) {
      try {
        return typeof s === 'string' ? JSON.parse(s) : s;
      } catch (e) {
        return s;
      }
    };
  
    /**
     * Returns the class name of instance
     * @param obj
     * @returns {string}
     */
  
    Utils.getClassName = function(obj) {
      if (obj.prototype && obj.prototype.___class) {
        return obj.prototype.___class;
      }
  
      if (Utils.isFunction(obj) && obj.name) {
        return obj.name;
      }
  
      var instStringified = (Utils.isFunction(obj) ? obj.toString() : obj.constructor.toString()),
          results         = instStringified.match(/function\s+(\w+)/);
  
      return (results && results.length > 1) ? results[1] : '';
    };
  
    /**
     * Transform array to encoded string
     * @param arr
     * @returns {string}
     */
    Utils.encodeArrayToUriComponent = function(arr) {
      var props = [], i, len;
      for (i = 0, len = arr.length; i < len; ++i) {
        props.push(encodeURIComponent(arr[i]));
      }
  
      return props.join(',');
    };
  
    /**
     *
     * @param obj
     * @returns {*}
     */
    Utils.classWrapper = function(obj) {
      var wrapper = function(obj) {
        var wrapperName = null,
            Wrapper     = null;
  
        for (var property in obj) {
          if (obj.hasOwnProperty(property)) {
            if (property === "___class") {
              wrapperName = obj[property];
              break;
            }
          }
        }
  
        if (wrapperName) {
          try {
            Wrapper = eval(wrapperName);
            obj = Utils.deepExtend(new Wrapper(), obj);
          } catch (e) {
          }
        }
  
        return obj;
      };
  
      if (Utils.isObject(obj) && obj != null) {
        if (Utils.isArray(obj)) {
          for (var i = obj.length; i--;) {
            obj[i] = wrapper(obj[i]);
          }
        } else {
          obj = wrapper(obj);
        }
      }
  
      return obj;
    };
  
    /**
     *
     * @param destination
     * @param source
     * @returns {*}
     */
  
    Utils.deepExtend = function(destination, source) {
      for (var property in source) {
        if (source[property] !== undefined && source.hasOwnProperty(property)) {
          destination[property] = destination[property] || {};
          destination[property] = Utils.classWrapper(source[property]);
          if (destination[property] && destination[property].hasOwnProperty(property) && destination[property][property] && destination[property][property].hasOwnProperty("__originSubID")) {
            destination[property][property] = Utils.classWrapper(destination[property]);
          }
        }
      }
  
      return destination;
    };
  
    /**
     *
     * @param obj
     * @returns {Object/Array}
     */
  
    Utils.cloneObject = function(obj) {
      return Utils.isArray(obj) ? obj.slice() : Utils.deepExtend({}, obj);
    };
  
    /**
     * extracts Async object from arguments
     * @param args
     * @returns {*}
     */
  
    Utils.extractResponder = function(args) {
      var i, len;
      for (i = 0, len = args.length; i < len; ++i) {
        if (args[i] instanceof Async) {
          return args[i];
        }
      }
  
      return null;
    };
  
    /**
     * wrap Async chandlers to apply custom parse logic
     * @param async
     * @param parser
     * @param context
     * @returns {Async}
     */
  
    Utils.wrapAsync = function(async, parser, context) {
      var success = function(data) {
        if (parser) {
          data = parser.call(context, data);
        }
  
        async.success(data);
      };
  
      var error = function(data) {
        async.fault(data);
      };
  
      return new Async(success, error);
    };
  
    Backendless.setUIState = function(stateName) {
      if (stateName === undefined) {
        throw new Error('UI state name must be defined or explicitly set to null');
      } else {
        UIState = stateName === null ? null : stateName;
      }
    };
  
    Backendless._ajax_for_browser = function(config) {
      var cashingAllowedArr = [
            'cacheOnly', 'remoteDataOnly', 'fromCacheOrRemote', 'fromRemoteOrCache', 'fromCacheAndRemote'],
          cacheMethods      = {
            ignoreCache       : function(config) {
              return sendRequest(config);
            },
            cacheOnly         : function(config) {
              var cachedResult = Backendless.LocalCache.get(config.url.replace(/([^A-Za-z0-9])/g, '')),
                  cacheError   = {
                    message   : 'error: cannot find data in Backendless.LocalCache',
                    statusCode: 404
                  };
              if (cachedResult) {
                config.isAsync && config.asyncHandler.success(cachedResult);
                return cachedResult;
              } else {
                if (config.isAsync) {
                  config.asyncHandler.fault(cacheError);
                } else {
                  throw cacheError;
                }
              }
            },
            remoteDataOnly    : function(config) {
              return sendRequest(config);
            },
            fromCacheOrRemote : function(config) {
              var cachedResult = Backendless.LocalCache.get(config.url.replace(/([^A-Za-z0-9])/g, ''));
  
              if (cachedResult) {
                config.isAsync && config.asyncHandler.success(cachedResult);
                return cachedResult;
              } else {
                return sendRequest(config);
              }
            },
            fromRemoteOrCache : function(config) {
              return sendRequest(config);
            },
            fromCacheAndRemote: function(config) {
              var result       = {},
                  cachedResult = Backendless.LocalCache.get(config.url.replace(/([^A-Za-z0-9])/g, '')),
                  cacheError   = {
                    message   : 'error: cannot find data in Backendless.LocalCache',
                    statusCode: 404
                  };
  
              result.remote = sendRequest(config);
  
              if (cachedResult) {
                config.isAsync && config.asyncHandler.success(cachedResult);
                result.local = cachedResult;
              } else {
                if (config.isAsync) {
                  config.asyncHandler.fault(cacheError);
                } else {
                  throw cacheError;
                }
              }
  
              return result;
            }
          },
          sendRequest       = function(config) {
            var xhr         = new Backendless.XMLHttpRequest(),
                contentType = config.data ? 'application/json' : 'application/x-www-form-urlencoded',
                response;
  
            var parseResponse = function(xhr) {
              var result = true;
  
              if (xhr.responseText) {
                result = Utils.tryParseJSON(xhr.responseText);
              }
  
              return result;
            };
  
            var badResponse = function(xhr) {
              var result = {};
  
              try {
                result = JSON.parse(xhr.responseText);
              } catch (e) {
                result.message = xhr.responseText;
              }
  
              result.statusCode = xhr.status;
              result.message = result.message || 'unknown error occurred';
  
              return result;
            };
  
            var cacheHandler = function(response) {
              response = Utils.cloneObject(response);
              if (config.method === 'GET' && config.cacheActive) {
                response.cachePolicy = config.cachePolicy;
                Backendless.LocalCache.set(config.urlBlueprint, response);
              } else if (Backendless.LocalCache.exists(config.urlBlueprint)) {
                if (response === true || config.method === 'DELETE') {
                  response = undefined;
                } else {
                  response.cachePolicy = Backendless.LocalCache.getCachePolicy(config.urlBlueprint);
                }
                '___class' in response && delete response['___class'];  // this issue must be fixed on server side
  
                Backendless.LocalCache.set(config.urlBlueprint, response);
              }
            };
  
            var checkInCache = function() {
              return config.cacheActive
                && config.cachePolicy.policy === 'fromRemoteOrCache'
                && Backendless.LocalCache.exists(config.urlBlueprint);
            };
  
            xhr.open(config.method, config.url, config.isAsync);
            xhr.setRequestHeader('Content-Type', contentType);
  
            if ((currentUser != null && currentUser["user-token"])) {
              xhr.setRequestHeader("user-token", currentUser["user-token"]);
            } else if (Backendless.LocalCache.exists("user-token")) {
              xhr.setRequestHeader("user-token", Backendless.LocalCache.get("user-token"));
            }
  
            if (UIState !== null) {
              xhr.setRequestHeader("uiState", UIState);
            }
  
            if (config.isAsync) {
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status) {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    response = parseResponse(xhr);
                    cacheHandler(response);
                    config.asyncHandler.success && config.asyncHandler.success(response);
                  } else if (checkInCache()) {
                    config.asyncHandler.success && config.asyncHandler.success(Backendless.LocalCache.get(config.urlBlueprint));
                  } else {
                    config.asyncHandler.fault && config.asyncHandler.fault(badResponse(xhr));
                  }
                }
              };
  
              if (config.asyncHandler.fault) {
                xhr.onerror = Utils.onHttpRequestErrorHandler(xhr, config.asyncHandler.fault, badResponse);
              }
            }
  
            xhr.send(config.data);
  
            if (config.isAsync) {
              return xhr;
            } else if (xhr.status >= 200 && xhr.status < 300) {
              response = parseResponse(xhr);
              cacheHandler(response);
              return response;
            } else if (checkInCache()) {
              return Backendless.LocalCache.get(config.urlBlueprint);
            } else {
              throw badResponse(xhr);
            }
          };
  
      config.method = config.method || 'GET';
      config.cachePolicy = config.cachePolicy || { policy: 'ignoreCache' };
      config.isAsync = (typeof config.isAsync === 'boolean') ? config.isAsync : false;
      config.cacheActive = (config.method === 'GET') && (cashingAllowedArr.indexOf(config.cachePolicy.policy) !== -1);
      config.urlBlueprint = config.url.replace(/([^A-Za-z0-9])/g, '');
  
      try {
        return cacheMethods[config.cachePolicy.policy].call(this, config);
      } catch (error) {
        throw error;
      }
    };
  
    Backendless._ajax_for_nodejs = function(config) {
      config.data = config.data || "";
      config.asyncHandler = config.asyncHandler || {};
      config.isAsync = (typeof config.isAsync === 'boolean') ? config.isAsync : false;
  
      if (!config.isAsync) {
        throw new Error(
          'Using the sync methods of the Backendless API in Node.js is disallowed. ' +
          'Use the async methods instead.'
        );
      }
  
      if (typeof config.data !== "string") {
        config.data = JSON.stringify(config.data);
      }
  
      var u = require('url').parse(config.url);
      var https = u.protocol === 'https:';
  
      var options = {
        host   : u.hostname,
        port   : u.port || (https ? 443 : 80),
        method : config.method || "GET",
        path   : u.path,
        headers: {
          "Content-Length": config.data ? Buffer.byteLength(config.data) : 0,
          "Content-Type"  : config.data ? 'application/json' : 'application/x-www-form-urlencoded'
        }
      };
  
      if (currentUser != null && !!currentUser["user-token"]) {
        options.headers["user-token"] = currentUser["user-token"];
      } else if (Backendless.LocalCache.exists("user-token")) {
        options.headers["user-token"] = Backendless.LocalCache.get("user-token");
      }
  
      var buffer;
      var httpx = require(https ? 'https' : 'http');
      var req = httpx.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          buffer = buffer ? buffer + chunk : chunk;
        });
        res.on('end', function() {
          var callback = config.asyncHandler[res.statusCode >= 200 && res.statusCode < 300 ? "success" : "fault"];
  
          if (Utils.isFunction(callback)) {
            var contentType = res.headers['content-type'];
  
            if (buffer !== undefined && contentType /*&& contentType.indexOf('application/json') !== -1*/) {
              buffer = Utils.tryParseJSON(buffer);
            }
  
            callback(buffer);
          }
        });
      });
  
      req.on('error', function(e) {
        config.asyncHandler.fault && config.asyncHandler.fault(e);
      });
  
      req.write(config.data);
  
      return req.end();
    };
  
    Backendless._ajax = function(config) {
      return Backendless.XMLHttpRequest ? Backendless._ajax_for_browser(config) : Backendless._ajax_for_nodejs(config);
    };
  
    function Async(successCallback, faultCallback, context) {
      if (!(faultCallback instanceof Function)) {
        context = faultCallback;
        faultCallback = emptyFn;
      }
  
      this.success = function(data) {
        successCallback && successCallback.call(context, data);
      };
      this.fault = function(data) {
        faultCallback && faultCallback.call(context, data);
      };
    }
  
    function setCache() {
      var store   = {},
          storage = {};
  
      store.enabled = false;
  
      store.exists = function(key) {
        return store.get(key) !== undefined;
      };
  
      store.set = function(key, value) {
        return storage[key] = store.serialize(value);
      };
  
      store.get = function(key) {
        var result = storage[key];
  
        return result && store.deserialize(result);
      };
  
      store.remove = function(key) {
        return delete storage[key];
      };
  
      store.clear = function() {
        storage = {};
      };
  
      store.flushExpired = function() {
      };
  
      store.getCachePolicy = function(key) {
      };
  
      store.getAll = function() {
        var result = {};
  
        for (var prop in storage) {
          if (storage.hasOwnProperty(prop)) {
            result[prop] = storage[prop];
          }
        }
  
        return result;
      };
  
      store.serialize = function(value) {
        return JSON.stringify(value);
      };
  
      store.deserialize = function(value) {
        if (typeof value !== 'string') {
          return undefined;
        }
        try {
          return JSON.parse(value);
        } catch (e) {
          return value || undefined;
        }
      };
  
      function isLocalStorageSupported() {
        try {
          if (isBrowser && (localStorageName in window && window[localStorageName])) {
            localStorage.setItem('localStorageTest', true);
            localStorage.removeItem('localStorageTest');
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
  
      if (isLocalStorageSupported()) {
        return extendToLocalStorageCache(store);
      }
  
      return store;
    }
  
    function extendToLocalStorageCache(store) {
      var storage = window[localStorageName];
  
      var createBndlsStorage = function() {
        if (!(storage.getItem('Backendless'))) {
          storage.setItem('Backendless', store.serialize({}));
        }
      };
  
      var expired = function(obj) {
        var result = false;
        if (obj && Object.prototype.toString.call(obj).slice(8, -1) === "Object") {
          if ('cachePolicy' in obj && 'timeToLive' in obj.cachePolicy && obj.cachePolicy.timeToLive !== -1 && 'created' in obj.cachePolicy) {
            result = (new Date().getTime() - obj['cachePolicy']['created']) > obj['cachePolicy']['timeToLive'];
          }
        }
  
        return result;
      };
  
      var addTimestamp = function(obj) {
        if (obj && Object.prototype.toString.call(obj).slice(8, -1) === "Object") {
          if ('cachePolicy' in obj && 'timeToLive' in obj['cachePolicy']) {
            obj['cachePolicy']['created'] = new Date().getTime();
          }
        }
      };
  
      createBndlsStorage();
  
      store.enabled = true;
  
      store.exists = function(key) {
        return store.get(key) !== undefined;
      };
  
      store.set = function(key, val) {
        if (val === undefined) {
          return store.remove(key);
        }
  
        createBndlsStorage();
  
        var backendlessObj = store.deserialize(storage.getItem('Backendless'));
  
        addTimestamp(val);
  
        backendlessObj[key] = val;
  
        try {
          storage.setItem('Backendless', store.serialize(backendlessObj));
        } catch (e) {
          backendlessObj = {};
          backendlessObj[key] = val;
          storage.setItem('Backendless', store.serialize(backendlessObj));
        }
  
        return val;
      };
  
      store.get = function(key) {
        createBndlsStorage();
  
        var backendlessObj = store.deserialize(storage.getItem('Backendless')),
            obj            = backendlessObj[key],
            result         = obj;
  
        if (expired(obj)) {
          delete backendlessObj[key];
          storage.setItem('Backendless', store.serialize(backendlessObj));
          result = undefined;
        }
  
        if (result && result['cachePolicy']) {
          delete result['cachePolicy'];
        }
  
        return result;
      };
  
      store.remove = function(key) {
        var result;
  
        createBndlsStorage();
  
        key = key.replace(/([^A-Za-z0-9-])/g, '');
  
        var backendlessObj = store.deserialize(storage.getItem('Backendless'));
  
        if (backendlessObj.hasOwnProperty(key)) {
          result = delete backendlessObj[key];
        }
  
        storage.setItem('Backendless', store.serialize(backendlessObj));
  
        return result;
      };
  
      store.clear = function() {
        storage.setItem('Backendless', store.serialize({}));
      };
  
      store.getAll = function() {
        createBndlsStorage();
  
        var backendlessObj = store.deserialize(storage.getItem('Backendless'));
        var ret = {};
  
        for (var prop in backendlessObj) {
          if (backendlessObj.hasOwnProperty(prop)) {
            ret[prop] = backendlessObj[prop];
            if (ret[prop] !== null && ret[prop].hasOwnProperty('cachePolicy')) {
              delete ret[prop]['cachePolicy'];
            }
          }
        }
  
        return ret;
      };
  
      store.flushExpired = function() {
        createBndlsStorage();
  
        var backendlessObj = store.deserialize(storage.getItem('Backendless')),
            obj;
  
        for (var prop in backendlessObj) {
          if (backendlessObj.hasOwnProperty(prop)) {
            obj = backendlessObj[prop];
            if (expired(obj)) {
              delete backendlessObj[prop];
              storage.setItem('Backendless', store.serialize(backendlessObj));
            }
          }
        }
      };
  
      store.getCachePolicy = function(key) {
        createBndlsStorage();
  
        var backendlessObj = store.deserialize(storage.getItem('Backendless'));
        var obj = backendlessObj[key];
  
        return obj ? obj['cachePolicy'] : undefined;
      };
  
      return store;
    }
  
    Backendless.LocalCache = setCache();
  
    if (Backendless.LocalCache.enabled) {
      Backendless.LocalCache.flushExpired();
    }
  
    function DataStore(model) {
      this.model = Utils.isString(model) ? function() {
      } : model;
  
      this.className = Utils.getClassName(model);
  
      if ((typeof model).toLowerCase() === "string") {
        this.className = model;
      }
  
      if (!this.className) {
        throw new Error('Class name should be specified');
      }
  
      this.restUrl = Backendless.appPath + '/data/' + this.className;
      this.bulkRestUrl = Backendless.appPath + '/data/bulk/' + this.className;
    }
  
    DataStore.prototype = {
      _extractQueryOptions: function(options) {
        var params = [];
  
        if (typeof options.pageSize !== 'undefined') {
          if (options.pageSize < 1 || options.pageSize > 100) {
            throw new Error('PageSize can not be less then 1 or greater than 100');
          }
  
          params.push('pageSize=' + encodeURIComponent(options.pageSize));
        }
  
        if (typeof options.offset !== 'undefined') {
          if (options.offset < 0) {
            throw new Error('Offset can not be less then 0');
          }
  
          params.push('offset=' + encodeURIComponent(options.offset));
        }
  
        if (options.sortBy) {
          if (Utils.isString(options.sortBy)) {
            params.push('sortBy=' + encodeURIComponent(options.sortBy));
          } else if (Utils.isArray(options.sortBy)) {
            params.push('sortBy=' + Utils.encodeArrayToUriComponent(options.sortBy));
          }
        }
  
        if (options.relationsDepth) {
          if (Utils.isNumber(options.relationsDepth)) {
            params.push('relationsDepth=' + Math.floor(options.relationsDepth));
          }
        }
  
        if (options.relations) {
          if (Utils.isArray(options.relations)) {
            params.push('loadRelations=' + (options.relations.length ? Utils.encodeArrayToUriComponent(options.relations) : "*"));
          }
        }
  
        return params.join('&');
      },
  
      _parseResponse      : function(response) {
        var _Model = this.model, item;
        response = response.fields || response;
        item = new _Model();
  
        Utils.deepExtend(item, response);
        return this._formCircDeps(item);
      },
  
      _parseFindResponse: function(response, model) {
        var _Model = model === undefined ? this.model : model;
        var result;
  
        var sanitizeResponseItem = function(response) {
          var item = Utils.isFunction(_Model) ? new _Model() : {};
  
          response = response.fields || response;
  
          return Utils.deepExtend(item, response);
        };
  
        if (Utils.isArray(response)) {
          result = response.map(sanitizeResponseItem);
        } else {
          result = sanitizeResponseItem(response);
        }
  
        return this._formCircDeps(result);
      },
  
      _load: function(url, async) {
        if (url) {
          var responder = Utils.extractResponder(arguments), isAsync = false;
  
          if (responder != null) {
            isAsync = true;
            responder = Utils.wrapAsync(responder, this._parseResponse, this);
          }
  
          var result = Backendless._ajax({
            method      : 'GET',
            url         : url,
            isAsync     : isAsync,
            asyncHandler: responder
          });
  
          return isAsync ? result : this._parseResponse(result);
        }
      },
  
      _replCircDeps: function(obj) {
        var objMap = [obj];
        var pos;
  
        var genID = function() {
          for (var b = '', a = b; a++ < 36; b += a * 51 && 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-') {
          }
          return b;
        };
  
        var _replCircDepsHelper = function(obj) {
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === "object" && obj[prop] != null) {
              if ((pos = objMap.indexOf(obj[prop])) !== -1) {
                objMap[pos]["__subID"] = objMap[pos]["__subID"] || genID();
                obj[prop] = { "__originSubID": objMap[pos]["__subID"] };
              } else if (Utils.isDate(obj[prop])) {
                obj[prop] = obj[prop].getTime();
              } else {
                objMap.push(obj[prop]);
                _replCircDepsHelper(obj[prop]);
              }
            }
          }
        };
  
        _replCircDepsHelper(obj);
      },
  
      _formCircDeps: function(obj) {
        var result = new obj.constructor();
        var circDepsIDs = {};
        var iteratedObjects = []
  
        var _formCircDepsHelper = function(obj, result) {
          if (iteratedObjects.indexOf(obj) === -1) {
            iteratedObjects.push(obj)
  
            if (obj.hasOwnProperty("__subID")) {
              circDepsIDs[obj["__subID"]] = result;
              delete obj["__subID"];
            }
  
            for (var prop in obj) {
              if (obj.hasOwnProperty(prop)) {
                if (typeof obj[prop] === "object" && obj[prop] != null) {
                  if (obj[prop].hasOwnProperty("__originSubID")) {
                    result[prop] = circDepsIDs[obj[prop]["__originSubID"]];
                  } else {
                    result[prop] = new (obj[prop].constructor)();
                    _formCircDepsHelper(obj[prop], result[prop]);
                  }
                } else {
                  result[prop] = obj[prop];
                }
              }
            }
          }
        };
  
        _formCircDepsHelper(obj, result);
  
        return result;
      },
  
      save: promisified('_save'),
  
      saveSync: synchronized('_save'),
  
      _save: function(obj, async) {
        this._replCircDeps(obj);
        var responder = Utils.extractResponder(arguments),
            isAsync   = false,
            method    = 'PUT',
            url       = this.restUrl,
            objRef    = obj;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder, this._parseResponse, this);
        }
  
        var result = Backendless._ajax({
          method      : method,
          url         : url,
          data        : JSON.stringify(obj),
          isAsync     : isAsync,
          asyncHandler: responder
        });
  
        if (!isAsync) {
          Utils.deepExtend(objRef, this._parseResponse(result));
        }
  
        return isAsync ? result : objRef;
      },
  
      remove: promisified('_remove'),
  
      removeSync: synchronized('_remove'),
  
      _remove: function(objId, async) {
        if (!Utils.isObject(objId) && !Utils.isString(objId)) {
          throw new Error('Invalid value for the "value" argument. The argument must contain only string or object values');
        }
  
        var responder = Utils.extractResponder(arguments), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder, this._parseResponse, this);
        }
  
        var result;
  
        if (Utils.isString(objId) || objId.objectId) {
          objId = objId.objectId || objId;
          result = Backendless._ajax({
            method      : 'DELETE',
            url         : this.restUrl + '/' + objId,
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } else {
          result = Backendless._ajax({
            method      : 'DELETE',
            url         : this.restUrl,
            data        : JSON.stringify(objId),
            isAsync     : isAsync,
            asyncHandler: responder
          });
        }
  
        return isAsync ? result : this._parseResponse(result);
      },
  
      find: promisified('_find'),
  
      findSync: synchronized('_find'),
  
      _find: function(queryBuilder) {
        var args = this._parseFindArguments(arguments);
        var dataQuery = args.queryBuilder ? args.queryBuilder.build() : {};
  
        return this._findUtil(dataQuery, args.async);
      },
  
      _validateFindArguments: function(args) {
        if (args.length === 0) {
          return;
        }
  
        if (!(args[0] instanceof Backendless.DataQueryBuilder) && !(args[0] instanceof Async)) {
          throw new Error(
            'Invalid find method argument. ' +
            'The argument should be instance of Backendless.DataQueryBuilder or Async'
          );
        }
      },
  
      _parseFindArguments: function(args) {
        this._validateFindArguments(args);
  
        var result = {
          queryBuilder: args[0] instanceof Backendless.DataQueryBuilder ? args[0] : null,
          async       : args[0] instanceof Async ? args[0] : null
        };
  
        if (args.length > 1) {
          result.async = args[1];
        }
  
        return result;
      },
  
      _findUtil: function(dataQuery) {
        dataQuery = dataQuery || {};
  
        var props,
            whereClause,
            options,
            query     = [],
            url       = this.restUrl,
            responder = Utils.extractResponder(arguments),
            isAsync   = responder != null,
            result;
  
        if (dataQuery.properties && dataQuery.properties.length) {
          props = 'props=' + Utils.encodeArrayToUriComponent(dataQuery.properties);
        }
  
        if (dataQuery.condition) {
          whereClause = 'where=' + encodeURIComponent(dataQuery.condition);
        }
  
        if (dataQuery.options) {
          options = this._extractQueryOptions(dataQuery.options);
        }
        responder != null && (responder = Utils.wrapAsync(responder, this._parseFindResponse, this));
        options && query.push(options);
        whereClause && query.push(whereClause);
        props && query.push(props);
        query = query.join('&');
  
        if (dataQuery.url) {
          url += '/' + dataQuery.url;
        }
  
        if (query) {
          url += '?' + query;
        }
  
        result = Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder,
          cachePolicy : dataQuery.cachePolicy
        });
  
        return isAsync ? result : this._parseFindResponse(result);
      },
  
      findById: promisified('_findById'),
  
      findByIdSync: synchronized('_findById'),
  
      _findById: function() {
        var argsObj;
        var responder = Utils.extractResponder(arguments);
  
        if (Utils.isString(arguments[0])) {
          argsObj = !(arguments[1] instanceof Async) ? (arguments[1] || {}) : {};
          argsObj.url = arguments[0];
  
          if (!argsObj.url) {
            throw new Error('missing argument "object ID" for method findById()');
          }
  
          return this._findUtil(argsObj, responder);
        } else if (Utils.isObject(arguments[0])) {
          argsObj = arguments[0];
          var url       = this.restUrl,
              isAsync   = responder != null,
              send      = "/pk?";
  
          for (var key in argsObj) {
            send += key + '=' + argsObj[key] + '&';
          }
  
          responder != null && (responder = Utils.wrapAsync(responder, this._parseResponse, this));
  
          var result;
  
          if (Utils.getClassName(arguments[0]) === 'Object') {
            result = Backendless._ajax({
              method      : 'GET',
              url         : url + send.replace(/&$/, ""),
              isAsync     : isAsync,
              asyncHandler: responder
            });
          } else {
            result = Backendless._ajax({
              method      : 'PUT',
              url         : url,
              data        : JSON.stringify(argsObj),
              isAsync     : isAsync,
              asyncHandler: responder
            });
          }
  
          return isAsync ? result : this._parseResponse(result);
        } else {
          throw new Error('Invalid value for the "value" argument. The argument must contain only string or object values');
        }
      },
  
      /**
       * Get related objects
       *
       * @param {string} parentObjectId
       * @param {LoadRelationsQueryBuilder} queryBuilder
       * @param {Async} [async]
       * @returns {Promise}
       */
      loadRelations: promisified('_loadRelations'),
  
      /**
       * Get related objects (sync)
       *
       * @param {string} parentObjectId
       * @param {LoadRelationsQueryBuilder} queryBuilder
       * @returns {Object[]}
       */
      loadRelationsSync: synchronized('_loadRelations'),
  
      _loadRelations: function(parentObjectId, queryBuilder, async) {
        this._validateLoadRelationsArguments(parentObjectId, queryBuilder);
  
        var whereClause,
            options,
            query = [];
  
        var dataQuery = queryBuilder.build();
  
        if (dataQuery.condition) {
          whereClause = 'where=' + encodeURIComponent(dataQuery.condition);
        }
  
        if (dataQuery.options) {
          options = this._extractQueryOptions(dataQuery.options);
        }
  
        options && query.push(options);
        whereClause && query.push(whereClause);
        query = query.join('&');
  
        var relationModel = dataQuery.relationModel || null;
        var responder = Utils.extractResponder(arguments);
        var relationName = dataQuery.options.relationName;
        var url = this.restUrl + Utils.toUri(parentObjectId, relationName);
  
        responder = responder && Utils.wrapAsync(responder, function(response) {
            return this._parseFindResponse(response, relationModel);
          }, this);
  
        if (query) {
          url += '?' + query;
        }
  
        var result = Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : !!responder,
          asyncHandler: responder
        });
  
        return !!responder ? result : this._parseFindResponse(result, relationModel);
      },
  
      _validateLoadRelationsArguments: function(parentObjectId, queryBuilder) {
        if (!parentObjectId || !Utils.isString(parentObjectId)) {
          throw new Error('The parentObjectId is required argument and must be a nonempty string');
        }
  
        if (!queryBuilder || !(queryBuilder instanceof Backendless.LoadRelationsQueryBuilder)) {
          throw new Error(
            'Invalid queryBuilder object.' +
            'The queryBuilder is required and must be instance of the Backendless.LoadRelationsQueryBuilder'
          );
        }
  
        var dataQuery = queryBuilder.build();
  
        var relationName = dataQuery.options && dataQuery.options.relationName;
  
        if (!relationName || !Utils.isString(relationName)) {
          throw new Error('The options relationName is required and must contain string value');
        }
      },
  
      findFirst: promisified('_findFirst'),
  
      findFirstSync: synchronized('_findFirst'),
  
      _findFirst: function() {
        var argsObj = !(arguments[0] instanceof Async) ? (arguments[0] || {}) : {};
        argsObj.url = 'first';
  
        return this._findUtil.apply(this, [argsObj].concat(Array.prototype.slice.call(arguments)));
      },
  
      findLast: promisified('_findLast'),
  
      findLastSync: synchronized('_findLast'),
  
      _findLast: function() {
        var argsObj = !(arguments[0] instanceof Async) ? (arguments[0] || {}) : {};
        argsObj.url = 'last';
  
        return this._findUtil.apply(this, [argsObj].concat(Array.prototype.slice.call(arguments)));
      },
  
      /**
       * Count of object
       *
       * @param {DataQueryBuilder} [queryBuilder]
       *
       * @return {Promise}
       */
      getObjectCount: promisified('_getObjectCount'),
  
      /**
       * Count of object (sync)
       *
       * @param {DataQueryBuilder} [queryBuilder]
       *
       * @return {number}
       */
      getObjectCountSync: synchronized('_getObjectCount'),
  
      _getObjectCount: function(queryBuilder, async) {
        var args = this._parseFindArguments(arguments);
        var dataQuery = args.queryBuilder ? args.queryBuilder.build() : {};
        var url = this.restUrl + '/count';
        var isAsync = !!args.async;
  
        if (dataQuery.condition) {
          url += '?where=' + encodeURIComponent(dataQuery.condition);
        }
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: args.async
        });
      },
  
      /**
       * Set relations
       *
       * @param {object} parentObject,
       * @param {string} columnName
       * @param {object[]|string[]|string} childObjectsArray|childObjectIdArray|whereClause
       * @returns {Promise}
       **/
  
      setRelation: promisified('_setRelation'),
  
      /**
       * Set relations (sync)
       *
       * @param {object} parentObject,
       * @param {string} columnName
       * @param {object[]|string[]|string} childObjectsArray|childObjectIdArray|whereClause
       * @returns {*}
       **/
      setRelationSync: synchronized('_setRelation'),
  
      _setRelation: function() {
        return this._manageRelation('POST', arguments);
      },
  
      /**
       * Add relations
       *
       * @param {object} parentObject,
       * @param {string} columnName
       * @param {object[]|string[]|string} childObjectsArray|childObjectIdArray|whereClause
       * @returns {Promise}
       **/
      addRelation: promisified('_addRelation'),
  
      /**
       * Add relations (sync)
       *
       * @param {object} parentObject,
       * @param {string} columnName
       * @param {object[]|string[]|string} childObjectsArray|childObjectIdArray|whereClause
       * @returns {*}
       **/
      addRelationSync: synchronized('_addRelation'),
  
      _addRelation: function() {
        return this._manageRelation('PUT', arguments);
      },
  
      /**
       * Delete relations
       *
       * @param {object} parentObject,
       * @param {string} columnName
       * @param {object[]|string[]|string} childObjectsArray|childObjectIdArray|whereClause
       * @returns {Promise}
       **/
      deleteRelation: promisified('_deleteRelation'),
  
      /**
       * Delete relations
       *
       * @param {object} parentObject,
       * @param {string} columnName
       * @param {object[]|string[]|string} childObjectsArray|childObjectIdArray|whereClause
       * @returns {*}
       **/
      deleteRelationSync: synchronized('_deleteRelation'),
  
      _deleteRelation: function() {
        return this._manageRelation('DELETE', arguments);
      },
  
      _collectRelationObject: function(args) {
        var relation = {
          columnName: args[1]
        };
  
        var parent = args[0];
  
        if (Utils.isString(parent)) {
          relation.parentId = parent
        } else if (Utils.isObject(parent)) {
          relation.parentId = parent.objectId
        }
  
        var children = args[2];
  
        if (Utils.isString(children)) {
          relation.whereClause = children
        } else if (Utils.isArray(children)) {
          relation.childrenIds = children.map(function(child) {
            return Utils.isObject(child) ? child.objectId : child;
          });
        }
  
        return relation;
      },
  
      _validateRelationObject: function(relation) {
        if (!relation.parentId) {
          throw new Error(
            'Invalid value for the "parent" argument. ' +
            'The argument is required and must contain only string or object values.'
          );
        }
  
        if (!relation.columnName) {
          throw new Error(
            'Invalid value for the "columnName" argument. ' +
            'The argument is required and must contain only string values.'
          );
        }
  
        if (!relation.whereClause && !relation.childrenIds) {
          throw new Error(
            'Invalid value for the third argument. ' +
            'The argument is required and must contain string values if it sets whereClause ' +
            'or array if it sets childObjects.'
          );
        }
      },
  
      _manageRelation: function(method, args) {
        var relation = this._collectRelationObject(args);
        var responder = Utils.extractResponder(args);
  
        this._validateRelationObject(relation);
  
        return Backendless._ajax({
          method      : method,
          url         : this._buildRelationUrl(relation),
          isAsync     : !!responder,
          asyncHandler: responder,
          data        : relation.childrenIds && JSON.stringify(relation.childrenIds)
        });
      },
  
      _buildRelationUrl: function(relation) {
        var url = this.restUrl + Utils.toUri(relation.parentId, relation.columnName);
  
        if (relation.whereClause) {
          url += '?' + Utils.toQueryParams({ where: relation.whereClause });
        }
  
        return url;
      },
  
      /**
       * Update of several objects by template
       *
       * @param {object} templateObject
       * @param {string} whereClause
       * @returns {Promise}
       */
      bulkUpdate: promisified('_bulkUpdate'),
  
      /**
       * Update of several objects by template (sync)
       *
       * @param {object} templateObject
       * @param {string} whereClause
       * @returns {*}
       */
      bulkUpdateSync: synchronized('_bulkUpdate'),
  
      _bulkUpdate: function(templateObject, whereClause, async) {
        this._validateBulkUpdateArgs(templateObject, whereClause);
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this.bulkRestUrl + '?' + Utils.toQueryParams({ where: whereClause }),
          data        : JSON.stringify(templateObject),
          isAsync     : !!async,
          asyncHandler: async
        });
      },
  
      /**
       * Delete of several objects
       *
       * @param {(string|string[]|object[])} objectsArray - whereClause string or array of object ids or array of objects
       * @returns {Promise}
       */
  
      bulkDelete: promisified('_bulkDelete'),
  
      /**
       * Delete of several objects (sync)
       *
       * @param {(string|string[]|object[])} objectsArray - whereClause string or array of object ids or array of objects
       * @returns {*}
       */
      bulkDeleteSync: synchronized('_bulkDelete'),
  
      _bulkDelete: function(objectsArray, async) {
        this._validateBulkDeleteArg(objectsArray);
  
        var whereClause;
        var objects;
  
        if (Utils.isString(objectsArray)) {
          whereClause = objectsArray;
        } else if (Utils.isArray(objectsArray)) {
          objects = objectsArray.map(function(obj) {
            return Utils.isString(obj) ? obj : obj.objectId;
          });
  
          whereClause = 'objectId in (\'' + objects.join('\', \'') + '\')';
        }
  
        return Backendless._ajax({
          method      : 'DELETE',
          url         : this.bulkRestUrl + '?' + Utils.toQueryParams({ where: whereClause }),
          isAsync     : !!async,
          asyncHandler: async
        });
      },
  
      _validateBulkUpdateArgs: function(templateObject, whereClause) {
        if (!templateObject || !Utils.isObject(templateObject)) {
          throw new Error('Invalid templateObject argument. The first argument must contain object');
        }
  
        if (!whereClause || !Utils.isString(whereClause)) {
          throw new Error('Invalid whereClause argument. The first argument must contain "whereClause" string.');
        }
      },
  
      _validateBulkDeleteArg: function(arg) {
        var MSG_ERROR = (
          'Invalid bulkDelete argument. ' +
          'The first argument must contain array of objects or array of id or "whereClause" string'
        );
  
        if (!arg || (!Utils.isArray(arg) && !Utils.isString(arg))) {
          throw new Error(MSG_ERROR);
        }
  
        for (var i = 0; i < arg.length; i++) {
          if (!Utils.isObject(arg[i]) && !Utils.isString(arg[i])) {
            throw new Error(MSG_ERROR);
          }
        }
      }
    };
  
    var dataStoreCache = {};
  
    var persistence = {
  
      save: promisified('_save'),
  
      saveSync: synchronized('_save'),
  
      _save: function(className, obj, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = !!responder;
  
        if (Utils.isString(className)) {
          var url = Backendless.appPath + '/data/' + className;
          return Backendless._ajax({
            method      : 'POST',
            url         : url,
            data        : JSON.stringify(obj),
            isAsync     : isAsync,
            asyncHandler: responder
          });
        }
  
        if (Utils.isObject(className)) {
          return new DataStore(className)._save(className, obj, async);
        }
      },
  
      getView: promisified('_getView'),
  
      getViewSync: synchronized('_getView'),
  
      _getView: function(viewName, whereClause, pageSize, offset, async) {
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null;
  
        if (Utils.isString(viewName)) {
          var url = Backendless.appPath + '/data/' + viewName;
  
          if ((arguments.length > 1) && !(arguments[1] instanceof Async)) {
            url += '?';
          }
          if (Utils.isString(whereClause)) {
            url += 'where=' + whereClause;
          } else {
            pageSize = whereClause;
            offset = pageSize;
          }
          if (Utils.isNumber(pageSize)) {
            url += '&' + new DataStore()._extractQueryOptions({
                pageSize: pageSize
              });
          }
          if (Utils.isNumber(offset)) {
            url += '&' + new DataStore()._extractQueryOptions({
                offset: offset
              });
          }
  
          return Backendless._ajax({
            method      : 'GET',
            url         : url,
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } else {
          throw new Error('View name is required string parameter');
        }
      },
  
      callStoredProcedure: promisified('_callStoredProcedure'),
  
      callStoredProcedureSync: synchronized('_callStoredProcedure'),
  
      _callStoredProcedure: function(spName, argumentValues, async) {
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null;
  
        if (Utils.isString(spName)) {
          var url  = Backendless.appPath + '/data/' + spName,
              data = {};
  
          if (Utils.isObject(argumentValues)) {
            data = JSON.stringify(argumentValues);
          }
  
          return Backendless._ajax({
            method      : 'POST',
            url         : url,
            data        : data,
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } else {
          throw new Error('Stored Procedure name is required string parameter');
        }
      },
  
      of: function(model) {
        var tableName;
  
        if (Utils.isString(model)) {
          tableName = model;
        } else {
          tableName = Utils.getClassName(model);
        }
  
        var store = dataStoreCache[tableName];
  
        if (!store) {
          store = new DataStore(model);
          dataStoreCache[tableName] = store;
        }
  
        return store;
      },
  
      describe: promisified('_describe'),
  
      describeSync: synchronized('_describe'),
  
      _describe: function(className, async) {
        className = Utils.isString(className) ? className : Utils.getClassName(className);
        var responder = Utils.extractResponder(arguments), isAsync = (responder != null);
  
        return Backendless._ajax({
          method      : 'GET',
          url         : Backendless.appPath + '/data/' + className + '/properties',
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    function DataPermissions() {
      this.FIND = new DataPermission('FIND');
      this.REMOVE = new DataPermission('REMOVE');
      this.UPDATE = new DataPermission('UPDATE');
    }
  
    function DataPermission(permission) {
      this.permission = permission;
      this.restUrl = Backendless.appPath + '/data';
    }
  
    DataPermission.prototype = {
  
      grantUser: promisified('_grantUser'),
  
      grantUserSync: synchronized('_grantUser'),
  
      _grantUser: function(userId, dataObject, async) {
        return this._sendRequest({
          userId        : userId,
          dataObject    : dataObject,
          responder     : async,
          permissionType: 'GRANT'
        });
      },
  
      grantRole: promisified('_grantRole'),
  
      grantRoleSync: synchronized('_grantRole'),
  
      _grantRole: function(roleName, dataObject, async) {
        return this._sendRequest({
          roleName      : roleName,
          dataObject    : dataObject,
          responder     : async,
          permissionType: 'GRANT'
        });
      },
  
      grant: promisified('_grant'),
  
      grantSync: synchronized('_grant'),
  
      _grant: function(dataObject, async) {
        return this._sendRequest({
          userId        : '*',
          dataObject    : dataObject,
          responder     : async,
          permissionType: 'GRANT'
        });
      },
  
      denyUser: promisified('_denyUser'),
  
      denyUserSync: synchronized('_denyUser'),
  
      _denyUser: function(userId, dataObject, async) {
        return this._sendRequest({
          userId        : userId,
          dataObject    : dataObject,
          responder     : async,
          permissionType: 'DENY'
        });
      },
  
      denyRole: promisified('_denyRole'),
  
      denyRoleSync: synchronized('_denyRole'),
  
      _denyRole: function(roleName, dataObject, async) {
        return this._sendRequest({
          roleName      : roleName,
          dataObject    : dataObject,
          responder     : async,
          permissionType: 'DENY'
        });
      },
  
      deny: promisified('_deny'),
  
      denySync: synchronized('_deny'),
  
      _deny: function(dataObject, async) {
        return this._sendRequest({
          userId        : '*',
          dataObject    : dataObject,
          responder     : async,
          permissionType: 'DENY'
        });
      },
  
      _getRestUrl: function(dataObject, permissionType) {
        return (
          this.restUrl + '/' +
          encodeURIComponent(dataObject.___class) + '/permissions/' +
          permissionType + '/' +
          encodeURIComponent(dataObject.objectId)
        );
      },
  
      _sendRequest: function(options) {
        var dataObject = options.dataObject;
        var userId = options.userId;
        var roleName = options.roleName;
        var responder = options.responder;
  
        var isAsync = !!responder;
        var data = {
          "permission": this.permission
        };
  
        if (!dataObject.___class || !dataObject.objectId) {
          throw new Error('"dataObject.___class" and "dataObject.objectId" need to be specified');
        }
  
        if (userId) {
          data.user = userId;
        } else if (roleName) {
          data.role = roleName;
        }
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this._getRestUrl(dataObject, options.permissionType),
          data        : JSON.stringify(data),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    function User(user) {
      user = user || {};
  
      for (var prop in user) {
        this[prop] = user[prop]
      }
    }
  
    User.prototype.___class = "Users";
  
    Backendless.User = User;
  
    var currentUser = null;
  
    var UserService = function() {
      this.restUrl = Backendless.appPath + '/users';
    };
  
    UserService.prototype = {
      _wrapAsync: function(async, stayLoggedIn) {
        var me   = this, success = function(data) {
          currentUser = me._parseResponse(Utils.tryParseJSON(data), stayLoggedIn);
          async.success(me._getUserFromResponse(currentUser));
        }, error = function(data) {
          async.fault(data);
        };
  
        return new Async(success, error);
      },
  
      _parseResponse: function(data, stayLoggedIn) {
        var user = new Backendless.User();
        Utils.deepExtend(user, data);
  
        if (stayLoggedIn) {
          Backendless.LocalCache.set("stayLoggedIn", stayLoggedIn);
        }
  
        return user;
      },
  
      register: promisified('_register'),
  
      registerSync: synchronized('_register'),
  
      _register: function(user, async) {
        if (!(user instanceof Backendless.User)) {
          throw new Error('Only Backendless.User accepted');
        }
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        if (responder) {
          responder = this._wrapAsync(responder);
        }
  
        var result = Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/register',
          isAsync     : isAsync,
          asyncHandler: responder,
          data        : JSON.stringify(user)
        });
  
        return isAsync ? result : this._parseResponse(result);
      },
  
      getUserRoles: promisified('_getUserRoles'),
  
      getUserRolesSync: synchronized('_getUserRoles'),
  
      _getUserRoles: function(async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        var result = Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/userroles',
          isAsync     : isAsync,
          asyncHandler: responder
        });
  
        return isAsync ? result : this._parseResponse(result);
      },
  
      _roleHelper: function(identity, rolename, async, operation) {
        if (!identity) {
          throw new Error('User identity can not be empty');
        }
  
        if (!rolename) {
          throw new Error('Rolename can not be empty');
        }
  
        var responder = Utils.extractResponder(arguments);
  
        return Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/' + operation,
          isAsync     : !!responder,
          asyncHandler: responder,
          data        : JSON.stringify({ user: identity, roleName: rolename })
        });
      },
  
      assignRole: promisified('_assignRole'),
  
      assignRoleSync: synchronized('_assignRole'),
  
      _assignRole: function(identity, rolename, async) {
        return this._roleHelper(identity, rolename, async, 'assignRole');
      },
  
      unassignRole: promisified('_unassignRole'),
  
      unassignRoleSync: synchronized('_unassignRole'),
  
      _unassignRole: function(identity, rolename, async) {
        return this._roleHelper(identity, rolename, async, 'unassignRole');
      },
  
      login: promisified('_login'),
  
      loginSync: synchronized('_login'),
  
      _login: function(login, password, stayLoggedIn, async) {
        if (!login) {
          throw new Error('Login can not be empty');
        }
  
        if (!password) {
          throw new Error('Password can not be empty');
        }
  
        stayLoggedIn = stayLoggedIn === true;
  
        Backendless.LocalCache.remove("user-token");
        Backendless.LocalCache.remove("current-user-id");
        Backendless.LocalCache.set("stayLoggedIn", false);
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        if (responder) {
          responder = this._wrapAsync(responder, stayLoggedIn);
        }
  
        var data = {
          login   : login,
          password: password
        };
  
        var result = Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/login',
          isAsync     : isAsync,
          asyncHandler: responder,
          data        : JSON.stringify(data)
        });
  
        if (!isAsync && result) {
          currentUser = this._parseResponse(result, stayLoggedIn);
          result = this._getUserFromResponse(currentUser);
        }
  
        return result;
      },
  
      _getUserFromResponse: function(user) {
        Backendless.LocalCache.set('current-user-id', user.objectId);
  
        var userToken = user['user-token']
  
        if (userToken && Backendless.LocalCache.get('stayLoggedIn')) {
          Backendless.LocalCache.set('user-token', userToken)
        }
  
        return new Backendless.User(user);
      },
  
      loggedInUser: function() {
        return Backendless.LocalCache.get('current-user-id');
      },
  
      describeUserClass: promisified('_describeUserClass'),
  
      describeUserClassSync: synchronized('_describeUserClass'),
  
      _describeUserClass: function(async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/userclassprops',
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      restorePassword: promisified('_restorePassword'),
  
      restorePasswordSync: synchronized('_restorePassword'),
  
      _restorePassword: function(emailAddress, async) {
        if (!emailAddress) {
          throw new Error('emailAddress can not be empty');
        }
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/restorepassword/' + encodeURIComponent(emailAddress),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      logout: promisified('_logout'),
  
      logoutSync: synchronized('_logout'),
  
      _logout: function(async) {
        var responder       = Utils.extractResponder(arguments),
            isAsync         = responder != null,
            errorCallback   = isAsync ? responder.fault : null,
            successCallback = isAsync ? responder.success : null,
            result          = {},
  
            logoutUser      = function() {
              Backendless.LocalCache.remove("user-token");
              Backendless.LocalCache.remove("current-user-id");
              Backendless.LocalCache.remove("stayLoggedIn");
              currentUser = null;
            },
  
            onLogoutSuccess = function() {
              logoutUser();
              if (Utils.isFunction(successCallback)) {
                successCallback();
              }
            },
  
            onLogoutError   = function(e) {
              if (Utils.isObject(e) && [3064, 3091, 3090, 3023].indexOf(e.code) !== -1) {
                logoutUser();
              }
              if (Utils.isFunction(errorCallback)) {
                errorCallback(e);
              }
            };
  
        if (responder) {
          responder.fault = onLogoutError;
          responder.success = onLogoutSuccess;
        }
  
        try {
          result = Backendless._ajax({
            method      : 'GET',
            url         : this.restUrl + '/logout',
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } catch (e) {
          onLogoutError(e);
        }
  
        if (isAsync) {
          return result;
        } else {
          logoutUser();
        }
      },
  
      getCurrentUser: promisified('_getCurrentUser'),
  
      getCurrentUserSync: synchronized('_getCurrentUser'),
  
      _getCurrentUser: function(async) {
        if (currentUser) {
          var userFromResponse = this._getUserFromResponse(currentUser);
  
          return async ? async.success(userFromResponse) : userFromResponse;
        }
  
        var stayLoggedIn = Backendless.LocalCache.get("stayLoggedIn");
        var currentUserId = stayLoggedIn && Backendless.LocalCache.get("current-user-id");
  
        if (currentUserId) {
          return persistence.of(User).findById(currentUserId, async);
        }
  
        return async ? async.success(null) : null;
      },
  
      update: promisified('_update'),
  
      updateSync: synchronized('_update'),
  
      _update: function(user, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        if (responder) {
          responder = this._wrapAsync(responder);
        }
  
        var result = Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + '/' + user.objectId,
          isAsync     : isAsync,
          asyncHandler: responder,
          data        : JSON.stringify(user)
        });
  
        return isAsync ? result : this._parseResponse(result);
      },
  
      loginWithFacebook: promisified('_loginWithFacebook'),
  
      loginWithFacebookSync: synchronized('_loginWithFacebook'),
  
      _loginWithFacebook: function(facebookFieldsMapping, permissions, stayLoggedIn, async) {
        return this._loginSocial('Facebook', facebookFieldsMapping, permissions, null, stayLoggedIn, async);
      },
  
      loginWithGooglePlus: promisified('_loginWithGooglePlus'),
  
      loginWithGooglePlusSync: synchronized('_loginWithGooglePlus'),
  
      _loginWithGooglePlus: function(googlePlusFieldsMapping, permissions, container, stayLoggedIn, async) {
        return this._loginSocial('GooglePlus', googlePlusFieldsMapping, permissions, container, stayLoggedIn, async);
      },
  
      loginWithTwitter: promisified('_loginWithTwitter'),
  
      loginWithTwitterSync: synchronized('_loginWithTwitter'),
  
      _loginWithTwitter: function(twitterFieldsMapping, stayLoggedIn, async) {
        return this._loginSocial('Twitter', twitterFieldsMapping, null, null, stayLoggedIn, async);
      },
  
      _socialContainer: function(socialType, container) {
        var loadingMsg;
  
        if (container) {
          var client;
  
          container = container[0];
          loadingMsg = document.createElement('div');
          loadingMsg.innerHTML = "Loading...";
          container.appendChild(loadingMsg);
          container.style.cursor = 'wait';
  
          this.closeContainer = function() {
            container.style.cursor = 'default';
            container.removeChild(client);
          };
  
          this.removeLoading = function() {
            container.removeChild(loadingMsg);
          };
  
          this.doAuthorizationActivity = function(url) {
            this.removeLoading();
            client = document.createElement('iframe');
            client.frameBorder = 0;
            client.width = container.style.width;
            client.height = container.style.height;
            client.id = "SocialAuthFrame";
            client.setAttribute("src", url + "&amp;output=embed");
            container.appendChild(client);
            client.onload = function() {
              container.style.cursor = 'default';
            };
          };
        } else {
          container = window.open('', socialType + ' authorization',
            "resizable=yes, scrollbars=yes, titlebar=yes, top=10, left=10");
          loadingMsg = container.document.getElementsByTagName('body')[0].innerHTML;
          loadingMsg = "Loading...";
          container.document.getElementsByTagName('html')[0].style.cursor = 'wait';
  
          this.closeContainer = function() {
            container.close();
          };
  
          this.removeLoading = function() {
            loadingMsg = null;
          };
  
          this.doAuthorizationActivity = function(url) {
            container.location.href = url;
            container.onload = function() {
              container.document.getElementsByTagName("html")[0].style.cursor = 'default';
            };
          };
        }
      },
  
      _loginSocial: function(socialType, fieldsMapping, permissions, container, stayLoggedIn, async) {
        var socialContainer = new this._socialContainer(socialType, container);
        async = Utils.extractResponder(arguments);
        async = this._wrapAsync(async, stayLoggedIn);
  
        Utils.addEvent('message', window, function(e) {
          if (e.origin == Backendless.serverURL) {
            var result = JSON.parse(e.data);
  
            if (result.fault) {
              async.fault(result.fault);
            } else {
              async.success(result);
            }
  
            Utils.removeEvent('message', window);
            socialContainer.closeContainer();
          }
        });
  
        var interimCallback = new Async(function(r) {
          socialContainer.doAuthorizationActivity(r);
        }, function(e) {
          socialContainer.closeContainer();
          async.fault(e);
        });
  
        var request = {};
        request.fieldsMapping = fieldsMapping || {};
        request.permissions = permissions || [];
  
        Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + "/social/oauth/" + socialType.toLowerCase() + "/request_url",
          isAsync     : true,
          asyncHandler: interimCallback,
          data        : JSON.stringify(request)
        });
      },
  
      loginWithFacebookSdk: function(fieldsMapping, stayLoggedIn, options) {
        var users = this;
  
        return new Promise(function(resolve, reject) {
          if (!FB) {
            return reject(new Error("Facebook SDK not found"));
          }
  
          var async = new Async(resolve, reject, users);
  
          FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              users._sendSocialLoginRequest(response, "facebook", fieldsMapping, stayLoggedIn, async);
            } else {
              FB.login(function(response) {
                users._sendSocialLoginRequest(response, "facebook", fieldsMapping, stayLoggedIn, async);
              }, options);
            }
          });
        });
      },
  
      loginWithGooglePlusSdk: function(fieldsMapping, stayLoggedIn, async) {
        var users = this;
  
        return new Promise(function(resolve, reject) {
          if (!gapi) {
            return reject(new Error("Google Plus SDK not found"));
          }
  
          var async = new Async(resolve, reject, users);
  
          gapi.auth.authorize({
            client_id: fieldsMapping.client_id,
            scope    : "https://www.googleapis.com/auth/plus.login"
          }, function(response) {
            delete response['g-oauth-window'];
            users._sendSocialLoginRequest(response, "googleplus", fieldsMapping, stayLoggedIn, async);
          });
        });
      },
  
      _sendSocialLoginRequest: function(response, socialType, fieldsMapping, stayLoggedIn, async) {
        if (fieldsMapping) {
          response["fieldsMapping"] = fieldsMapping;
        }
  
        var interimCallback = new Async(function(r) {
          currentUser = context._parseResponse(r);
          Backendless.LocalCache.set("stayLoggedIn", !!stayLoggedIn);
          async.success(context._getUserFromResponse(currentUser));
        }, function(e) {
          async.fault(e);
        });
  
        Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + "/social/" + socialType + "/login/" + Backendless.applicationId,
          isAsync     : true,
          asyncHandler: interimCallback,
          data        : JSON.stringify(response)
        });
      },
  
      isValidLogin: promisified('_isValidLogin'),
  
      isValidLoginSync: synchronized('_isValidLogin'),
  
      _isValidLogin: function(async) {
        var userToken = Backendless.LocalCache.get("user-token");
        var responder = Utils.extractResponder(arguments);
        var isAsync = !!responder;
  
        if (userToken) {
          if (!isAsync) {
            try {
              var result = Backendless._ajax({
                method: 'GET',
                url   : this.restUrl + '/isvalidusertoken/' + userToken
              });
              return !!result;
            } catch (e) {
              return false;
            }
          }
  
          return Backendless._ajax({
            method      : 'GET',
            url         : this.restUrl + '/isvalidusertoken/' + userToken,
            isAsync     : isAsync,
            asyncHandler: responder
          });
        }
  
        if (!isAsync) {
          return !!this.getCurrentUserSync();
        }
  
        this.getCurrentUser().then(function(user) {
          responder.success(!!user);
        }, function() {
          responder.success(false);
        });
      },
  
      resendEmailConfirmation: promisified('_resendEmailConfirmation'),
  
      resendEmailConfirmationSync: synchronized('_resendEmailConfirmation'),
  
      _resendEmailConfirmation: function(emailAddress, async) {
        if (!emailAddress || emailAddress instanceof Async) {
          throw new Error('Email cannot be empty');
        }
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = !!responder;
  
        return Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + "/resendconfirmation/" + emailAddress,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    function Geo() {
      this.restUrl = Backendless.appPath + '/geo';
      this.monitoringId = null;
    }
  
    Geo.prototype = {
      UNITS: {
        METERS    : 'METERS',
        KILOMETERS: 'KILOMETERS',
        MILES     : 'MILES',
        YARDS     : 'YARDS',
        FEET      : 'FEET'
      },
  
      _load: function(url, async) {
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null;
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      _findHelpers: {
        'searchRectangle'             : function(arg) {
          var rect = [
            'nwlat=' + arg[0], 'nwlon=' + arg[1], 'selat=' + arg[2], 'selon=' + arg[3]
          ];
          return rect.join('&');
        },
        'latitude'                    : function(arg) {
          return 'lat=' + arg;
        },
        'longitude'                   : function(arg) {
          return 'lon=' + arg;
        },
        'metadata'                    : function(arg) {
          return 'metadata=' + JSON.stringify(arg);
        },
        'units'                       : function(arg) {
          return 'units=' + arg;
        },
        'radius'                      : function(arg) {
          return 'r=' + arg;
        },
        'categories'                  : function(arg) {
          arg = Utils.isString(arg) ? [arg] : arg;
          return 'categories=' + Utils.encodeArrayToUriComponent(arg);
        },
        'includeMetadata'             : function(arg) {
          return 'includemetadata=' + arg;
        },
        'pageSize'                    : function(arg) {
          if (arg < 1 || arg > 100) {
            throw new Error('PageSize can not be less then 1 or greater than 100');
          } else {
            return 'pagesize=' + arg;
          }
        },
        'offset'                      : function(arg) {
          if (arg < 0) {
            throw new Error('Offset can not be less then 0');
          } else {
            return 'offset=' + arg;
          }
        },
        'relativeFindPercentThreshold': function(arg) {
          if (arg <= 0) {
            throw new Error('Threshold can not be less then or equal 0');
          } else {
            return 'relativeFindPercentThreshold=' + arg;
          }
        },
        'relativeFindMetadata'        : function(arg) {
          return 'relativeFindMetadata=' + encodeURIComponent(JSON.stringify(arg));
        },
        'condition'                   : function(arg) {
          return 'whereClause=' + encodeURIComponent(arg);
        },
        'degreePerPixel'              : function(arg) {
          return 'dpp=' + arg;
        },
        'clusterGridSize'             : function(arg) {
          return 'clustergridsize=' + arg;
        },
        'geoFence'                    : function(arg) {
          return 'geoFence=' + arg;
        }
      },
  
      _validateQueryObject: function(query) {
        if (query.geoFence !== undefined && !Utils.isString(query.geoFence)) {
          throw new Error('Invalid value for argument "geoFenceName". Geo Fence Name must be a String');
        }
  
        if (query.searchRectangle && query.radius) {
          throw new Error("Inconsistent geo query. Query should not contain both rectangle and radius search parameters.");
        }
  
        if (query.radius && (query.latitude === undefined || query.longitude === undefined)) {
          throw new Error("Latitude and longitude should be provided to search in radius");
        }
  
        if ((query.relativeFindMetadata || query.relativeFindPercentThreshold) && !(query.relativeFindMetadata && query.relativeFindPercentThreshold)) {
          throw new Error("Inconsistent geo query. Query should contain both relativeFindPercentThreshold and relativeFindMetadata or none of them");
        }
      },
  
      _toQueryParams: function(query) {
        var params = [];
  
        if (query.units) {
          params.push('units=' + query.units);
        }
  
        for (var prop in query) {
          if (query.hasOwnProperty(prop) && this._findHelpers.hasOwnProperty(prop) && query[prop] != null) {
            params.push(this._findHelpers[prop](query[prop]));
          }
        }
  
        return params.join('&');
      },
  
      savePoint: promisified('_savePoint'),
  
      savePointSync: synchronized('_savePoint'),
  
      _savePoint: function(geopoint, async) {
        if (null == geopoint.latitude || null == geopoint.longitude) {
          throw new Error('Latitude or longitude not a number');
        }
        geopoint.categories = geopoint.categories || ['Default'];
        geopoint.categories = Utils.isArray(geopoint.categories) ? geopoint.categories : [geopoint.categories];
  
        var objectId = geopoint.objectId;
        var method = objectId ? 'PATCH' : 'POST',
            url    = this.restUrl + '/points';
  
        if (objectId) {
          url += '/' + objectId;
        }
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
        var responderOverride = function(async) {
          var success = function(data) {
            var geoPoint = new GeoPoint();
            geoPoint.categories = data.geopoint.categories;
            geoPoint.latitude = data.geopoint.latitude;
            geoPoint.longitude = data.geopoint.longitude;
            geoPoint.metadata = data.geopoint.metadata;
            geoPoint.objectId = data.geopoint.objectId;
  
            async.success(geoPoint);
          };
          var error = function(data) {
            async.fault(data);
          };
  
          return new Async(success, error);
        };
  
        responder = responderOverride(responder);
  
        return Backendless._ajax({
          method      : method,
          url         : url,
          data        : JSON.stringify(geopoint),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      /** @deprecated */
      addPoint: function(geopoint, async) {
        return this.savePoint.apply(this, arguments);
      },
  
      _findUtil: function(query, async) {
        var responder = Utils.extractResponder(arguments),
            isAsync   = false;
  
        this._validateQueryObject(query);
  
        var url = query.url + (query.searchRectangle ? '/rect' : '/points') + '?' + this._toQueryParams(query);
  
        var responderOverride = function(async) {
          var success = function(data) {
            var geoCollection = [];
            var geoObject;
            var isCluster;
            var GeoItemType;
  
            //TODO: refctor me when released 4.x
            var collection = data.collection || data
  
            for (var i = 0; i < collection.length; i++) {
              geoObject = collection[i];
              geoObject.geoQuery = query;
  
              isCluster = geoObject.hasOwnProperty('totalPoints');
              GeoItemType = isCluster ? GeoCluster : GeoPoint;
  
              geoCollection.push(new GeoItemType(geoObject))
            }
  
            async.success(geoCollection);
          };
  
          var error = function(data) {
            async.fault(data);
          };
  
          return new Async(success, error);
        };
  
        if (responder != null) {
          isAsync = true;
        }
  
        responder = responderOverride(responder);
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      find: promisified('_find'),
  
      findSync: synchronized('_find'),
  
      _find: function(query, async) {
        query["url"] = this.restUrl;
  
        return this._findUtil(query, async);
      },
  
      loadMetadata: promisified('_loadMetadata'),
  
      loadMetadataSync: synchronized('_loadMetadata'),
  
      _loadMetadata: function(geoObject, async) {
        var url       = this.restUrl + '/points/',
            responder = Utils.extractResponder(arguments),
            isAsync   = false;
        if (geoObject.objectId) {
          if (geoObject instanceof GeoCluster) {
            if (geoObject.geoQuery instanceof GeoQuery) {
              url += geoObject.objectId + '/metadata?';
  
              for (var prop in geoObject.geoQuery) {
                if (geoObject.geoQuery.hasOwnProperty(prop) && this._findHelpers.hasOwnProperty(prop) && geoObject.geoQuery[prop] != null) {
                  url += '&' + this._findHelpers[prop](geoObject.geoQuery[prop]);
                }
              }
            } else {
              throw new Error("Invalid GeoCluster object. Make sure to obtain an instance of GeoCluster using the Backendless.Geo.find API");
            }
          } else if (geoObject instanceof GeoPoint) {
            url += geoObject.objectId + '/metadata';
          } else {
            throw new Error("Method argument must be a valid instance of GeoPoint or GeoCluster persisted on the server");
          }
        } else {
          throw new Error("Method argument must be a valid instance of GeoPoint or GeoCluster persisted on the server");
        }
  
        if (responder != null) {
          isAsync = true;
        }
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      getClusterPoints: promisified('_getClusterPoints'),
  
      getClusterPointsSync: synchronized('_getClusterPoints'),
  
      _getClusterPoints: function(geoObject, async) {
        var url       = this.restUrl + '/clusters/',
            responder = Utils.extractResponder(arguments),
            isAsync   = false;
  
        if (geoObject.objectId) {
          if (geoObject instanceof GeoCluster) {
            if (geoObject.geoQuery instanceof GeoQuery) {
              url += geoObject.objectId + '/points?';
              for (var prop in geoObject.geoQuery) {
                if (geoObject.geoQuery.hasOwnProperty(prop) && this._findHelpers.hasOwnProperty(prop) && geoObject.geoQuery[prop] != null) {
                  url += '&' + this._findHelpers[prop](geoObject.geoQuery[prop]);
                }
              }
            } else {
              throw new Error("Invalid GeoCluster object. Make sure to obtain an instance of GeoCluster using the Backendless.Geo.find API");
            }
          } else {
            throw new Error("Method argument must be a valid instance of GeoCluster persisted on the server");
          }
        } else {
          throw new Error("Method argument must be a valid instance of GeoCluster persisted on the server");
        }
  
        var responderOverride = function(async) {
          var success = function(geoCollection) {
            for (var i = 0; i < geoCollection.length; i++) {
              geoCollection[i] = new GeoPoint(geoCollection[i]);
            }
  
            async.success(geoCollection);
          };
  
          var error = function(data) {
            async.fault(data);
          };
  
          return new Async(success, error);
        };
  
        if (responder != null) {
          isAsync = true;
        }
  
        responder = responderOverride(responder);
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      relativeFind: promisified('_relativeFind'),
  
      relativeFindSync: synchronized('_relativeFind'),
  
      _relativeFind: function(query, async) {
        if (!(query.relativeFindMetadata && query.relativeFindPercentThreshold)) {
          throw new Error("Inconsistent geo query. Query should contain both relativeFindPercentThreshold and relativeFindMetadata");
        } else {
          query["url"] = this.restUrl + "/relative";
  
          return this._findUtil(query, async);
        }
      },
  
      addCategory: promisified('_addCategory'),
  
      addCategorySync: synchronized('_addCategory'),
  
      _addCategory: function(name, async) {
        if (!name) {
          throw new Error('Category name is required.');
        }
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        var result = Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + '/categories/' + name,
          isAsync     : isAsync,
          asyncHandler: responder
        });
  
        return (typeof result.result === 'undefined') ? result : result.result;
      },
  
      getCategories: promisified('_getCategories'),
  
      getCategoriesSync: synchronized('_getCategories'),
  
      _getCategories: function(async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/categories',
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      deleteCategory: promisified('_deleteCategory'),
  
      deleteCategorySync: synchronized('_deleteCategory'),
  
      _deleteCategory: function(name, async) {
        if (!name) {
          throw new Error('Category name is required.');
        }
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
        var result = {};
  
        try {
          result = Backendless._ajax({
            method      : 'DELETE',
            url         : this.restUrl + '/categories/' + name,
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } catch (e) {
          if (e.statusCode == 404) {
            result = false;
          } else {
            throw e;
          }
        }
  
        return (typeof result.result === 'undefined') ? result : result.result;
      },
  
      deletePoint: promisified('_deletePoint'),
  
      deletePointSync: synchronized('_deletePoint'),
  
      _deletePoint: function(point, async) {
        if (!point || Utils.isFunction(point)) {
          throw new Error('Point argument name is required, must be string (object Id), or point object');
        }
  
        var pointId   = Utils.isString(point) ? point : point.objectId,
            responder = Utils.extractResponder(arguments),
            isAsync   = responder != null,
            result    = {};
  
        try {
          result = Backendless._ajax({
            method      : 'DELETE',
            url         : this.restUrl + '/points/' + pointId,
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } catch (e) {
          if (e.statusCode == 404) {
            result = false;
          } else {
            throw e;
          }
        }
  
        return (typeof result.result === 'undefined') ? result : result.result;
      },
  
      getFencePoints: promisified('_getFencePoints'),
  
      getFencePointsSync: synchronized('_getFencePoints'),
  
      _getFencePoints: function(geoFenceName, query, async) {
        query = query || new GeoQuery();
  
        query.geoFence = geoFenceName;
        query.url = this.restUrl;
  
        return this._findUtil(query, async);
      },
  
      /**
       * Count of points
       *
       * @param {(string|GeoQuery)} [fenceName] - fenceName name, or an GeoQuery.
       * @param {GeoQuery} query
       *
       * @return {Promise}
       */
      getGeopointCount: promisified('_getGeopointCount'),
  
      /**
       * Count of points (sync)
       *
       * @param {(string|GeoQuery)} [fenceName] - fenceName name, or an GeoQuery.
       * @param {GeoQuery} query
       *
       * @return {number}
       */
      getGeopointCountSync: synchronized('_getGeopointCount'),
  
      _getGeopointCount: function(fenceName, query, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = !!responder;
        query = this._buildCountQueryObject(arguments, isAsync);
  
        this._validateQueryObject(query);
  
        var url = this.restUrl + '/count?' + this._toQueryParams(query);
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      _buildCountQueryObject: function(args, isAsync) {
        args = isAsync ? Array.prototype.slice.call(args, 0, -1) : args;
  
        var query;
        var fenceName;
  
        if (args.length === 1) {
          query = args[0];
        }
  
        if (args.length === 2) {
          fenceName = args[0];
          query = args[1];
  
          query["geoFence"] = fenceName;
        }
  
        return query;
      },
  
      _runFenceAction: function(action, geoFenceName, geoPoint, async) {
        if (!Utils.isString(geoFenceName)) {
          throw new Error("Invalid value for parameter 'geoFenceName'. Geo Fence Name must be a String");
        }
  
        if (geoPoint && !(geoPoint instanceof Async) && !(geoPoint instanceof GeoPoint) && !geoPoint.objectId) {
          throw new Error("Method argument must be a valid instance of GeoPoint persisted on the server");
        }
  
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null,
            data      = {
              method      : 'POST',
              url         : this.restUrl + '/fence/' + action + '?geoFence=' + geoFenceName,
              isAsync     : isAsync,
              asyncHandler: responder
            };
  
        if (geoPoint) {
          data.data = JSON.stringify(geoPoint);
        }
  
        return Backendless._ajax(data);
      },
  
      runOnStayAction: promisified('_runOnStayAction'),
  
      runOnStayActionSync: synchronized('_runOnStayAction'),
  
      _runOnStayAction: function(geoFenceName, geoPoint, async) {
        return this._runFenceAction('onstay', geoFenceName, geoPoint, async);
      },
  
      runOnExitAction: promisified('_runOnExitAction'),
  
      runOnExitActionSync: synchronized('_runOnExitAction'),
  
      _runOnExitAction: function(geoFenceName, geoPoint, async) {
        return this._runFenceAction('onexit', geoFenceName, geoPoint, async);
      },
  
      runOnEnterAction: promisified('_runOnEnterAction'),
  
      runOnEnterActionSync: synchronized('_runOnEnterAction'),
  
      _runOnEnterAction: function(geoFenceName, geoPoint, async) {
        return this._runFenceAction('onenter', geoFenceName, geoPoint, async);
      },
  
      _getFences: function(geoFence) {
        return Backendless._ajax({
          method: 'GET',
          url   : this.restUrl + '/fences' + ((geoFence) ? '?geoFence=' + geoFence : '')
        });
      },
  
      EARTH_RADIUS: 6378100.0,
  
      _distance: function(lat1, lon1, lat2, lon2) {
        var deltaLon = lon1 - lon2;
        deltaLon = (deltaLon * Math.PI) / 180;
        lat1 = (lat1 * Math.PI) / 180;
        lat2 = (lat2 * Math.PI) / 180;
  
        return this.EARTH_RADIUS * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(deltaLon));
      },
  
      _updateDegree: function(degree) {
        degree += 180;
        while (degree < 0) {
          degree += 360;
        }
  
        return degree === 0 ? 180 : degree % 360 - 180;
      },
  
      _countLittleRadius: function(latitude) {
        var h = Math.abs(latitude) / 180 * this.EARTH_RADIUS;
        var diametre = 2 * this.EARTH_RADIUS;
        var l_2 = (Math.pow(diametre, 2) - diametre * Math.sqrt(Math.pow(diametre, 2) - 4 * Math.pow(h, 2))) / 2;
        return diametre / 2 - Math.sqrt(l_2 - Math.pow(h, 2));
      },
  
      _isDefiniteRect: function(nwPoint, sePoint) {
        return nwPoint != null && sePoint != null;
      },
  
      _getOutRectangle: function() {
        return (arguments.length === 1) ? this._getOutRectangleNodes(arguments[1]) : this._getOutRectangleCircle(arguments[0],
          arguments[1]);
      },
  
      _getOutRectangleCircle: function(center, bounded) {
        var radius = this._distance(center.latitude, center.longitude, bounded.latitude, bounded.longitude);
        var boundLat = center.latitude + (180 * radius) / (Math.PI * this.EARTH_RADIUS) * (center.latitude > 0 ? 1 : -1);
        var littleRadius = this._countLittleRadius(boundLat);
        var westLong, eastLong, northLat, southLat;
  
        if (littleRadius > radius) {
          westLong = center.longitude - (180 * radius) / littleRadius;
          eastLong = 2 * center.longitude - westLong;
          westLong = this._updateDegree(westLong);
          eastLong = eastLong % 360 === 180 ? 180 : this._updateDegree(eastLong);
        } else {
          westLong = -180;
          eastLong = 180;
        }
  
        if (center.latitude > 0) {
          northLat = boundLat;
          southLat = 2 * center.latitude - boundLat;
        } else {
          southLat = boundLat;
          northLat = 2 * center.latitude - boundLat;
        }
  
        return [Math.min(northLat, 90), westLong, Math.max(southLat, -90), eastLong];
      },
  
      _getOutRectangleNodes: function(geoPoints) {
        var nwLat = geoPoints[0].latitude;
        var nwLon = geoPoints[0].longitude;
        var seLat = geoPoints[0].latitude;
        var seLon = geoPoints[0].longitude;
        var minLon = 0, maxLon = 0, lon = 0;
  
        for (var i = 1; i < geoPoints.length; i++) {
          if (geoPoints[i].latitude > nwLat) {
            nwLat = geoPoints[i].latitude;
          }
  
          if (geoPoints[i].latitude < seLat) {
            seLat = geoPoints[i].latitude;
          }
  
          var deltaLon = geoPoints[i].latitude - geoPoints[i - 1].latitude;
  
          if (deltaLon < 0 && deltaLon > -180 || deltaLon > 270) {
            if (deltaLon > 270) {
              deltaLon -= 360;
            }
  
            lon += deltaLon;
  
            if (lon < minLon) {
              minLon = lon;
            }
          } else if (deltaLon > 0 && deltaLon <= 180 || deltaLon <= -270) {
            if (deltaLon <= -270) {
              deltaLon += 360;
            }
  
            lon += deltaLon;
  
            if (lon > maxLon) {
              maxLon = lon;
            }
          }
        }
  
        nwLon += minLon;
        seLon += maxLon;
  
        if (seLon - nwLon >= 360) {
          seLon = 180;
          nwLon = -180;
        } else {
          seLon = this._updateDegree(seLon);
          nwLon = this._updateDegree(nwLon);
        }
  
        return [nwLat, nwLon, seLat, seLon];
      },
  
      _getPointPosition: function(point, first, second) {
        var delta = second.longitude - first.longitude;
  
        if (delta < 0 && delta > -180 || delta > 180) {
          var tmp = first;
          first = second;
          second = tmp;
        }
  
        if (point.latitude < first.latitude === point.latitude < second.latitude) {
          return 'NO_INTERSECT';
        }
  
        var x = point.longitude - first.longitude;
  
        if (x < 0 && x > -180 || x > 180) {
          x = (x - 360) % 360;
        }
  
        var x2 = (second.longitude - first.longitude + 360) % 360;
        var result = x2 * (point.latitude - first.latitude) / (second.latitude - first.latitude) - x;
  
        if (result > 0) {
          return 'INTERSECT';
        }
  
        return 'NO_INTERSECT';
      },
  
      _isPointInRectangular: function(currentPosition, nwPoint, sePoint) {
        if (currentPosition.latitude > nwPoint.latitude || currentPosition.latitude < sePoint.latitude) {
          return false;
        }
  
        if (nwPoint.longitude > sePoint.longitude) {
          return currentPosition.longitude >= nwPoint.longitude || currentPosition.longitude <= sePoint.longitude;
        } else {
          return currentPosition.longitude >= nwPoint.longitude && currentPosition.longitude <= sePoint.longitude;
        }
      },
  
      _isPointInCircle: function(currentPosition, center, radius) {
        return this._distance(currentPosition.latitude, currentPosition.longitude, center.latitude,
            center.longitude) <= radius;
      },
  
      _isPointInShape: function(point, shape) {
        var count = 0;
  
        function getIndex(i, shape) {
          return (i + 1) % shape.length;
        }
  
        for (var i = 0; i < shape.length; i++) {
          var position = this._getPointPosition(point, shape[i], shape[getIndex(i, shape)]);
          switch (position) {
            case 'INTERSECT': {
              count++;
              break;
            }
            case 'ON_LINE':
            case 'NO_INTERSECT':
            default:
              break;
          }
        }
  
        return count % 2 === 1;
      },
  
      _isPointInFence: function(geoPoint, geoFence) {
        return this._isPointInRectangular(geoPoint, geoFence.nwPoint, geoFence.sePoint) ||
          geoFence.type === 'CIRCLE' && this._isPointInCircle(geoPoint, geoFence.nodes[0],
            this._distance(geoFence.nodes[0].latitude, geoFence.nodes[0].longitude, geoFence.nodes[1].latitude,
              geoFence.nodes[1].longitude)) ||
          geoFence.type === 'SHAPE' && this._isPointInShape(geoPoint, geoFence.nodes);
      },
  
      _typesMapper: {
        'RECT'  : function(fence) {
          fence.nwPoint = fence.nodes[0];
          fence.sePoint = fence.nodes[1];
        },
        'CIRCLE': function(fence, self) {
          var outRect = self._getOutRectangle(fence.nodes[0], fence.nodes[1]);
          fence.nwPoint = {
            latitude : outRect[0],
            longitude: outRect[1]
          };
          fence.sePoint = {
            latitude : outRect[2],
            longitude: outRect[3]
          };
        },
        'SHAPE' : function(fence, self) {
          var outRect = self._getOutRectangle(fence.nodes[0], fence.nodes[1]);
          fence.nwPoint = {
            latitude : outRect[0],
            longitude: outRect[1]
          };
          fence.sePoint = {
            latitude : outRect[2],
            longitude: outRect[3]
          };
        }
      },
  
      _maxDuration: 5000,
      _timers     : {},
  
      _checkPosition: function(geofenceName, coords, fences, geoPoint, GeoFenceCallback, lastResults, async) {
        var self = this;
  
        for (var k = 0; k < self._trackedFences.length; k++) {
          var isInFence = self._isDefiniteRect(self._trackedFences[k].nwPoint,
              self._trackedFences[k].sePoint) && self._isPointInFence(coords, self._trackedFences[k]);
          var rule = null;
  
          if (isInFence !== lastResults[self._trackedFences[k].geofenceName]) {
            if (lastResults[self._trackedFences[k].geofenceName]) {
              rule = 'onexit';
            } else {
              rule = 'onenter';
            }
  
            lastResults[self._trackedFences[k].geofenceName] = isInFence;
          }
  
          if (rule) {
            var duration          = self._trackedFences[k].onStayDuration * 1000,
                timeoutFuncInApp  = function(savedK, savedCoords, duration) {
                  var callBack = function() {
                    GeoFenceCallback['onstay'](self._trackedFences[savedK].geofenceName,
                      self._trackedFences[savedK].objectId, savedCoords.latitude, savedCoords.longitude);
                  };
  
                  self._timers[self._trackedFences[savedK].geofenceName] = setTimeout(callBack, duration);
                },
  
                timeoutFuncRemote = function(savedK, savedCoords, duration, geoPoint) {
                  var callBack = function() {
                    self._runFenceAction('onstay', self._trackedFences[savedK].geofenceName, geoPoint,
                      async);
                  };
  
                  self._timers[self._trackedFences[savedK].geofenceName] = setTimeout(callBack, duration);
                };
  
            if (GeoFenceCallback) {
              if (rule === 'onenter') {
                GeoFenceCallback[rule](self._trackedFences[k].geofenceName, self._trackedFences[k].objectId,
                  coords.latitude, coords.longitude);
  
                if (duration > -1) {
                  (function(k, coords, duration) {
                    return timeoutFuncInApp(k, coords, duration);
                  })(k, coords, duration);
                } else {
                  GeoFenceCallback['onstay'](self._trackedFences[k].geofenceName,
                    self._trackedFences[k].objectId, coords.latitude, coords.longitude);
                }
              } else {
                clearTimeout(self._timers[self._trackedFences[k].geofenceName]);
                GeoFenceCallback[rule](self._trackedFences[k].geofenceName, self._trackedFences[k].objectId,
                  coords.latitude, coords.longitude);
              }
            } else if (geoPoint) {
              geoPoint.latitude = coords.latitude;
              geoPoint.longitude = coords.longitude;
  
              if (rule === 'onenter') {
                self._runFenceAction(rule, self._trackedFences[k].geofenceName, geoPoint, async);
  
                if (duration > -1) {
                  (function(k, coords, duration, geoPoint) {
                    return timeoutFuncRemote(k, coords, duration, geoPoint);
                  })(k, coords, duration, geoPoint);
                } else {
                  self._runFenceAction('onstay', self._trackedFences[k].geofenceName, geoPoint, async);
                }
              } else {
                clearTimeout(self._timers[self._trackedFences[k].geofenceName]);
                self._runFenceAction(rule, self._trackedFences[k].geofenceName, geoPoint, async);
              }
            }
          }
        }
      },
  
      _mobilecheck: function() {
        var check = false;
        (function(a) {
          if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,
              4))) {
            check = true;
          }
        })(navigator.userAgent || navigator.vendor || window.opera);
  
        return check;
      },
  
      _trackedFences: [],
      _lastResults  : {},
  
      _startMonitoring: function(geofenceName, secondParam, async) {
        var self = this;
        var isGeoPoint = false;
  
        if (secondParam instanceof GeoPoint) {
          isGeoPoint = true;
        }
  
        var fences = this._getFences(geofenceName);
  
        for (var ii = 0; ii < fences.length; ii++) {
          if (!_containsByPropName(self._trackedFences, fences[ii], "geofenceName")) {
            self._typesMapper[fences[ii].type](fences[ii], self);
            self._lastResults[fences[ii].geofenceName] = false;
            self._trackedFences.push(fences[ii]);
          } else {
            //console.warn(fences[ii].geofenceName + ' cannot be tracked again. This fence is already tracked');
          }
        }
  
        function _containsByPropName(collection, object, name) {
          var length = collection.length,
              result = false;
          for (var i = 0; i < length; i++) {
            if (result = collection[i][name] === object[name]) {
              break;
            }
          }
  
          return result;
        }
  
        function getPosition(position) {
          self._checkPosition(geofenceName, position.coords, fences, (isGeoPoint) ? secondParam : null,
            (!isGeoPoint) ? secondParam : null, self._lastResults, async);
        }
  
        function errorCallback(error) {
          throw new Error('Error during current position calculation. Error ' + error.message);
        }
  
        function getCurPos() {
          navigator.geolocation.getCurrentPosition(getPosition, errorCallback, {
            timeout           : 5000,
            enableHighAccuracy: true
          });
        }
  
        if (!this.monitoringId) {
          if (fences.length) {
            this.monitoringId = (!this._mobilecheck()) ? setInterval(getCurPos,
              self._maxDuration) : navigator.geolocation.watchPosition(getPosition, errorCallback, {
              timeout           : self._maxDuration,
              enableHighAccuracy: true
            });
          } else {
            throw new Error("Please, add some fences to start monitoring");
          }
        }
      },
  
      startGeofenceMonitoringWithInAppCallback: promisified('_startGeofenceMonitoringWithInAppCallback'),
  
      startGeofenceMonitoringWithInAppCallbackSync: synchronized('_startGeofenceMonitoringWithInAppCallback'),
  
      _startGeofenceMonitoringWithInAppCallback: function(geofenceName, inAppCallback, async) {
        this._startMonitoring(geofenceName, inAppCallback, async);
      },
  
      startGeofenceMonitoringWithRemoteCallback: promisified('_startGeofenceMonitoringWithRemoteCallback'),
  
      startGeofenceMonitoringWithRemoteCallbackSync: synchronized('_startGeofenceMonitoringWithRemoteCallback'),
  
      _startGeofenceMonitoringWithRemoteCallback: function(geofenceName, geoPoint, async) {
        this._startMonitoring(geofenceName, geoPoint, async);
      },
  
      stopGeofenceMonitoring: function(geofenceName) {
        var self = this;
        //removed = [];
        if (geofenceName) {
          for (var i = 0; i < self._trackedFences.length; i++) {
            if (self._trackedFences[i].geofenceName == geofenceName) {
              self._trackedFences.splice(i, 1);
              delete self._lastResults[geofenceName];
              //removed.push(geofenceName);
            }
          }
        } else {
          //for (var ii = 0; ii < self._trackedFences.length; ii++) {
          //    removed.push(self._trackedFences[ii].geofenceName)
          //}
          this._lastResuls = {};
          this._trackedFences = [];
        }
        if (!self._trackedFences.length) {
          self.monitoringId = null;
          (!self._mobilecheck()) ? clearInterval(self.monitoringId) : navigator.geolocation.clearWatch(self.monitoringId);
        }
        //removed.length ? console.info('Removed fences: ' + removed.join(", ")) : console.info('No fences are tracked');
      }
    };
  
    function Proxy() {
    }
  
    Proxy.prototype = {
      on       : function(eventName, handler) {
        if (!eventName) {
          throw new Error('Event name not specified');
        }
  
        if (!handler) {
          throw new Error('Handler not specified');
        }
  
        this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
        this.eventHandlers[eventName].push(handler);
      },
      fireEvent: function(eventName, data) {
        var handlers = this.eventHandlers[eventName] || [], len, i;
        for (i = 0, len = handlers.length; i < len; ++i) {
          handlers[i](data);
        }
      }
    };
  
    function PollingProxy(url) {
      this.eventHandlers = {};
      this.restUrl = url;
      this.timer = 0;
      this.timeout = 0;
      this.interval = 1000;
      this.xhr = null;
      this.needReconnect = true;
      this.responder = new Async(this.onMessage, this.onError, this);
      this.poll();
    }
  
    PollingProxy.prototype = new Proxy();
  
    Utils.deepExtend(PollingProxy.prototype, {
      onMessage: function(data) {
        clearTimeout(this.timeout);
        var self = this;
  
        this.timer = setTimeout(function() {
          self.poll();
        }, this.interval);
  
        this.fireEvent('messageReceived', data);
      },
  
      poll: function() {
        var self = this;
  
        this.timeout = setTimeout(function() {
          self.onTimeout();
        }, 30 * 1000);
  
        this.xhr = Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl,
          isAsync     : true,
          asyncHandler: this.responder
        });
      },
  
      close: function() {
        clearTimeout(this.timer);
        clearTimeout(this.timeout);
        this.needReconnect = false;
        this.xhr && this.xhr.abort();
      },
  
      onTimeout: function() {
        this.xhr && this.xhr.abort();
      },
  
      onError: function() {
        clearTimeout(this.timer);
        clearTimeout(this.timeout);
  
        if (this.needReconnect) {
          var self = this;
          this.xhr = null;
  
          this.timer = setTimeout(function() {
            self.poll();
          }, this.interval);
        }
      }
    });
  
    function SocketProxy(url) {
      var self = this;
      this.reconnectWithPolling = true;
  
      try {
        var socket = this.socket = new WebSocket(url);
        socket.onopen = function() {
          return self.sockOpen();
        };
        socket.onerror = function(error) {
          return self.sockError(error);
        };
        socket.onclose = function() {
          self.onSocketClose();
        };
  
        socket.onmessage = function(event) {
          return self.onMessage(event);
        };
      } catch (e) {
        setTimeout(function() {
          self.onSocketClose();
        }, 100);
      }
    }
  
    SocketProxy.prototype = new Proxy();
  
    Utils.deepExtend(SocketProxy.prototype, {
      onMessage: function() {
        this.fireEvent('messageReceived', data);
      },
  
      onSocketClose: function(data) {
        if (this.reconnectWithPolling) {
          this.fireEvent('socketClose', data);
        }
      },
  
      close: function() {
        this.reconnectWithPolling = false;
        this.socket.close();
      }
    });
  
    function Subscription(config) {
      this.channelName = config.channelName;
      this.options = config.options;
      this.channelProperties = config.channelProperties;
      this.subscriptionId = null;
      this.restUrl = config.restUrl + '/' + config.channelName;
      this.responder = config.responder || emptyFn;
      this._subscribe(config.onSubscribe);
    }
  
    Subscription.prototype = {
      _subscribe: function(async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
        var self = this;
  
        var _async = new Async(function(data) {
          self.subscriptionId = data.subscriptionId;
          self._startSubscription();
        }, function(e) {
          responder.fault(e);
        });
  
        var subscription = Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/subscribe',
          isAsync     : isAsync,
          data        : JSON.stringify(this.options),
          asyncHandler: _async
        });
  
        if (!isAsync) {
          this.subscriptionId = subscription.subscriptionId;
          this._startSubscription();
        }
      },
  
      _startSubscription: function() {
        var self = this;
  
        if (WebSocket) {
          var url = this.channelProperties['websocket'] + '/' + this.subscriptionId;
          this.proxy = new SocketProxy(url);
  
          this.proxy.on('socketClose', function() {
            self._switchToPolling();
          });
  
          this.proxy.on('messageReceived', function() {
            self.responder();
          });
        } else {
          this._switchToPolling();
        }
  
        this._startSubscription = emptyFn;
      },
  
      cancelSubscription: function() {
        this.proxy && this.proxy.close();
        this._startSubscription = emptyFn;
      },
  
      _switchToPolling: function() {
        var url = this.restUrl + '/' + this.subscriptionId;
        this.proxy = new PollingProxy(url);
        var self = this;
  
        this.proxy.on('messageReceived', function(data) {
          if (data.messages.length) {
            self.responder(data);
          }
        });
      }
    };
  
    function Messaging() {
      this.restUrl = Backendless.appPath + '/messaging';
      this.channelProperties = {};
    }
  
    Messaging.prototype = {
      _getProperties: function(channelName, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        var props = this.channelProperties[channelName];
  
        if (props) {
          if (isAsync) {
            async.success(props);
          }
  
          return props;
        }
  
        var result = Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/' + channelName + '/properties',
          isAsync     : isAsync,
          asyncHandler: responder
        });
  
        this.channelProperties[channelName] = result;
  
        return result;
      },
  
      subscribe: promisified('_subscribe'),
  
      subscribeSync: synchronized('_subscribe'),
  
      _subscribe: function(channelName, subscriptionCallback, subscriptionOptions, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        if (isAsync) {
          var that = this;
  
          var callback = new Async(function(props) {
            responder.success(new Subscription({
              channelName      : channelName,
              options          : subscriptionOptions,
              channelProperties: props,
              responder        : subscriptionCallback,
              restUrl          : that.restUrl,
              onSubscribe      : responder
            }));
          }, function(data) {
            responder.fault(data);
          });
  
          this._getProperties(channelName, callback);
        } else {
          var props = this._getProperties(channelName);
  
          return new Subscription({
            channelName      : channelName,
            options          : subscriptionOptions,
            channelProperties: props,
            responder        : subscriptionCallback,
            restUrl          : this.restUrl
          });
        }
      },
  
      publish: promisified('_publish'),
  
      publishSync: synchronized('_publish'),
  
      _publish: function(channelName, message, publishOptions, deliveryTarget, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        var data = {
          message: message
        };
  
        if (publishOptions && publishOptions !== responder) {
          if (!(publishOptions instanceof PublishOptions)) {
            throw new Error('Use PublishOption as publishOptions argument');
          }
  
          Utils.deepExtend(data, publishOptions);
        }
  
        if (deliveryTarget && deliveryTarget !== responder) {
          if (!(deliveryTarget instanceof DeliveryOptions)) {
            throw new Error('Use DeliveryOptions as deliveryTarget argument');
          }
  
          Utils.deepExtend(data, deliveryTarget);
        }
  
        return Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/' + channelName,
          isAsync     : isAsync,
          asyncHandler: responder,
          data        : JSON.stringify(data)
        });
      },
  
      sendEmail: promisified('_sendEmail'),
  
      sendEmailSync: synchronized('_sendEmail'),
  
      _sendEmail: function(subject, bodyParts, recipients, attachments, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
        var data = {};
  
        if (subject && !Utils.isEmpty(subject) && Utils.isString(subject)) {
          data.subject = subject;
        } else {
          throw new Error('Subject is required parameter and must be a nonempty string');
        }
  
        if ((bodyParts instanceof Bodyparts) && !Utils.isEmpty(bodyParts)) {
          data.bodyparts = bodyParts;
        } else {
          throw new Error('Use Bodyparts as bodyParts argument, must contain at least one property');
        }
  
        if (recipients && Utils.isArray(recipients) && !Utils.isEmpty(recipients)) {
          data.to = recipients;
        } else {
          throw new Error('Recipients is required parameter, must be a nonempty array');
        }
  
        if (attachments) {
          if (Utils.isArray(attachments)) {
            if (!Utils.isEmpty(attachments)) {
              data.attachment = attachments;
            }
          }
        }
  
        function responseMessageStatus(res) {
          return res.status
        }
  
        return Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/email',
          isAsync     : isAsync,
          asyncHandler: Utils.wrapAsync(responder, responseMessageStatus),
          data        : JSON.stringify(data)
        });
      },
  
      cancel: promisified('_cancel'),
  
      cancelSync: synchronized('_cancel'),
  
      _cancel: function(messageId, async) {
        var isAsync = async != null;
  
        return Backendless._ajax({
          method      : 'DELETE',
          url         : this.restUrl + '/' + messageId,
          isAsync     : isAsync,
          asyncHandler: new Async(emptyFn)
        });
      },
  
      registerDevice: promisified('_registerDevice'),
  
      registerDeviceSync: synchronized('_registerDevice'),
  
      _registerDevice: function(deviceToken, channels, expiration, async) {
        assertDeviceDefined();
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        var data = {
          deviceToken: deviceToken,
          deviceId   : DEVICE.uuid,
          os         : DEVICE.platform,
          osVersion  : DEVICE.version
        };
  
        if (Utils.isArray(channels)) {
          data.channels = channels;
        }
  
        for (var i = 0, len = arguments.length; i < len; ++i) {
          var val = arguments[i];
          if (Utils.isNumber(val) || val instanceof Date) {
            data.expiration = (val instanceof Date) ? val.getTime() / 1000 : val;
          }
        }
  
        Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/registrations',
          data        : JSON.stringify(data),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      getRegistrations: promisified('_getRegistrations'),
  
      getRegistrationsSync: synchronized('_getRegistrations'),
  
      _getRegistrations: function(async) {
        assertDeviceDefined();
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/registrations/' + DEVICE.uuid,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      unregisterDevice: promisified('_unregisterDevice'),
  
      unregisterDeviceSync: synchronized('_unregisterDevice'),
  
      _unregisterDevice: function(async) {
        assertDeviceDefined();
  
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        Backendless._ajax({
          method      : 'DELETE',
          url         : this.restUrl + '/registrations/' + DEVICE.uuid,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      getMessageStatus: promisified('_getMessageStatus'),
  
      getMessageStatusSync: synchronized('_getMessageStatus'),
  
      _getMessageStatus: function(messageId, async) {
        if (!messageId) {
          throw Error('Message ID is required.')
        }
  
        var responder = Utils.extractResponder(arguments);
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/' + messageId,
          isAsync     : !!responder,
          asyncHandler: responder
        });
      }
    };
  
    function getBuilder(filename, filedata, boundary) {
      var dashdash = '--',
          crlf     = '\r\n',
          builder  = '';
  
      builder += dashdash;
      builder += boundary;
      builder += crlf;
      builder += 'Content-Disposition: form-data; name="file"';
      builder += '; filename="' + filename + '"';
      builder += crlf;
  
      builder += 'Content-Type: application/octet-stream';
      builder += crlf;
      builder += crlf;
  
      builder += filedata;
      builder += crlf;
  
      builder += dashdash;
      builder += boundary;
      builder += dashdash;
      builder += crlf;
  
      return builder;
    }
  
    function sendData(options) {
      var async = options.async;
      var encoded = options.encoded;
      var boundary = '-backendless-multipart-form-boundary-' + getNow();
      var xhr = new Backendless.XMLHttpRequest();
  
      var badResponse = function(xhr) {
        var result = {};
  
        try {
          result = JSON.parse(xhr.responseText);
        } catch (e) {
          result.message = xhr.responseText;
        }
  
        result.statusCode = xhr.status;
  
        return result;
      };
  
      xhr.open(options.method, options.url, !!async);
  
      if (encoded) {
        xhr.setRequestHeader('Content-Type', 'text/plain');
      } else {
        xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
      }
  
      if (UIState !== null) {
        xhr.setRequestHeader("uiState", UIState);
      }
  
      var userToken = currentUser && currentUser["user-token"] || Backendless.LocalCache.get("user-token");
  
      if (userToken) {
        xhr.setRequestHeader("user-token", userToken);
      }
  
      if (async) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status) {
            if (xhr.status >= 200 && xhr.status < 300) {
              async.success(JSON.parse(xhr.responseText));
            } else {
              async.fault(JSON.parse(xhr.responseText));
            }
          }
        };
  
        xhr.onerror = Utils.onHttpRequestErrorHandler(xhr, async.fault, badResponse);
      }
  
      xhr.send(encoded ? options.data : Utils.stringToBiteArray(getBuilder(options.fileName, options.data, boundary)));
  
      if (async) {
        return xhr;
      }
  
      if (xhr.status >= 200 && xhr.status < 300) {
        return xhr.responseText ? JSON.parse(xhr.responseText) : true;
      } else {
        throw badResponse(xhr);
      }
    }
  
    function FilePermissions() {
      this.READ = new FilePermission('READ');
      this.DELETE = new FilePermission('DELETE');
      this.WRITE = new FilePermission('WRITE');
    }
  
    function FilePermission(permission) {
      this.permission = permission;
      this.restUrl = Backendless.appPath + '/files/permissions';
    }
  
    FilePermission.prototype = {
      grantUser: promisified('_grantUser'),
  
      grantUserSync: synchronized('_grantUser'),
  
      _grantUser: function(userId, url, async) {
        return this._sendRequest({
          varType  : 'user',
          id       : userId,
          url      : url,
          state    : 'GRANT',
          responder: async
        });
      },
  
      grantRole: promisified('_grantRole'),
  
      grantRoleSync: synchronized('_grantRole'),
  
      _grantRole: function(roleName, url, async) {
        return this._sendRequest({
          varType  : 'role',
          id       : roleName,
          url      : url,
          state    : 'GRANT',
          responder: async
        });
      },
  
      grant: promisified('_grant'),
  
      grantSync: synchronized('_grant'),
  
      _grant: function(url, async) {
        return this._sendRequest({
          varType  : 'user',
          url      : url,
          state    : 'GRANT',
          responder: async
        });
      },
  
      denyUser: promisified('_denyUser'),
  
      denyUserSync: synchronized('_denyUser'),
  
      _denyUser: function(userId, url, async) {
        return this._sendRequest({
          varType  : 'user',
          id       : userId,
          url      : url,
          state    : 'DENY',
          responder: async
        });
      },
  
      denyRole: promisified('_denyRole'),
  
      denyRoleSync: synchronized('_denyRole'),
  
      _denyRole: function(roleName, url, async) {
        return this._sendRequest({
          varType  : 'role',
          id       : roleName,
          url      : url,
          state    : 'DENY',
          responder: async
        });
      },
  
      deny: promisified('_deny'),
  
      denySync: synchronized('_deny'),
  
      _deny: function(url, async) {
        return this._sendRequest({
          varType  : 'user',
          url      : url,
          state    : 'DENY',
          responder: async
        });
      },
  
      _sendRequest: function(options) {
        var type = options.state;
        var url = options.url;
        var responder = options.responder;
        var isAsync = responder != null;
        var data = {
          "permission": this.permission
        };
  
        if (options.varType) {
          data[options.varType] = options.id || "*";
        }
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + '/' + type + '/' + encodeURIComponent(url),
          data        : JSON.stringify(data),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    function Files() {
      this.restUrl = Backendless.appPath + '/files';
    }
  
    Files.prototype = {
  
      saveFile: promisified('_saveFile'),
  
      saveFileSync: synchronized('_saveFile'),
  
      _saveFile: function(path, fileName, fileContent, overwrite, async) {
        if (!path || !Utils.isString(path)) {
          throw new Error('Missing value for the "path" argument. The argument must contain a string value');
        }
  
        if (!fileName || !Utils.isString(path)) {
          throw new Error('Missing value for the "fileName" argument. The argument must contain a string value');
        }
  
        if (overwrite instanceof Async) {
          async = overwrite;
          overwrite = null;
        }
  
        if (typeof File !== 'undefined' && !(fileContent instanceof File)) {
          fileContent = new Blob([fileContent]);
        }
  
        if (fileContent.size > 2800000) {
          throw new Error('File Content size must be less than 2,800,000 bytes');
        }
  
        var baseUrl = this.restUrl + '/binary/' + path + ((Utils.isString(fileName)) ? '/' + fileName : '')
  
        if (overwrite) {
          baseUrl += '?overwrite=true';
        }
  
        fileName = encodeURIComponent(fileName).replace(/'/g, "%27").replace(/"/g, "%22");
  
        function send(content) {
          sendData({
            url     : baseUrl,
            data    : content,
            fileName: fileName,
            encoded : true,
            async   : async,
            method  : 'PUT'
          });
        }
  
        if (typeof Blob !== 'undefined' && fileContent instanceof Blob) {
          var reader = new FileReader();
          reader.fileName = fileName;
          reader.onloadend = function(e) {
            send(e.target.result.split(',')[1])
          };
  
          reader.onerror = function(evn) {
            async.fault(evn);
          };
  
          reader.readAsDataURL(fileContent);
        } else {
          send(fileContent)
        }
  
        if (!async) {
          return true;
        }
      },
  
      upload: promisified('_upload'),
  
      uploadSync: synchronized('_upload'),
  
      _upload: function(files, path, overwrite, async) {
        async = Utils.extractResponder(arguments);
        files = files.files || files;
        var baseUrl = this.restUrl + '/' + path + '/';
        var overwriting = '';
  
        if (Utils.isBoolean(overwrite)) {
          overwriting = "?overwrite=" + overwrite;
        }
  
        if (isBrowser) {
          if (window.File && window.FileList) {
            if (files instanceof File) {
              files = [files];
            }
  
            var filesError = 0;
  
            for (var i = 0, len = files.length; i < len; i++) {
              try {
                var reader = new FileReader();
                var fileName = encodeURIComponent(files[i].name).replace(/'/g, "%27").replace(/"/g, "%22");
                var url = baseUrl + fileName + overwriting;
  
                reader.fileName = fileName;
                reader.onloadend = function(e) {
                  sendData({
                    url     : url,
                    data    : e.target.result,
                    fileName: fileName,
                    async   : async,
                    method  : 'POST'
                  });
                };
  
                reader.onerror = function(evn) {
                  async.fault(evn);
                };
                reader.readAsBinaryString(files[i]);
  
              } catch (err) {
                filesError++;
              }
            }
          }
          else {
            //IE iframe hack
            var ifrm = document.createElement('iframe');
            ifrm.id = ifrm.name = 'ifr' + getNow();
            ifrm.width = ifrm.height = '0';
  
            document.body.appendChild(ifrm);
            var form = document.createElement('form');
            form.target = ifrm.name;
            form.enctype = 'multipart/form-data';
            form.method = 'POST';
            document.body.appendChild(form);
            form.appendChild(files);
            var fileName = encodeURIComponent(files.value).replace(/'/g, "%27").replace(/"/g, "%22"),
                index    = fileName.lastIndexOf('\\');
  
            if (index) {
              fileName = fileName.substring(index + 1);
            }
            form.action = baseUrl + fileName + overwriting;
            form.submit();
          }
        } else {
          throw new Error('Upload File not supported with NodeJS');
        }
      },
  
      listing: promisified('_listing'),
  
      listingSync: synchronized('_listing'),
  
      _listing: function(path, pattern, recursively, pagesize, offset, async) {
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null,
            url       = this.restUrl + '/' + path;
  
        if ((arguments.length > 1) && !(arguments[1] instanceof Async)) {
          url += "?";
        }
  
        if (Utils.isString(pattern)) {
          url += ("pattern=" + pattern);
        }
  
        if (Utils.isBoolean(recursively)) {
          url += ("&sub=" + recursively);
        }
  
        if (Utils.isNumber(pagesize)) {
          url += "&pagesize=" + pagesize;
        }
  
        if (Utils.isNumber(offset)) {
          url += "&offset=" + offset;
        }
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      renameFile: promisified('_renameFile'),
  
      renameFileSync: synchronized('_renameFile'),
  
      _renameFile: function(oldPathName, newName, async) {
        this._checkPath(oldPathName);
  
        var parameters = {
          oldPathName: oldPathName,
          newName    : newName
        };
  
        return this._doAction("rename", parameters, async);
      },
  
      moveFile: promisified('_moveFile'),
  
      moveFileSync: synchronized('_moveFile'),
  
      _moveFile: function(sourcePath, targetPath, async) {
        this._checkPath(sourcePath);
        this._checkPath(targetPath);
  
        var parameters = {
          sourcePath: sourcePath,
          targetPath: targetPath
        };
  
        return this._doAction("move", parameters, async);
      },
  
      copyFile: promisified('_copyFile'),
  
      copyFileSync: synchronized('_copyFile'),
  
      _copyFile: function(sourcePath, targetPath, async) {
        this._checkPath(sourcePath);
        this._checkPath(targetPath);
  
        var parameters = {
          sourcePath: sourcePath,
          targetPath: targetPath
        };
  
        return this._doAction("copy", parameters, async);
      },
  
      _checkPath: function(path) {
        if (!(/^\//).test(path)) {
          path = "/" + path;
        }
  
        return path;
      },
  
      _doAction: function(actionType, parameters, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = !!responder;
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + '/' + actionType,
          data        : JSON.stringify(parameters),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      remove: promisified('_remove'),
  
      removeSync: synchronized('_remove'),
  
      _remove: function(fileURL, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
        var url = fileURL.indexOf("http://") === 0 || fileURL.indexOf("https://") === 0 ? fileURL : this.restUrl + '/' + fileURL;
  
        Backendless._ajax({
          method      : 'DELETE',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      exists: promisified('_exists'),
  
      existsSync: synchronized('_exists'),
  
      _exists: function(path, async) {
        if (!path || !Utils.isString(path)) {
          throw new Error('Missing value for the "path" argument. The argument must contain a string value');
        }
  
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null,
            url       = this.restUrl + '/' + path + '?action=exists';
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      removeDirectory: promisified('_removeDirectory'),
  
      removeDirectorySync: synchronized('_removeDirectory'),
  
      _removeDirectory: function(path, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = responder != null;
  
        return Backendless._ajax({
          method      : 'DELETE',
          url         : this.restUrl + '/' + path,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      /**
       * Count of files
       *
       * @param {string} path
       * @param {string} [pattern]
       * @param {boolean} [recursive]
       * @param {boolean} [countDirectories]
       *
       * @return {Promise}
       */
      getFileCount: promisified('_getFileCount'),
  
      /**
       * Count of files (sync)
       *
       * @param {string} path
       * @param {string} [pattern]
       * @param {boolean} [recursive]
       * @param {boolean} [countDirectories]
       *
       * @return {number}
       */
      getFileCountSync: synchronized('_getFileCount'),
  
      _getFileCount: function(path, pattern, recursive, countDirectories, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync = !!responder;
        var query = this._buildCountQueryObject(arguments, isAsync);
  
        this._validateCountQueryObject(query);
  
        delete query.path;
  
        var url = this.restUrl + '/' + path + '?' + Utils.toQueryParams(query);
  
        return Backendless._ajax({
          method      : 'GET',
          url         : url,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      _buildCountQueryObject: function(args, isAsync) {
        args = isAsync ? Array.prototype.slice.call(args, 0, -1) : args;
  
        return {
          action          : 'count',
          path            : args[0],
          pattern         : args[1] !== undefined ? args[1] : '*',
          recursive       : args[2] !== undefined ? args[2] : false,
          countDirectories: args[3] !== undefined ? args[3] : false
        };
      },
  
      _validateCountQueryObject: function(query) {
        if (!query.path || !Utils.isString(query.path)) {
          throw new Error('Missing value for the "path" argument. The argument must contain a string value');
        }
  
        if (!query.pattern || !Utils.isString(query.pattern)) {
          throw new Error('Missing value for the "pattern" argument. The argument must contain a string value');
        }
  
        if (!Utils.isBoolean(query.recursive)) {
          throw new Error('Missing value for the "recursive" argument. The argument must contain a boolean value');
        }
  
        if (!Utils.isBoolean(query.countDirectories)) {
          throw new Error('Missing value for the "countDirectories" argument. The argument must contain a boolean value');
        }
      }
    };
  
    function Commerce() {
      this.restUrl = Backendless.appPath + '/commerce/googleplay';
    }
  
    Commerce.prototype = {
  
      validatePlayPurchase: promisified('_validatePlayPurchase'),
  
      validatePlayPurchaseSync: synchronized('_validatePlayPurchase'),
  
      _validatePlayPurchase: function(packageName, productId, token, async) {
        if (arguments.length < 3) {
          throw new Error('Package Name, Product Id, Token must be provided and must be not an empty STRING!');
        }
  
        for (var i = arguments.length - 2; i >= 0; i--) {
          if (!arguments[i] || !Utils.isString(arguments[i])) {
            throw new Error('Package Name, Product Id, Token must be provided and must be not an empty STRING!');
          }
        }
  
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null;
  
        if (responder) {
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/validate/' + packageName + '/inapp/' + productId + '/purchases/' + token,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      cancelPlaySubscription: promisified('_cancelPlaySubscription'),
  
      cancelPlaySubscriptionSync: synchronized('_cancelPlaySubscription'),
  
      _cancelPlaySubscription: function(packageName, subscriptionId, token, Async) {
        if (arguments.length < 3) {
          throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
        }
  
        for (var i = arguments.length - 2; i >= 0; i--) {
          if (!arguments[i] || !Utils.isString(arguments[i])) {
            throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
          }
        }
  
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null;
  
        if (responder) {
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/' + packageName + '/subscription/' + subscriptionId + '/purchases/' + token + '/cancel',
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      getPlaySubscriptionStatus: promisified('_getPlaySubscriptionStatus'),
  
      getPlaySubscriptionStatusSync: synchronized('_getPlaySubscriptionStatus'),
  
      _getPlaySubscriptionStatus: function(packageName, subscriptionId, token, Async) {
        if (arguments.length < 3) {
          throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
        }
  
        for (var i = arguments.length - 2; i >= 0; i--) {
          if (!arguments[i] || !Utils.isString(arguments[i])) {
            throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
          }
        }
  
        var responder = Utils.extractResponder(arguments),
            isAsync   = responder != null;
  
        if (responder) {
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + '/' + packageName + '/subscription/' + subscriptionId + '/purchases/' + token,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    function Events() {
      this.restUrl = Backendless.appPath + '/servercode/events';
    }
  
    Events.prototype = {
      dispatch: promisified('_dispatch'),
  
      dispatchSync: synchronized('_dispatch'),
  
      _dispatch: function(eventname, eventArgs) {
        if (!eventname || !Utils.isString(eventname)) {
          throw new Error('Event Name must be provided and must be not an empty STRING!');
        }
  
        eventArgs = (Utils.isObject(eventArgs) && !(eventArgs instanceof Async)) ? eventArgs : {};
  
        var responder = Utils.extractResponder(arguments);
  
        if (responder) {
          responder = Utils.wrapAsync(responder);
        }
  
        eventArgs = eventArgs instanceof Async ? {} : eventArgs;
  
        return Backendless._ajax({
          method      : 'POST',
          url         : this.restUrl + '/' + eventname,
          data        : JSON.stringify(eventArgs),
          isAsync     : responder != null,
          asyncHandler: responder
        });
      }
    };
  
    var Cache = function() {
      this.restUrl = Backendless.appPath + '/cache/';
    };
  
    var FactoryMethods = {};
  
    Cache.prototype = {
      put: promisified('_put'),
  
      putSync: synchronized('_put'),
  
      _put: function(key, value, timeToLive, async) {
        if (!Utils.isString(key)) {
          throw new Error('You can use only String as key to put into Cache');
        }
  
        if (!(timeToLive instanceof Async)) {
          if (typeof timeToLive === 'object' && !arguments[3]) {
            async = timeToLive;
            timeToLive = null;
          } else if (typeof timeToLive !== ('number' || 'string') && timeToLive != null) {
            throw new Error('You can use only String as timeToLive attribute to put into Cache');
          }
        } else {
          async = timeToLive;
          timeToLive = null;
        }
  
        if (Utils.isObject(value) && value.constructor !== Object) {
          value.___class = value.___class || Utils.getClassName(value);
        }
  
        var responder = Utils.extractResponder([async]), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + key + ((timeToLive) ? '?timeout=' + timeToLive : ''),
          data        : JSON.stringify(value),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      expireIn: promisified('_expireIn'),
  
      expireInSync: synchronized('_expireIn'),
  
      _expireIn: function(key, seconds, async) {
        if (Utils.isString(key) && (Utils.isNumber(seconds) || Utils.isDate(seconds)) && seconds) {
          seconds = (Utils.isDate(seconds)) ? seconds.getTime() : seconds;
          var responder = Utils.extractResponder(arguments), isAsync = false;
          if (responder != null) {
            isAsync = true;
            responder = Utils.wrapAsync(responder);
          }
  
          return Backendless._ajax({
            method      : 'PUT',
            url         : this.restUrl + key + '/expireIn?timeout=' + seconds,
            data        : JSON.stringify({}),
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } else {
          throw new Error('The "key" argument must be String. The "seconds" argument can be either Number or Date');
        }
      },
  
      expireAt: promisified('_expireAt'),
  
      expireAtSync: synchronized('_expireAt'),
  
      _expireAt: function(key, timestamp, async) {
        if (Utils.isString(key) && (Utils.isNumber(timestamp) || Utils.isDate(timestamp)) && timestamp) {
          timestamp = (Utils.isDate(timestamp)) ? timestamp.getTime() : timestamp;
          var responder = Utils.extractResponder(arguments), isAsync = false;
          if (responder != null) {
            isAsync = true;
            responder = Utils.wrapAsync(responder);
          }
  
          return Backendless._ajax({
            method      : 'PUT',
            url         : this.restUrl + key + '/expireAt?timestamp=' + timestamp,
            data        : JSON.stringify({}),
            isAsync     : isAsync,
            asyncHandler: responder
          });
        } else {
          throw new Error('You can use only String as key while expire in Cache. Second attribute must be declared and must be a Number or Date type');
        }
      },
  
      _cacheMethod: function(method, key, contain, async) {
        if (!Utils.isString(key)) {
          throw new Error('The "key" argument must be String');
        }
  
        var responder = Utils.extractResponder(arguments), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : method,
          url         : this.restUrl + key + (contain ? '/check' : ''),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      contains: promisified('_contains'),
  
      containsSync: synchronized('_contains'),
  
      _contains: function(key, async) {
        return this._cacheMethod('GET', key, true, async);
      },
  
      get: promisified('_get'),
  
      getSync: synchronized('_get'),
  
      _get: function(key, async) {
        if (!Utils.isString(key)) {
          throw new Error('The "key" argument must be String');
        }
  
        function parseResult(result) {
          var className = result && result.___class;
  
          if (className) {
            var clazz = FactoryMethods[className] || root[className];
  
            if (clazz) {
              result = new clazz(result);
            }
          }
  
          return result;
        }
  
        var responder = Utils.extractResponder(arguments), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder, parseResult, this);
        }
  
        var result = Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + key,
          isAsync     : isAsync,
          asyncHandler: responder
        });
  
        return isAsync ? result : parseResult(result);
      },
  
      remove: promisified('_remove'),
  
      removeSync: synchronized('_remove'),
  
      _remove: function(key, async) {
        return this._cacheMethod('DELETE', key, false, async);
      },
  
      setObjectFactory: function(objectName, factoryMethod) {
        FactoryMethods[objectName] = factoryMethod;
      }
    };
  
    var Counter = function(name, restUrl) {
      this._nameValidation(name);
  
      this.restUrl = restUrl;
      this.name = name;
    };
  
    Counter.prototype = {
      _nameValidation: function(name) {
        if (!name) {
          throw new Error('Missing value for the "counterName" argument. The argument must contain a string value.');
        }
  
        if (!Utils.isString(name)) {
          throw new Error('Invalid value for the "value" argument. The argument must contain only string values');
        }
      },
  
      _implementMethod: function(method, urlPart, async) {
        var responder = Utils.extractResponder(arguments);
  
        if (responder != null) {
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : method,
          url         : this.restUrl + this.name + urlPart,
          isAsync     : !!responder,
          asyncHandler: responder
        });
      },
  
      _implementMethodWithValue: function(urlPart, value, async) {
        if (!value) {
          throw new Error('Missing value for the "value" argument. The argument must contain a numeric value.');
        }
  
        if (!Utils.isNumber(value)) {
          throw new Error('Invalid value for the "value" argument. The argument must contain only numeric values');
        }
  
        var responder = Utils.extractResponder(arguments), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + this.name + urlPart + ((value) ? value : ''),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      incrementAndGet: promisified('_incrementAndGet'),
  
      incrementAndGetSync: synchronized('_incrementAndGet'),
  
      _incrementAndGet: function(async) {
        return this._implementMethod('PUT', '/increment/get', async);
      },
  
      getAndIncrement: promisified('_getAndIncrement'),
  
      getAndIncrementSync: synchronized('_getAndIncrement'),
  
      _getAndIncrement: function(async) {
        return this._implementMethod('PUT', '/get/increment', async);
      },
  
      decrementAndGet: promisified('_decrementAndGet'),
  
      decrementAndGetSync: synchronized('_decrementAndGet'),
  
      _decrementAndGet: function(async) {
        return this._implementMethod('PUT', '/decrement/get', async);
      },
  
      getAndDecrement: promisified('_getAndDecrement'),
  
      getAndDecrementSync: synchronized('_getAndDecrement'),
  
      _getAndDecrement: function(async) {
        return this._implementMethod('PUT', '/get/decrement', async);
      },
  
      reset: promisified('_reset'),
  
      resetSync: synchronized('_reset'),
  
      _reset: function(async) {
        return this._implementMethod('PUT', '/reset', async);
      },
  
      get: promisified('_get'),
  
      getSync: synchronized('_get'),
  
      _get: function(async) {
        var responder = Utils.extractResponder(arguments), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'GET',
          url         : this.restUrl + this.name,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      },
  
      addAndGet: promisified('_addAndGet'),
  
      addAndGetSync: synchronized('_addAndGet'),
  
      _addAndGet: function(value, async) {
        return this._implementMethodWithValue('/incrementby/get?value=', value, async);
      },
  
      getAndAdd: promisified('_getAndAdd'),
  
      getAndAddSync: synchronized('_getAndAdd'),
  
      _getAndAdd: function(value, async) {
        return this._implementMethodWithValue('/get/incrementby?value=', value, async);
      },
  
      compareAndSet: promisified('_compareAndSet'),
  
      compareAndSetSync: synchronized('_compareAndSet'),
  
      _compareAndSet: function(expected, updated, async) {
        if (null == expected || null == updated) {
          throw new Error('Missing values for the "expected" and/or "updated" arguments. The arguments must contain numeric values');
        }
  
        if (!Utils.isNumber(expected) || !Utils.isNumber(updated)) {
          throw new Error('Missing value for the "expected" and/or "updated" arguments. The arguments must contain a numeric value');
        }
  
        var responder = Utils.extractResponder(arguments), isAsync = false;
  
        if (responder != null) {
          isAsync = true;
          responder = Utils.wrapAsync(responder);
        }
  
        return Backendless._ajax({
          method      : 'PUT',
          url         : this.restUrl + this.name + '/get/compareandset?expected=' + expected + '&updatedvalue=' + updated,
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    var Counters = function() {
      this.restUrl = Backendless.appPath + '/counters/';
    };
  
    Counters.prototype = {
      of: function(name) {
        return new Counter(name, this.restUrl);
      }
    };
  
    for (var methodName in Counter.prototype) {
      if (Counter.prototype.hasOwnProperty(methodName) && methodName[0] !== '_') {
        Counters.prototype[methodName] = createCounterMethodInvoker(methodName);
      }
    }
  
    function createCounterMethodInvoker(methodName) {
      return function(name) {
        var counter = this.of(name);
        var args = Array.prototype.slice.call(arguments, 1);
  
        return counter[methodName].apply(counter, args);
      }
    }
  
    var lastFlushListeners;
  
    Backendless.Logging = {
      restUrl      : root.url,
      loggers      : {},
      logInfo      : [],
      messagesCount: 0,
      numOfMessages: 10,
      timeFrequency: 1,
      getLogger    : function(loggerName) {
        if (!Utils.isString(loggerName)) {
          throw new Error("Invalid 'loggerName' value. LoggerName must be a string value");
        }
  
        if (!this.loggers[loggerName]) {
          this.loggers[loggerName] = new Logging(loggerName);
        }
  
        return this.loggers[loggerName];
      },
  
      flush: promisified('_flush'),
  
      flushSync: synchronized('_flush'),
  
      _flush: function() {
        var async = Utils.extractResponder(arguments);
  
        if (this.logInfo.length) {
          this.flushInterval && clearTimeout(this.flushInterval);
  
          var listeners;
          var cb = function(method) {
            return function() {
              for (var i = 0; i < listeners.length; i++) {
                listeners[i][method].apply(null, arguments);
              }
  
              if (listeners === lastFlushListeners) {
                lastFlushListeners = null;
              }
            }
          };
  
          if (async) {
            listeners = lastFlushListeners = lastFlushListeners ? lastFlushListeners.splice(0) : [];
            listeners.push(async);
          }
  
          Backendless._ajax({
            method      : 'PUT',
            isAsync     : !!async,
            asyncHandler: async && new Async(cb('success'), cb('fault')),
            url         : Backendless.appPath + '/log',
            data        : JSON.stringify(this.logInfo)
          });
  
          this.logInfo = [];
          this.messagesCount = 0;
        } else if (async) {
          if (lastFlushListeners) {
            lastFlushListeners.push(async);
          } else {
            setTimeout(async.success, 0);
          }
        }
      },
  
      sendRequest: function() {
        var logging = this;
  
        this.flushInterval = setTimeout(function() {
          logging.flush();
        }, this.timeFrequency * 1000);
      },
  
      checkMessagesLen: function() {
        if (this.messagesCount > (this.numOfMessages - 1)) {
          this.sendRequest();
        }
      },
  
      setLogReportingPolicy: function(numOfMessages, timeFrequency) {
        this.numOfMessages = numOfMessages;
        this.timeFrequency = timeFrequency;
        this.checkMessagesLen();
      }
    };
  
    function Logging(name) {
      this.name = name;
    }
  
    function setLogMessage(logger, logLevel, message, exception) {
      var messageObj = {};
      messageObj['message'] = message;
      messageObj['timestamp'] = Date.now();
      messageObj['exception'] = (exception) ? exception : null;
      messageObj['logger'] = logger;
      messageObj['log-level'] = logLevel;
      Backendless.Logging.logInfo.push(messageObj);
      Backendless.Logging.messagesCount++;
      Backendless.Logging.checkMessagesLen();
    }
  
    Logging.prototype = {
      debug: function(message) {
        return setLogMessage(this.name, "DEBUG", message);
      },
      info : function(message) {
        return setLogMessage(this.name, "INFO", message);
      },
      warn : function(message, exception) {
        return setLogMessage(this.name, "WARN", message, exception);
      },
      error: function(message, exception) {
        return setLogMessage(this.name, "ERROR", message, exception);
      },
      fatal: function(message, exception) {
        return setLogMessage(this.name, "FATAL", message, exception);
      },
      trace: function(message) {
        return setLogMessage(this.name, "TRACE", message);
      }
    };
  
    function CustomServices() {
      this.restUrl = Backendless.appPath + '/services/';
    }
  
    CustomServices.prototype = {
      invoke: promisified('_invoke'),
  
      invokeSync: synchronized('_invoke'),
  
      _invoke: function(serviceName, method, parameters, async) {
        var responder = Utils.extractResponder(arguments);
        var isAsync   = responder != null;
  
        return Backendless._ajax({
          method      : "POST",
          url         : this.restUrl + [serviceName, method].join('/'),
          data        : JSON.stringify(parameters),
          isAsync     : isAsync,
          asyncHandler: responder
        });
      }
    };
  
    function promisified(methodName) {
      return function() {
        var args = [].slice.call(arguments);
        var context = this;
        var fn = context[methodName];
  
        return new Promise(function(resolve, reject) {
          args.push(new Async(resolve, reject, context));
          fn.apply(context, args);
        });
      };
    }
  
    function synchronized(methodName) {
      return function() {
        console.warn('Using of sync methods is an outdated approach. Please, use async methods.');
  
        var context = this;
        var fn = context[methodName];
  
        return fn.apply(context, arguments);
      };
    }
  
    function assertDeviceDefined() {
      if (!DEVICE) {
        throw new Error('Device is not defined. Please, run the Backendless.setupDevice');
      }
    }
  
    Backendless.initApp = function(appId, secretKey) {
      Backendless.applicationId = appId;
      Backendless.secretKey = secretKey;
      Backendless.appPath = [Backendless.serverURL, appId, secretKey].join('/');
      Backendless.UserService = new UserService();
      Backendless.Users = Backendless.UserService;
      Backendless.Geo = new Geo();
      Backendless.Persistence = persistence;
      Backendless.Data = persistence;
      Backendless.Data.Permissions = new DataPermissions();
      Backendless.Messaging = new Messaging();
      Backendless.Files = new Files();
      Backendless.Files.Permissions = new FilePermissions();
      Backendless.Commerce = new Commerce();
      Backendless.Events = new Events();
      Backendless.Cache = new Cache();
      Backendless.Counters = new Counters();
      Backendless.CustomServices = new CustomServices();
      dataStoreCache = {};
      currentUser = null;
    };
  
    Backendless.setupDevice = function(deviceProps) {
      if (!deviceProps || !deviceProps.uuid || !deviceProps.platform || !deviceProps.version) {
        throw new Error('Device properties object must consist of fields "uuid", "platform" and "version".');
      }
  
      DEVICE = {
        uuid    : deviceProps.uuid,
        platform: deviceProps.platform.toUpperCase(),
        version : deviceProps.version
      };
    };
  
    var DataQuery = function(args) {
      args = args || {};
  
      this.properties = args.properties || [];
      this.condition = args.condition || null;
      this.options = args.options || null;
      this.url = args.url || null;
    };
  
    DataQuery.prototype = {
      addProperty: function(prop) {
        this.properties = this.properties || [];
        this.properties.push(prop);
      },
  
      setOption: function(name, value) {
        this.options = this.options || {};
  
        this.options[name] = value;
      },
  
      setOptions: function(options) {
        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            this.setOption(key, options[key]);
          }
        }
      },
  
      getOption: function(name) {
        return this.options && this.options[name];
      }
    };
  
    var PAGING_DEFAULTS = {
      pageSize: 10,
      offset  : 0
    };
  
    var PagingQueryBuilder = function() {
      this.offset = PAGING_DEFAULTS.offset;
      this.pageSize = PAGING_DEFAULTS.pageSize;
    };
  
    PagingQueryBuilder.prototype = {
      setPageSize: function(pageSize) {
        if (pageSize <= 0) {
          return 'Page size must be a positive value.';
        }
  
        this.pageSize = pageSize;
  
        return this;
      },
  
      setOffset: function(offset) {
        if (offset < 0) {
          throw new Error('Offset cannot have a negative value.');
        }
  
        this.offset = offset;
  
        return this;
      },
  
      prepareNextPage: function() {
        this.setOffset(this.offset + this.pageSize);
  
        return this;
      },
  
      preparePreviousPage: function() {
        var newOffset = this.offset > this.pageSize ? this.offset - this.pageSize : 0;
  
        this.setOffset(newOffset);
  
        return this;
      },
  
      build: function() {
        return {
          pageSize: this.pageSize,
          offset  : this.offset
        }
      }
    };
  
    var DataQueryBuilder = function() {
      this._query = new DataQuery();
      this._paging = new PagingQueryBuilder();
    };
  
    DataQueryBuilder.create = function() {
      return new DataQueryBuilder();
    };
  
    DataQueryBuilder.prototype = {
      setPageSize: function(pageSize) {
        this._paging.setPageSize(pageSize);
        return this;
      },
  
      setOffset: function(offset) {
        this._paging.setOffset(offset);
        return this;
      },
  
      prepareNextPage: function() {
        this._paging.prepareNextPage();
  
        return this;
      },
  
      preparePreviousPage: function() {
        this._paging.preparePreviousPage();
  
        return this;
      },
  
      getProperties: function() {
        return this._query.properties;
      },
  
      setProperties: function(properties) {
        this._query.properties = Utils.castArray(properties);
        return this;
      },
  
      addProperty: function(property) {
        this._query.addProperty(property);
        return this;
      },
  
      getWhereClause: function() {
        return this._query.condition;
      },
  
      setWhereClause: function(whereClause) {
        this._query.condition = whereClause;
        return this;
      },
  
      getSortBy: function() {
        return this._query.getOption('sortBy');
      },
  
      setSortBy: function(sortBy) {
        this._query.setOption('sortBy', Utils.castArray(sortBy));
  
        return this;
      },
  
      getRelated: function() {
        return this._query.getOption('relations');
      },
  
      setRelated: function(relations) {
        this._query.setOption('relations', Utils.castArray(relations));
  
        return this;
      },
  
      getRelationsDepth: function() {
        return this._query.getOption('relationsDepth');
      },
  
      setRelationsDepth: function(relationsDepth) {
        this._query.setOption('relationsDepth', relationsDepth);
        return this;
      },
  
      build: function() {
        this._query.setOptions(this._paging.build());
  
        return this._query;
      }
    };
  
    var LoadRelationsQueryBuilder = function(RelationModel) {
      this._query = new DataQuery();
      this._query.relationModel = RelationModel;
      this._paging = new PagingQueryBuilder();
    };
  
    LoadRelationsQueryBuilder.create = function() {
      return new LoadRelationsQueryBuilder();
    };
  
    LoadRelationsQueryBuilder.of = function(RelationModel) {
      return new LoadRelationsQueryBuilder(RelationModel);
    };
  
    LoadRelationsQueryBuilder.prototype = {
      setRelationName: function(relationName) {
        this._query.setOption('relationName', relationName);
        return this;
      },
  
      setPageSize: function(pageSize) {
        this._paging.setPageSize(pageSize);
        return this;
      },
  
      setOffset: function(offset) {
        this._paging.setOffset(offset);
        return this;
      },
  
      prepareNextPage: function() {
        this._paging.prepareNextPage();
  
        return this;
      },
  
      preparePreviousPage: function() {
        this._paging.preparePreviousPage();
  
        return this;
      },
  
      setWhereClause: function(whereClause) {
        this._query.condition = whereClause;
        return this;
      },
  
      build: function() {
        this._query.setOptions(this._paging.build());
  
        return this._query;
      }
    };
  
    var GeoQuery = function(args) {
      args = args || {};
  
      this.searchRectangle = args.searchRectangle || undefined;
      this.categories = args.categories || [];
      this.includeMetadata = args.includeMetadata || true;
      this.metadata = args.metadata || undefined;
      this.condition = args.condition || undefined;
      this.relativeFindMetadata = args.relativeFindMetadata || undefined;
      this.relativeFindPercentThreshold = args.relativeFindPercentThreshold || undefined;
      this.pageSize = args.pageSize || undefined;
      this.latitude = args.latitude || undefined;
      this.longitude = args.longitude || undefined;
      this.radius = args.radius || undefined;
      this.units = args.units || undefined;
      this.degreePerPixel = args.degreePerPixel || undefined;
      this.clusterGridSize = args.clusterGridSize || undefined;
    };
  
    GeoQuery.prototype = {
      addCategory: function() {
        this.categories = this.categories || [];
        this.categories.push();
      },
  
      setClusteringParams: function(westLongitude, eastLongitude, mapWidth, clusterGridSize) {
        clusterGridSize = clusterGridSize || 0;
        var parsedWestLongitude   = parseFloat(westLongitude),
            parsedEastLongitude   = parseFloat(eastLongitude),
            parsedMapWidth        = parseInt(mapWidth),
            parsedClusterGridSize = parseInt(clusterGridSize);
  
        if (!isFinite(parsedWestLongitude) || parsedWestLongitude < -180 || parsedWestLongitude > 180) {
          throw new Error("The westLongitude value must be a number in the range between -180 and 180");
        }
  
        if (!isFinite(parsedEastLongitude) || parsedEastLongitude < -180 || parsedEastLongitude > 180) {
          throw new Error("The eastLongitude value must be a number in the range between -180 and 180");
        }
  
        if (!isFinite(parsedMapWidth) || parsedMapWidth < 1) {
          throw new Error("The mapWidth value must be a number greater or equal to 1");
        }
  
        if (!isFinite(parsedClusterGridSize) || parsedClusterGridSize < 0) {
          throw new Error("The clusterGridSize value must be a number greater or equal to 0");
        }
  
        var longDiff = parsedEastLongitude - parsedWestLongitude;
  
        (longDiff < 0) && (longDiff += 360);
  
        this.degreePerPixel = longDiff / parsedMapWidth;
        this.clusterGridSize = parsedClusterGridSize || null;
      }
    };
  
    var GeoPoint = function(args) {
      args = args || {};
      this.___class = "GeoPoint";
      this.categories = args.categories;
      this.latitude = args.latitude;
      this.longitude = args.longitude;
      this.metadata = args.metadata;
      this.objectId = args.objectId;
      this.distance = args.distance;
    };
  
    var GeoCluster = function(args) {
      args = args || {};
      this.categories = args.categories;
      this.latitude = args.latitude;
      this.longitude = args.longitude;
      this.metadata = args.metadata;
      this.objectId = args.objectId;
      this.totalPoints = args.totalPoints;
      this.geoQuery = args.geoQuery;
      this.distance = args.distance;
    };
  
    var PublishOptionsHeaders = { //PublishOptions headers namespace helper
      'MESSAGE_TAG'                  : 'message',
      'IOS_ALERT_TAG'                : 'ios-alert',
      'IOS_BADGE_TAG'                : 'ios-badge',
      'IOS_SOUND_TAG'                : 'ios-sound',
      'ANDROID_TICKER_TEXT_TAG'      : 'android-ticker-text',
      'ANDROID_CONTENT_TITLE_TAG'    : 'android-content-title',
      'ANDROID_CONTENT_TEXT_TAG'     : 'android-content-text',
      'ANDROID_ACTION_TAG'           : 'android-action',
      'WP_TYPE_TAG'                  : 'wp-type',
      'WP_TITLE_TAG'                 : 'wp-title',
      'WP_TOAST_SUBTITLE_TAG'        : 'wp-subtitle',
      'WP_TOAST_PARAMETER_TAG'       : 'wp-parameter',
      'WP_TILE_BACKGROUND_IMAGE'     : 'wp-backgroundImage',
      'WP_TILE_COUNT'                : 'wp-count',
      'WP_TILE_BACK_TITLE'           : 'wp-backTitle',
      'WP_TILE_BACK_BACKGROUND_IMAGE': 'wp-backImage',
      'WP_TILE_BACK_CONTENT'         : 'wp-backContent',
      'WP_RAW_DATA'                  : 'wp-raw'
    };
  
    var PublishOptions = function(args) {
      args = args || {};
      this.publisherId = args.publisherId || undefined;
      this.headers = args.headers || undefined;
      this.subtopic = args.subtopic || undefined;
    };
  
    var DeliveryOptions = function(args) {
      args = args || {};
      this.publishPolicy = args.publishPolicy || undefined;
      this.pushBroadcast = args.pushBroadcast || undefined;
      this.pushSinglecast = args.pushSinglecast || undefined;
      this.publishAt = args.publishAt || undefined;
      this.repeatEvery = args.repeatEvery || undefined;
      this.repeatExpiresAt = args.repeatExpiresAt || undefined;
    };
  
    var Bodyparts = function(args) {
      args = args || {};
      this.textmessage = args.textmessage || undefined;
      this.htmlmessage = args.htmlmessage || undefined;
    };
  
    var SubscriptionOptions = function(args) {
      args = args || {};
      this.subscriberId = args.subscriberId || undefined;
      this.subtopic = args.subtopic || undefined;
      this.selector = args.selector || undefined;
    };
  
    Backendless.DataQueryBuilder = DataQueryBuilder;
    Backendless.LoadRelationsQueryBuilder = LoadRelationsQueryBuilder;
    Backendless.GeoQuery = GeoQuery;
    Backendless.GeoPoint = GeoPoint;
    Backendless.GeoCluster = GeoCluster;
    Backendless.Bodyparts = Bodyparts;
    Backendless.PublishOptions = PublishOptions;
    Backendless.DeliveryOptions = DeliveryOptions;
    Backendless.SubscriptionOptions = SubscriptionOptions;
    Backendless.PublishOptionsHeaders = PublishOptionsHeaders;
  
    try {
      /** @deprecated */
      root.GeoPoint = Backendless.GeoPoint;
  
      /** @deprecated */
      root.GeoCluster = Backendless.GeoCluster;
  
      /** @deprecated */
      root.BackendlessGeoQuery = Backendless.GeoQuery;
  
      /** @deprecated */
      root.Bodyparts = Backendless.Bodyparts;
  
      /** @deprecated */
      root.PublishOptions = Backendless.PublishOptions;
  
      /** @deprecated */
      root.DeliveryOptions = Backendless.DeliveryOptions;
  
      /** @deprecated */
      root.SubscriptionOptions = Backendless.SubscriptionOptions;
  
      /** @deprecated */
      root.PublishOptionsHeaders = Backendless.PublishOptionsHeaders;
    } catch (error) {
      console && console.warn(error);
    }
  
    return Backendless;
  });