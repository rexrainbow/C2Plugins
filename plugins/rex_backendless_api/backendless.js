// Backendless.js 3.1.16

(function(factory) {
    var root = (typeof self == 'object' && self.self === self && self) ||
        (typeof global == 'object' && global.global === global && global);

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

    var NodeDevice = {
        name    : 'NODEJS',
        platform: 'NODEJS',
        uuid    : 'someId',
        version : '1'
    };

    var isBrowser = (new Function("try {return this===window;}catch(e){ return false;}"))();

    var WebSocket = null; // isBrowser ? window.WebSocket || window.MozWebSocket : {};
    var UIState = null;

    var localStorageName = 'localStorage';

    var previousBackendless = root.Backendless;

    var Backendless = {},
        emptyFn     = (function() {
        });

    Backendless.VERSION = '3.1.16';
    Backendless.serverURL = 'https://api.backendless.com';

    Backendless.noConflict = function() {
        root.Backendless = previousBackendless;
        return this;
    };

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    initXHR();

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

    var promisesEnabled = false;

    Backendless.browser = browser;
    Backendless.enablePromises = enablePromises;
    Backendless.promisesEnabled = function() {
        return promisesEnabled;
    };

    var Utils = Backendless.Utils = {
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
        if (obj == null)  {
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

    function initXHR() {
        try {
            if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined') {
                XMLHttpRequest.prototype.sendAsBinary = function(text) {
                    var data = new ArrayBuffer(text.length);
                    var ui8a = new Uint8Array(data, 0);
                    for (var i = 0; i < text.length; i++) {
                        ui8a[i] = (text.charCodeAt(i) & 0xff);
                    }
                    this.send(ui8a);
                };
            }
        }
        catch (e) {
        }
    }

    function tryParseJSON(s) {
        try {
            return typeof s === 'string' ? JSON.parse(s) : s;
        } catch (e) {
            return s;
        }
    }

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
                var xhr         = new XMLHttpRequest(),
                    contentType = config.data ? 'application/json' : 'application/x-www-form-urlencoded',
                    response;

                var parseResponse = function(xhr) {
                    var result = true;

                    if (xhr.responseText) {
                        result = tryParseJSON(xhr.responseText);
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
                    response = cloneObject(response);
                    if (config.method == 'GET' && config.cacheActive) {
                        response.cachePolicy = config.cachePolicy;
                        Backendless.LocalCache.set(config.urlBlueprint, response);
                    } else if (Backendless.LocalCache.exists(config.urlBlueprint)) {
                        if (response === true || config.method == 'DELETE') {
                            response = undefined;
                        } else {
                            response.cachePolicy = Backendless.LocalCache.getCachePolicy(config.urlBlueprint);
                        }
                        '___class' in response && delete response['___class'];  // this issue must be fixed on server side

                        Backendless.LocalCache.set(config.urlBlueprint, response);
                    }
                };

                var checkInCache = function() {
                    return config.cacheActive && config.cachePolicy.policy == 'fromRemoteOrCache' && Backendless.LocalCache.exists(config.urlBlueprint);
                };

                xhr.open(config.method, config.url, config.isAsync);
                xhr.setRequestHeader('Content-Type', contentType);
                xhr.setRequestHeader('application-id', Backendless.applicationId);
                xhr.setRequestHeader('secret-key', Backendless.secretKey);
                xhr.setRequestHeader('application-type', 'JS');

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
                        if (xhr.readyState == 4) {
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
        config.cachePolicy = config.cachePolicy || {policy: 'ignoreCache'};
        config.isAsync = (typeof config.isAsync == 'boolean') ? config.isAsync : false;
        config.cacheActive = (config.method == 'GET') && (cashingAllowedArr.indexOf(config.cachePolicy.policy) != -1);
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
        config.isAsync = (typeof config.isAsync == 'boolean') ? config.isAsync : false;

        if (!config.isAsync) {
            throw new Error('Use Async type of request using Backendless with NodeJS. Add Backendless.Async(successCallback, errorCallback) as last argument');
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
                "Content-Length"  : config.data ? Buffer.byteLength(config.data) : 0,
                "Content-Type"    : config.data ? 'application/json' : 'application/x-www-form-urlencoded',
                "application-id"  : Backendless.applicationId,
                "secret-key"      : Backendless.secretKey,
                "application-type": "JS"
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

                    if (buffer !== undefined && contentType && contentType.indexOf('application/json') !== -1) {
                        buffer = tryParseJSON(buffer);
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

    Backendless._ajax = isBrowser ? Backendless._ajax_for_browser : Backendless._ajax_for_nodejs;

    var getClassName = function() {
        if (this.prototype && this.prototype.___class) {
            return this.prototype.___class;
        }

        if (Utils.isFunction(this) && this.name) {
            return this.name;
        }

        var instStringified = (Utils.isFunction(this) ? this.toString() : this.constructor.toString()),
            results         = instStringified.match(/function\s+(\w+)/);

        return (results && results.length > 1) ? results[1] : '';
    };

    var encodeArrayToUriComponent = function(arr) {
        var props = [], i, len;
        for (i = 0, len = arr.length; i < len; ++i) {
            props.push(encodeURIComponent(arr[i]));
        }

        return props.join(',');
    };

    var classWrapper = function(obj) {
        var wrapper = function(obj) {
            var wrapperName = null,
                Wrapper = null;

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
                    obj = deepExtend(new Wrapper(), obj);
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

    var deepExtend = function(destination, source) {
        for (var property in source) {
            if (source[property] !== undefined && source.hasOwnProperty(property)) {
                destination[property] = destination[property] || {};
                destination[property] = classWrapper(source[property]);
                if (destination[property] && destination[property].hasOwnProperty(property) && destination[property][property] && destination[property][property].hasOwnProperty("__originSubID")) {
                    destination[property][property] = classWrapper(destination[property]);
                }
            }
        }

        return destination;
    };

    var cloneObject = function(obj) {
        return Utils.isArray(obj) ? obj.slice() : deepExtend({}, obj);
    };

    var extractResponder = function(args) {
        var i, len;
        for (i = 0, len = args.length; i < len; ++i) {
            if (args[i] instanceof Async) {
                return args[i];
            }
        }

        return null;
    };

    var wrapAsync = function(async, parser, context) {
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

    function extendCollection(collection, dataMapper) {
        if (collection.nextPage != null) {
            if (collection.nextPage && collection.nextPage.split("/")[1] == Backendless.appVersion) {
                collection.nextPage = Backendless.serverURL + collection.nextPage;
            }

            collection._nextPage = collection.nextPage;

            collection.nextPage = function(async) {
                return dataMapper._load(this._nextPage, async);
            };

            if (promisesEnabled) {
                collection.nextPage = promisify(collection.nextPage);
            }

            collection.getPage = function(offset, pageSize, async) {
                var nextPage = this._nextPage.replace(/offset=\d+/ig, 'offset=' + offset);

                if (!(pageSize instanceof Async)) {
                    nextPage = nextPage.replace(/pagesize=\d+/ig, 'pageSize=' + pageSize);
                }
                async = extractResponder(arguments);

                return dataMapper._load(nextPage, async);
            };

            collection.dataMapper = dataMapper;
        }
    }

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

        store.getAll = function () {
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
            if (typeof value != 'string') {
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
            if (obj && Object.prototype.toString.call(obj).slice(8, -1) == "Object") {
                if ('cachePolicy' in obj && 'timeToLive' in obj['cachePolicy'] && obj['cachePolicy']['timeToLive'] != -1 && 'created' in obj['cachePolicy']) {
                    result = (new Date().getTime() - obj['cachePolicy']['created']) > obj['cachePolicy']['timeToLive'];
                }
            }

            return result;
        };

        var addTimestamp = function(obj) {
            if (obj && Object.prototype.toString.call(obj).slice(8, -1) == "Object") {
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

    Backendless.Async = Async;

    function DataStore(model) {
        this.model = Utils.isString(model) ? function() {
        } : model;

        this.className = getClassName.call(model);

        if ((typeof model).toLowerCase() === "string") {
            this.className = model;
        }

        if (!this.className) {
            throw 'Class name should be specified';
        }

        this.restUrl = Backendless.appPath + '/data/' + this.className;
    }

    DataStore.prototype = {
        _extractQueryOptions: function(options) {
            var params = [];

            if (typeof options.pageSize != 'undefined') {
                if (options.pageSize < 1 || options.pageSize > 100) {
                    throw new Error('PageSize can not be less then 1 or greater than 100');
                }

                params.push('pageSize=' + encodeURIComponent(options.pageSize));
            }

            if (typeof options.offset != 'undefined') {
                if (options.offset < 0) {
                    throw new Error('Offset can not be less then 0');
                }

                params.push('offset=' + encodeURIComponent(options.offset));
            }

            if (options.sortBy) {
                if (Utils.isString(options.sortBy)) {
                    params.push('sortBy=' + encodeURIComponent(options.sortBy));
                } else if (Utils.isArray(options.sortBy)) {
                    params.push('sortBy=' + encodeArrayToUriComponent(options.sortBy));
                }
            }

            if (options.relationsDepth) {
                if (Utils.isNumber(options.relationsDepth)) {
                    params.push('relationsDepth=' + Math.floor(options.relationsDepth));
                }
            }

            if (options.relations) {
                if (Utils.isArray(options.relations)) {
                    params.push('loadRelations=' + (options.relations.length ? encodeArrayToUriComponent(options.relations) : "*"));
                }
            }

            return params.join('&');
        },
        _parseResponse: function(response) {
            var _Model = this.model, item;
            response = response.fields || response;
            item = new _Model();

            extendCollection(response, this);
            deepExtend(item, response);
            return this._formCircDeps(item);
        },

        _parseFindResponse: function(response) {
            var i, len, _Model = this.model, item;

            if (response.data) {
                var collection = response, arr = collection.data;

                for (i = 0, len = arr.length; i < len; ++i) {
                    arr[i] = arr[i].fields || arr[i];
                    item = new _Model();
                    deepExtend(item, arr[i]);
                    arr[i] = item;
                }

                extendCollection(collection, this);

                return this._formCircDeps(collection);
            }
            else {
                response = response.fields || response;
                item = Utils.isString(_Model) ? {} : new _Model();
                deepExtend(item, response);

                return this._formCircDeps(item);
            }
        },

        _load: function(url, async) {
            if (url) {
                var responder = extractResponder(arguments), isAsync = false;

                if (responder != null) {
                    isAsync = true;
                    responder = wrapAsync(responder, this._parseResponse, this);
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

        _replCircDeps       : function(obj) {
            var objMap = [obj];
            var pos;

            var genID = function() {
                for (var b = '', a = b; a++ < 36; b += a * 51 && 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-') {
                }
                return b;
            };

            var _replCircDepsHelper = function(obj) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && typeof obj[prop] == "object" && obj[prop] != null) {
                        if ((pos = objMap.indexOf(obj[prop])) != -1) {
                            objMap[pos]["__subID"] = objMap[pos]["__subID"] || genID();
                            obj[prop] = {"__originSubID": objMap[pos]["__subID"]};
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
            var circDepsIDs         = {},
                result              = new obj.constructor(),
                _formCircDepsHelper = function(obj, result) {
                    if (obj.hasOwnProperty("__subID")) {
                        circDepsIDs[obj["__subID"]] = result;
                        delete obj["__subID"];
                    }

                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            if (typeof obj[prop] == "object" && obj[prop] != null) {
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
                };

            _formCircDepsHelper(obj, result);
            return result;
        },

        save: function(obj, async) {
            this._replCircDeps(obj);
            var responder = extractResponder(arguments),
                isAsync   = false,
                method    = 'PUT',
                url       = this.restUrl,
                objRef    = obj;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder, this._parseResponse, this);
            }

            var result = Backendless._ajax({
                method      : method,
                url         : url,
                data        : JSON.stringify(obj),
                isAsync     : isAsync,
                asyncHandler: responder
            });

            if (!isAsync) {
                deepExtend(objRef, this._parseResponse(result));
            }

            return isAsync ? result : objRef;
        },

        remove: function(objId, async) {
            if (!Utils.isObject(objId) && !Utils.isString(objId)) {
                throw new Error('Invalid value for the "value" argument. The argument must contain only string or object values');
            }

            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder, this._parseResponse, this);
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

        find: function(dataQuery) {
            dataQuery = dataQuery || {};
            var props,
                whereClause,
                options,
                query     = [],
                url       = this.restUrl,
                responder = extractResponder(arguments),
                isAsync   = responder != null,
                result;

            if (dataQuery.properties && dataQuery.properties.length) {
                props = 'props=' + encodeArrayToUriComponent(dataQuery.properties);
            }

            if (dataQuery.condition) {
                whereClause = 'where=' + encodeURIComponent(dataQuery.condition);
            }

            if (dataQuery.options) {
                options = this._extractQueryOptions(dataQuery.options);
            }
            responder != null && (responder = wrapAsync(responder, this._parseFindResponse, this));
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

        _buildArgsObject: function() {
            var args = {},
                i    = arguments.length,
                type = "";
            for (; i--;) {
                type = Object.prototype.toString.call(arguments[i]).toLowerCase().match(/[a-z]+/g)[1];
                switch (type) {
                    case "number":
                        args.options = args.options || {};
                        args.options.relationsDepth = arguments[i];
                        break;
                    case "string":
                        args.url = arguments[i];
                        break;
                    case "array":
                        args.options = args.options || {};
                        args.options.relations = arguments[i];
                        break;
                    case "object":
                        if (arguments[i].hasOwnProperty('cachePolicy')) {
                            args.cachePolicy = arguments[i]['cachePolicy'];
                        }
                        break;
                    default:
                        break;
                }
            }

            return args;
        },

        findById: function() {
            var argsObj;

            if (Utils.isString(arguments[0])) {
                argsObj = this._buildArgsObject.apply(this, arguments);
                if (!(argsObj.url)) {
                    throw new Error('missing argument "object ID" for method findById()');
                }

                return this.find.apply(this, [argsObj].concat(Array.prototype.slice.call(arguments)));
            } else if (Utils.isObject(arguments[0])) {
                argsObj = arguments[0];
                var responder = extractResponder(arguments),
                    url       = this.restUrl,
                    isAsync   = responder != null,
                    send      = "/pk?";

                for (var key in argsObj) {
                    send += key + '=' + argsObj[key] + '&';
                }

                responder != null && (responder = wrapAsync(responder, this._parseResponse, this));

                var result;

                if (getClassName.call(arguments[0]) == 'Object') {
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

        loadRelations: function(obj) {
            if (!obj) {
                throw new Error('missing object argument for method loadRelations()');
            }

            if (!Utils.isObject(obj)) {
                throw new Error('Invalid value for the "value" argument. The argument must contain only object values');
            }

            var argsObj = arguments[0];
            var url = this.restUrl + '/relations';

            if (arguments[1]) {
                if (Utils.isArray(arguments[1])) {
                    if (arguments[1][0] == '*') {
                        url += '?relationsDepth=' + arguments[1].length;
                    } else {
                        url += '?loadRelations=' + arguments[1][0] + '&relationsDepth=' + arguments[1].length;
                    }
                } else {
                    throw new Error('Invalid value for the "options" argument. The argument must contain only array values');
                }
            }

            var result = Backendless._ajax({
                method: 'PUT',
                url   : url,
                data  : JSON.stringify(argsObj)
            });

            deepExtend(obj, result);
        },

        findFirst: function() {
            var argsObj = this._buildArgsObject.apply(this, arguments);
            argsObj.url = 'first';

            return this.find.apply(this, [argsObj].concat(Array.prototype.slice.call(arguments)));
        },

        findLast: function() {
            var argsObj = this._buildArgsObject.apply(this, arguments);
            argsObj.url = 'last';

            return this.find.apply(this, [argsObj].concat(Array.prototype.slice.call(arguments)));
        }
    };

    var dataStoreCache = {};

    var persistence = {
        save: function(className, obj, async) {
            var responder = extractResponder(arguments), isAsync = false;

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
                return new DataStore(className).save(className, obj, async);
            }
        },
        getView: function(viewName, whereClause, pageSize, offset, async) {
            var responder = extractResponder(arguments),
                isAsync   = responder != null;

            if (Utils.isString(viewName)) {
                var url = Backendless.appPath + '/data/' + viewName;

                if ((arguments.length > 1) && !(arguments[1] instanceof Backendless.Async)) {
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
        callStoredProcedure: function(spName, argumentValues, async) {
            var responder = extractResponder(arguments),
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
                if (model.toLowerCase() === 'users') {
                    throw new Error("Table 'Users' is not accessible through this signature. Use Backendless.Data.of( BackendlessUser.class ) instead");
                }
                tableName = model;
            } else {
                tableName = getClassName.call(model);
            }
            var store = dataStoreCache[tableName];
            if (!store) {
                store = new DataStore(model);
                dataStoreCache[tableName] = store;
            }

            return store;
        },
        describe: function(className, async) {
            className = Utils.isString(className) ? className : getClassName.call(className);
            var responder = extractResponder(arguments), isAsync = (responder != null);

            return Backendless._ajax({
                method      : 'GET',
                url         : Backendless.appPath + '/data/' + className + '/properties',
                isAsync     : isAsync,
                asyncHandler: responder
            });
        }
    };

    function DataPermissions() {
        this.restUrl = Backendless.appPath + '/data';

        this.getRestUrl = function(dataObject, permissionType) {
            return this.restUrl + '/' + encodeURIComponent(dataObject.___class) + '/permissions/' + encodeURIComponent(permissionType) + '/' + encodeURIComponent(dataObject.objectId);
        };

        this.sendRequest = function(userid, rolename, dataObject, permission, permissionType, async) {
            var responder = extractResponder(arguments),
                isAsync   = responder != null,
                data      = {
                    "permission": permission
                };

            if (!dataObject.___class || !dataObject.objectId) {
                throw new Error('"dataObject.___class" and "dataObject.objectId" need to be specified');
            }

            if (userid) {
                data.user = userid;
            } else if (rolename) {
                data.role = rolename;
            }

            return Backendless._ajax({
                method      : 'PUT',
                url         : this.getRestUrl(dataObject, permissionType),
                data        : JSON.stringify(data),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        };
    }

    DataPermissions.prototype = {
        FIND  : {
            grantUser: function(userid, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(userid, null, dataObject, 'FIND', 'GRANT', Async);
            },
            grantRole: function(rolename, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(null, rolename, dataObject, 'FIND', 'GRANT', Async);
            },
            grant    : function(dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest('*', null, dataObject, 'FIND', 'GRANT', Async);
            },
            denyUser : function(userid, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(userid, null, dataObject, 'FIND', 'DENY', Async);
            },
            denyRole : function(rolename, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(null, rolename, dataObject, 'FIND', 'DENY', Async);
            },
            deny     : function(dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest('*', null, dataObject, 'FIND', 'DENY', Async);
            }
        },
        REMOVE: {
            grantUser: function(userid, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(userid, null, dataObject, 'REMOVE', 'GRANT', Async);
            },
            grantRole: function(rolename, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(null, rolename, dataObject, 'REMOVE', 'GRANT', Async);
            },
            grant    : function(dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest('*', null, dataObject, 'REMOVE', 'GRANT', Async);
            },
            denyUser : function(userid, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(userid, null, dataObject, 'REMOVE', 'DENY', Async);
            },
            denyRole : function(rolename, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(null, rolename, dataObject, 'REMOVE', 'DENY', Async);
            },
            deny     : function(dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest('*', null, dataObject, 'REMOVE', 'DENY', Async);
            }
        },
        UPDATE: {
            grantUser: function(userid, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(userid, null, dataObject, 'UPDATE', 'GRANT', Async);
            },
            grantRole: function(rolename, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(null, rolename, dataObject, 'UPDATE', 'GRANT', Async);
            },
            grant    : function(dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest('*', null, dataObject, 'UPDATE', 'GRANT', Async);
            },
            denyUser : function(userid, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(userid, null, dataObject, 'UPDATE', 'DENY', Async);
            },
            denyRole : function(rolename, dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest(null, rolename, dataObject, 'UPDATE', 'DENY', Async);
            },
            deny     : function(dataObject, Async) {
                return Backendless.Data.Permissions.sendRequest('*', null, dataObject, 'UPDATE', 'DENY', Async);
            }
        }
    };

    function User() {
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
                currentUser = me._parseResponse(tryParseJSON(data), stayLoggedIn);
                async.success(me._getUserFromResponse(currentUser));
            }, error = function(data) {
                async.fault(data);
            };

            return new Async(success, error);
        },

        _parseResponse: function(data, stayLoggedIn) {
            var user = new Backendless.User();
            deepExtend(user, data);

            if (stayLoggedIn) {
                Backendless.LocalCache.set("stayLoggedIn", stayLoggedIn);
            }

            return user;
        },

        register: function(user, async) {
            if (!(user instanceof Backendless.User)) {
                throw new Error('Only Backendless.User accepted');
            }

            var responder = extractResponder(arguments);
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

        getUserRoles: function(async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            if (responder) {
                responder = this._wrapAsync(responder);
            }

            var result = Backendless._ajax({
                method      : 'GET',
                url         : this.restUrl + '/userroles',
                isAsync     : isAsync,
                asyncHandler: responder
            });

            return isAsync ? result : this._parseResponse(result);
        },

        roleHelper: function(identity, rolename, async, operation) {
            if (!identity) {
                throw new Error('User identity can not be empty');
            }

            if (!rolename) {
                throw new Error('Rolename can not be empty');
            }

            var responder = extractResponder(arguments);

            return Backendless._ajax({
                method      : 'POST',
                url         : this.restUrl + '/' + operation,
                isAsync     : !!responder,
                asyncHandler: responder,
                data        : JSON.stringify({user : identity, roleName: rolename})
            });
        },

        assignRole: function(identity, rolename, async) {
            return this.roleHelper(identity, rolename, async, 'assignRole');
        },

        unassignRole: function(identity, rolename, async) {
            return this.roleHelper(identity, rolename, async, 'unassignRole');
        },

        login: function(username, password, stayLoggedIn, async) {
            if (!username) {
                throw new Error('Username can not be empty');
            }

            if (!password) {
                throw new Error('Password can not be empty');
            }

            stayLoggedIn = stayLoggedIn === true;

            Backendless.LocalCache.remove("user-token");
            Backendless.LocalCache.remove("current-user-id");
            Backendless.LocalCache.set("stayLoggedIn", false);

            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            if (responder) {
                responder = this._wrapAsync(responder, stayLoggedIn);
            }

            var data = {
                login   : username,
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
            Backendless.LocalCache.set("current-user-id", user.objectId);

            var newUser = new Backendless.User();

            for (var i in user) {
                if (user.hasOwnProperty(i)) {
                    if (i == 'user-token') {
                        if (Backendless.LocalCache.get("stayLoggedIn")) {
                            Backendless.LocalCache.set("user-token", user[i]);
                        }
                        continue;
                    }
                    newUser[i] = user[i];
                }
            }

            return newUser;
        },

        loggedInUser: function() {
            return Backendless.LocalCache.get("current-user-id");
        },

        describeUserClass: function(async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            return Backendless._ajax({
                method      : 'GET',
                url         : this.restUrl + '/userclassprops',
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        restorePassword: function(emailAddress, async) {
            if (!emailAddress) {
                throw 'Username can not be empty';
            }
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            return Backendless._ajax({
                method      : 'GET',
                url         : this.restUrl + '/restorepassword/' + encodeURIComponent(emailAddress),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        logout: function(async) {
            var responder       = extractResponder(arguments),
                isAsync         = responder != null,
                errorCallback   = isAsync ? responder.fault : null,
                successCallback = isAsync ? responder.success : null,
                result = {},

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
                    if (Utils.isObject(e) && [3064, 3091, 3090, 3023].indexOf(e.code) != -1) {
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

        getCurrentUser: function() {
            if (currentUser) {
                return this._getUserFromResponse(currentUser);
            }

            var stayLoggedIn = Backendless.LocalCache.get("stayLoggedIn");
            var currentUserId = stayLoggedIn && Backendless.LocalCache.get("current-user-id");

            return currentUserId && persistence.of(User).findById(currentUserId) || null;
        },

        update: function(user, async) {
            var responder = extractResponder(arguments);
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

        loginWithFacebook      : function(facebookFieldsMapping, permissions, async, stayLoggedIn) {
            async = extractResponder(arguments);
            this._loginSocial('Facebook', facebookFieldsMapping, permissions, async, null, stayLoggedIn);
        },

        loginWithGooglePlus    : function(googlePlusFieldsMapping, permissions, async, container, stayLoggedIn) {
            async = extractResponder(arguments);
            this._loginSocial('GooglePlus', googlePlusFieldsMapping, permissions, async, container, stayLoggedIn);
        },

        loginWithTwitter       : function(twitterFieldsMapping, async, stayLoggedIn) {
            async = extractResponder(arguments);
            this._loginSocial('Twitter', twitterFieldsMapping, null, async, null, stayLoggedIn);
        },

        _socialContainer       : function(socialType, container) {
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

        _loginSocial: function(socialType, fieldsMapping, permissions, async, container, stayLoggedIn) {
            var socialContainer = new this._socialContainer(socialType, container);
            async = async && this._wrapAsync(async);

            Utils.addEvent('message', window, function(e) {
                if (e.origin == Backendless.serverURL) {
                    var result = JSON.parse(e.data);

                    if (result.fault) {
                        async.fault(result.fault);
                    } else {
                        Backendless.LocalCache.set("stayLoggedIn", !!stayLoggedIn);
                        currentUser = this.Backendless.UserService._parseResponse(result);
                        async.success(this.Backendless.UserService._getUserFromResponse(currentUser));
                    }

                    Utils.removeEvent('message', window);
                    socialContainer.closeContainer();
                }
            });

            var interimCallback = new Backendless.Async(function(r) {
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

        loginWithFacebookSdk: function(fieldsMapping, stayLoggedIn, options, async) {
            if (!FB) {
                throw new Error("Facebook SDK not found");
            }

            if (stayLoggedIn instanceof Async) {
                async = stayLoggedIn;
                stayLoggedIn = false;
            } else if (options instanceof Async) {
                async = options;
                options = undefined;
            }

            var me = this;
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    me._sendSocialLoginRequest(me, response, "facebook", fieldsMapping, stayLoggedIn, async);
                } else {
                    FB.login(function(response) {
                        me._sendSocialLoginRequest(me, response, "facebook", fieldsMapping, stayLoggedIn, async);
                    }, options);
                }
            });
        },

        loginWithGooglePlusSdk: function(fieldsMapping, stayLoggedIn, async) {
            if (!gapi) {
                throw new Error("Google Plus SDK not found");
            }

            if (stayLoggedIn instanceof Async) {
                async = stayLoggedIn;
                stayLoggedIn = false;
            }

            var me = this;

            gapi.auth.authorize({
                client_id: fieldsMapping.client_id,
                scope    : "https://www.googleapis.com/auth/plus.login"
            }, function(response) {
                delete response['g-oauth-window'];
                me._sendSocialLoginRequest(me, response, "googleplus", fieldsMapping, stayLoggedIn, async);
            });
        },

        _sendSocialLoginRequest: function(context, response, socialType, fieldsMapping, stayLoggedIn, async) {
            if (fieldsMapping) {
                response["fieldsMapping"] = fieldsMapping;
            }

            var interimCallback = new Backendless.Async(function(r) {
                currentUser = context._parseResponse(r);
                Backendless.LocalCache.set("stayLoggedIn", !!stayLoggedIn);
                async.success(context._getUserFromResponse(currentUser));
            }, function(e) {
                async.fault(e);
            });

            Backendless._ajax({
                method      : 'POST',
                url         : context.restUrl + "/social/" + socialType + "/login/" + Backendless.applicationId,
                isAsync     : true,
                asyncHandler: interimCallback,
                data        : JSON.stringify(response)
            });
        },

        isValidLogin: function(async) {
            var userToken = Backendless.LocalCache.get("user-token");
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            if (userToken) {
                if (!async) {
                    try {
                        var result = Backendless._ajax({
                            method: 'GET',
                            url   : Backendless.serverURL + '/' + Backendless.appVersion + '/users/isvalidusertoken/' + userToken
                        });
                        return !!result;
                    } catch (e) {
                        return false;
                    }
                } else {
                    Backendless._ajax({
                        method      : 'GET',
                        url         : Backendless.serverURL + '/' + Backendless.appVersion + '/users/isvalidusertoken/' + userToken,
                        isAsync     : isAsync,
                        asyncHandler: responder && this._wrapAsync(responder)
                    });
                }
            } else {
                var user = Backendless.UserService.getCurrentUser();

                if (isAsync) {
                    //if async need to put it to the end of the stack
                    setTimeout(function() {
                        responder[user ? 'success' : 'fault']();
                    }, 0);
                } else {
                    return !!user;
                }
            }
        },

        resendEmailConfirmation: function(emailAddress, async) {
            if(!emailAddress || emailAddress instanceof Async) {
                throw "Email cannot be empty";
            }
            var responder = extractResponder(arguments);
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
        UNITS           : {
            METERS    : 'METERS',
            KILOMETERS: 'KILOMETERS',
            MILES     : 'MILES',
            YARDS     : 'YARDS',
            FEET      : 'FEET'
        },

        _parseResponse  : function(data) {
            var collection = data.collection;
            extendCollection(collection, this);

            return collection;
        },

        _load           : function(url, async) {
            var responder = extractResponder(arguments),
                isAsync   = responder != null;

            var result = Backendless._ajax({
                method      : 'GET',
                url         : url,
                isAsync     : isAsync,
                asyncHandler: responder
            });

            return isAsync ? result : this._parseResponse(result);
        },

        _findHelpers    : {
            'searchRectangle': function(arg) {
                var rect = [
                    'nwlat=' + arg[0], 'nwlon=' + arg[1], 'selat=' + arg[2], 'selon=' + arg[3]
                ];
                return rect.join('&');
            },
            'latitude'  : function(arg) {
                return 'lat=' + arg;
            },
            'longitude' : function(arg) {
                return 'lon=' + arg;
            },
            'metadata'  : function(arg) {
                return 'metadata=' + JSON.stringify(arg);
            },
            'units'     : function(arg) {
                return 'units=' + arg;
            },
            'radius'    : function(arg) {
                return 'r=' + arg;
            },
            'categories': function(arg) {
                arg = Utils.isString(arg) ? [arg] : arg;
                return 'categories=' + encodeArrayToUriComponent(arg);
            },
            'includeMetadata': function(arg) {
                return 'includemetadata=' + arg;
            },
            'pageSize': function(arg) {
                if (arg < 1 || arg > 100) {
                    throw new Error('PageSize can not be less then 1 or greater than 100');
                } else {
                    return 'pagesize=' + arg;
                }
            },
            'offset'  : function(arg) {
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
            'relativeFindMetadata': function(arg) {
                return 'relativeFindMetadata=' + encodeURIComponent(JSON.stringify(arg));
            },
            'condition'           : function(arg) {
                return 'whereClause=' + encodeURIComponent(arg);
            },
            'degreePerPixel'      : function(arg) {
                return 'dpp=' + arg;
            },
            'clusterGridSize'     : function(arg) {
                return 'clustergridsize=' + arg;
            },
            'geoFence'            : function(arg) {
                return 'geoFence=' + arg;
            }
        },

        savePoint        : function(geopoint, async) {
            if (geopoint.latitude === undefined || geopoint.longitude === undefined) {
                throw 'Latitude or longitude not a number';
            }
            geopoint.categories = geopoint.categories || ['Default'];
            geopoint.categories = Utils.isArray(geopoint.categories) ? geopoint.categories : [geopoint.categories];

            var objectId = geopoint.objectId;
            var method = objectId ? 'PATCH' : 'PUT',
                url = this.restUrl + '/points';

            if (objectId) {
                url += '/' + objectId;
            }

            var responder = extractResponder(arguments);
            var isAsync = responder != null;
            var responderOverride = function(async) {
                var success = function(data) {
                    var geoObject = data.geopoint;
                    var geoPoint = new GeoPoint();
                    geoPoint.categories = geoObject.categories;
                    geoPoint.latitude = geoObject.latitude;
                    geoPoint.longitude = geoObject.longitude;
                    geoPoint.metadata = geoObject.metadata;
                    geoPoint.objectId = geoObject.objectId;
                    data.geopoint = geoPoint;

                    async.success(data);
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

        findUtil        : function(query, async) {
            var url       = query["url"],
                responder = extractResponder(arguments),
                isAsync   = false;

            if (query.searchRectangle && query.radius) {
                throw new Error("Inconsistent geo query. Query should not contain both rectangle and radius search parameters.");
            } else if (query.radius && (query.latitude === undefined || query.longitude === undefined)) {
                throw new Error("Latitude and longitude should be provided to search in radius");
            } else if ((query.relativeFindMetadata || query.relativeFindPercentThreshold) && !(query.relativeFindMetadata && query.relativeFindPercentThreshold)) {
                throw new Error("Inconsistent geo query. Query should contain both relativeFindPercentThreshold and relativeFindMetadata or none of them");
            } else {
                url += query.searchRectangle ? '/rect?' : '/points?';
                url += query.units ? 'units=' + query.units : '';
                for (var prop in query) {
                    if (query.hasOwnProperty(prop) && this._findHelpers.hasOwnProperty(prop) && query[prop] != null) {
                        url += '&' + this._findHelpers[prop](query[prop]);
                    }
                }
            }

            url = url.replace(/\?&/g, '?');
            var self = this;

            var responderOverride = function(async) {
                var success = function(data) {
                    var geoCollection = data.collection.data;

                    for (var i = 0; i < geoCollection.length; i++) {
                        var geoObject = null;
                        if (geoCollection[i].hasOwnProperty('totalPoints')) {
                            geoObject = new GeoCluster();
                            geoObject.totalPoints = geoCollection[i].totalPoints;
                            geoObject.geoQuery = query;
                        } else {
                            geoObject = new GeoPoint();
                        }
                        geoObject.categories = geoCollection[i].categories;
                        geoObject.latitude = geoCollection[i].latitude;
                        geoObject.longitude = geoCollection[i].longitude;
                        geoObject.metadata = geoCollection[i].metadata;
                        geoObject.objectId = geoCollection[i].objectId;
                        geoObject.distance = geoCollection[i].distance;
                        data.collection.data[i] = geoObject;
                    }

                    data = self._parseResponse(data);
                    async.success(data);
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

            var result = Backendless._ajax({
                method      : 'GET',
                url         : url,
                isAsync     : isAsync,
                asyncHandler: responder
            });

            return isAsync ? result : this._parseResponse(result);
        },

        find            : function(query, async) {
            query["url"] = this.restUrl;

            return this.findUtil(query, async);
        },

        loadMetadata    : function(geoObject, async) {
            var url       = this.restUrl + '/points/',
                responder = extractResponder(arguments),
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

        getClusterPoints: function(geoObject, async) {
            var url       = this.restUrl + '/clusters/',
                responder = extractResponder(arguments),
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

            var self = this;

            var responderOverride = function(async) {
                var success = function(data) {
                    var geoCollection = data.collection.data;
                    for (var i = 0; i < geoCollection.length; i++) {
                        var geoObject = null;
                        geoObject = new GeoPoint();
                        geoObject.categories = geoCollection[i].categories;
                        geoObject.latitude = geoCollection[i].latitude;
                        geoObject.longitude = geoCollection[i].longitude;
                        geoObject.metadata = geoCollection[i].metadata;
                        geoObject.objectId = geoCollection[i].objectId;
                        data.collection.data[i] = geoObject;
                    }
                    data = self._parseResponse(data);
                    async.success(data);
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

            var result = Backendless._ajax({
                method      : 'GET',
                url         : url,
                isAsync     : isAsync,
                asyncHandler: responder
            });

            return isAsync ? result : this._parseResponse(result);
        },

        relativeFind: function(query, async) {
            if (!(query.relativeFindMetadata && query.relativeFindPercentThreshold)) {
                throw new Error("Inconsistent geo query. Query should contain both relativeFindPercentThreshold and relativeFindMetadata");
            } else {
                query["url"] = this.restUrl + "/relative";

                return this.findUtil(query, async);
            }
        },

        addCategory: function(name, async) {
            if (!name) {
                throw new Error('Category name is required.');
            }

            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            var result = Backendless._ajax({
                method      : 'PUT',
                url         : this.restUrl + '/categories/' + name,
                isAsync     : isAsync,
                asyncHandler: responder
            });

            return (typeof result.result === 'undefined') ? result : result.result;
        },

        getCategories: function(async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            return Backendless._ajax({
                method      : 'GET',
                url         : this.restUrl + '/categories',
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        deleteCategory: function(name, async) {
            if (!name) {
                throw new Error('Category name is required.');
            }

            var responder = extractResponder(arguments);
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

        deletePoint: function(point, async) {
            if (!point || Utils.isFunction(point)) {
                throw new Error('Point argument name is required, must be string (object Id), or point object');
            }

            var pointId   = Utils.isString(point) ? point : point.objectId,
                responder = extractResponder(arguments),
                isAsync   = responder != null,
                result = {};

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

        getFencePoints: function(geoFenceName, query, async) {
            query = query || new GeoQuery();
            if (!Utils.isString(geoFenceName)) {
                throw new Error("Invalid value for parameter 'geoFenceName'. Geo Fence Name must be a String");
            }
            if (!(query instanceof GeoQuery)) {
                throw new Error("Invalid geo query. Query should be instance of Backendless.GeoQuery");
            }

            query["geoFence"] = geoFenceName;
            query["url"] = this.restUrl;

            return this.findUtil(query, async);
        },

        _runFenceAction: function(action, geoFenceName, geoPoint, async) {
            if (!Utils.isString(geoFenceName)) {
                throw new Error("Invalid value for parameter 'geoFenceName'. Geo Fence Name must be a String");
            }

            if (geoPoint && !(geoPoint instanceof Backendless.Async) && !(geoPoint instanceof GeoPoint) && !geoPoint.objectId) {
                throw new Error("Method argument must be a valid instance of GeoPoint persisted on the server");
            }

            var responder = extractResponder(arguments),
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

        runOnStayAction: function(geoFenceName, geoPoint, async) {
            return this._runFenceAction('onstay', geoFenceName, geoPoint, async);
        },

        runOnExitAction: function(geoFenceName, geoPoint, async) {
            return this._runFenceAction('onexit', geoFenceName, geoPoint, async);
        },

        runOnEnterAction: function(geoFenceName, geoPoint, async) {
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
            return (arguments.length == 1) ? this._getOutRectangleNodes(arguments[1]) : this._getOutRectangleCircle(arguments[0],
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
                eastLong = eastLong % 360 == 180 ? 180 : this._updateDegree(eastLong);
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

            if (point.latitude < first.latitude == point.latitude < second.latitude) {
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
                    case 'INTERSECT':
                    {
                        count++;
                        break;
                    }
                    case 'ON_LINE':
                    case 'NO_INTERSECT':
                    default:
                        break;
                }
            }

            return count % 2 == 1;
        },

        _isPointInFence: function(geoPoint, geoFence) {
            return this._isPointInRectangular(geoPoint, geoFence.nwPoint, geoFence.sePoint) ||
                geoFence.type == 'CIRCLE' && this._isPointInCircle(geoPoint, geoFence.nodes[0],
                    this._distance(geoFence.nodes[0].latitude, geoFence.nodes[0].longitude, geoFence.nodes[1].latitude,
                        geoFence.nodes[1].longitude)) ||
                geoFence.type == 'SHAPE' && this._isPointInShape(geoPoint, geoFence.nodes);
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

        _maxDuration  : 5000,
        _timers       : {},

        _checkPosition: function(geofenceName, coords, fences, geoPoint, GeoFenceCallback, lastResults, async) {
            var self = this;

            for (var k = 0; k < self._trackedFences.length; k++) {
                var isInFence = self._isDefiniteRect(self._trackedFences[k].nwPoint,
                        self._trackedFences[k].sePoint) && self._isPointInFence(coords, self._trackedFences[k]);
                var rule = null;

                if (isInFence != lastResults[self._trackedFences[k].geofenceName]) {
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
                        if (rule == 'onenter') {
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

                        if (rule == 'onenter') {
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

        _trackedFences  : [],
        _lastResults    : {},

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

        startGeofenceMonitoringWithInAppCallback : function(geofenceName, inAppCallback, async) {
            this._startMonitoring(geofenceName, inAppCallback, async);
        },

        startGeofenceMonitoringWithRemoteCallback: function(geofenceName, geoPoint, async) {
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

    deepExtend(PollingProxy.prototype, {
        onMessage: function(data) {
            clearTimeout(this.timeout);
            var self = this;

            this.timer = setTimeout(function() {
                self.poll();
            }, this.interval);

            this.fireEvent('messageReceived', data);
        },

        poll     : function() {
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

        close    : function() {
            clearTimeout(this.timer);
            clearTimeout(this.timeout);
            this.needReconnect = false;
            this.xhr && this.xhr.abort();
        },

        onTimeout: function() {
            this.xhr && this.xhr.abort();
        },

        onError  : function() {
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

    deepExtend(SocketProxy.prototype, {
        onMessage    : function() {
            this.fireEvent('messageReceived', data);
        },

        onSocketClose: function(data) {
            if (this.reconnectWithPolling) {
                this.fireEvent('socketClose', data);
            }
        },

        close        : function() {
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
        _subscribe        : function(async) {
            var responder = extractResponder(arguments);
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

        _switchToPolling  : function() {
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
        _getProperties  : function(channelName, async) {
            var responder = extractResponder(arguments);
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
        subscribe       : function(channelName, subscriptionCallback, subscriptionOptions, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            if (isAsync) {
                var that = this;

                var callback = new Async(function(props) {
                    async.success(new Subscription({
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
        publish         : function(channelName, message, publishOptions, deliveryTarget, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            var data = {
                message: message
            };

            if (publishOptions) {
                if (!(publishOptions instanceof PublishOptions)) {
                    throw "Use PublishOption as publishOptions argument";
                }

                deepExtend(data, publishOptions);
            }

            if (deliveryTarget) {
                if (!(deliveryTarget instanceof DeliveryOptions)) {
                    throw "Use DeliveryOptions as deliveryTarget argument";
                }

                deepExtend(data, deliveryTarget);
            }

            return Backendless._ajax({
                method      : 'POST',
                url         : this.restUrl + '/' + channelName,
                isAsync     : isAsync,
                asyncHandler: responder,
                data        : JSON.stringify(data)
            });
        },
        sendEmail       : function(subject, bodyParts, recipients, attachments, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;
            var data = {};

            if (subject && !Utils.isEmpty(subject) && Utils.isString(subject)) {
                data.subject = subject;
            } else {
                throw "Subject is required parameter and must be a nonempty string";
            }

            if ((bodyParts instanceof Bodyparts) && !Utils.isEmpty(bodyParts)) {
                data.bodyparts = bodyParts;
            } else {
                throw "Use Bodyparts as bodyParts argument, must contain at least one property";
            }

            if (recipients && Utils.isArray(recipients) && !Utils.isEmpty(recipients)) {
                data.to = recipients;
            } else {
                throw "Recipients is required parameter, must be a nonempty array";
            }

            if (attachments) {
                if (Utils.isArray(attachments)) {
                    if (!Utils.isEmpty(attachments)) {
                        data.attachment = attachments;
                    }
                } else {
                    throw "Attachments must be an array of file IDs from File Service";
                }
            }

            return Backendless._ajax({
                method      : 'POST',
                url         : this.restUrl + '/email',
                isAsync     : isAsync,
                asyncHandler: responder,
                data        : JSON.stringify(data)
            });
        },

        cancel          : function(messageId, async) {
            var isAsync = async != null;

            return Backendless._ajax({
                method      : 'DELETE',
                url         : this.restUrl + '/' + messageId,
                isAsync     : isAsync,
                asyncHandler: new Async(emptyFn)
            });
        },

        registerDevice  : function(channels, expiration, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;
            var device = isBrowser ? window.device : NodeDevice;

            var data = {
                deviceToken: null, //This value will set in callback
                deviceId   : device.uuid,
                os         : device.platform,
                osVersion  : device.version
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

            var url = this.restUrl + '/registrations';

            var success = function(deviceToken) {
                data.deviceToken = deviceToken;

                Backendless._ajax({
                    method      : 'POST',
                    url         : url,
                    data        : JSON.stringify(data),
                    isAsync     : isAsync,
                    asyncHandler: responder
                });
            };

            var fail = function(status) {
                console.warn(JSON.stringify(['failed to register ', status]));
            };

            var config = {
                projectid: "http://backendless.com",
                appid    : Backendless.applicationId
            };

            cordova.exec(success, fail, "PushNotification", "registerDevice", [config]);
        },

        getRegistrations: function(async) {
            var deviceId = isBrowser ? window.device.uuid : NodeDevice.uuid;
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            return Backendless._ajax({
                method      : 'GET',
                url         : this.restUrl + '/registrations/' + deviceId,
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        unregisterDevice: function(async) {
            var deviceId = isBrowser ? window.device.uuid : NodeDevice.uuid;
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            var result = Backendless._ajax({
                method      : 'DELETE',
                url         : this.restUrl + '/registrations/' + deviceId,
                isAsync     : isAsync,
                asyncHandler: responder
            });

            try {
                cordova.exec(emptyFn, emptyFn, "PushNotification", "unregisterDevice", []);
            } catch (e) {
                console.log(e.message);
            }

            return result;
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

    function send(e) {
        var xhr         = new XMLHttpRequest(),
            boundary    = '-backendless-multipart-form-boundary-' + getNow(),
            builder     = getBuilder(this.fileName, e.target.result, boundary),
            badResponse = function(xhr) {
                var result = {};
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    result.message = xhr.responseText;
                }
                result.statusCode = xhr.status;
                return result;
            };

        xhr.open("POST", this.uploadPath, true);
        xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
        xhr.setRequestHeader('application-id', Backendless.applicationId);
        xhr.setRequestHeader("secret-key", Backendless.secretKey);
        xhr.setRequestHeader("application-type", "JS");

        if ((currentUser != null && currentUser["user-token"])) {
            xhr.setRequestHeader("user-token", currentUser["user-token"]);
        } else if (Backendless.LocalCache.exists("user-token")) {
            xhr.setRequestHeader("user-token", Backendless.LocalCache.get("user-token"));
        }

        if (UIState !== null) {
            xhr.setRequestHeader("uiState", UIState);
        }

        var asyncHandler = this.asyncHandler;

        if (asyncHandler) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        asyncHandler.success(JSON.parse(xhr.responseText));
                    } else {
                        asyncHandler.fault(JSON.parse(xhr.responseText));
                    }
                }
            };
        }

        xhr.sendAsBinary(builder);

        if (asyncHandler) {
            return xhr;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            return xhr.responseText ? JSON.parse(xhr.responseText) : true;
        } else {
            throw badResponse(xhr);
        }
    }

    function sendEncoded(e) {
        var xhr         = new XMLHttpRequest(),
            boundary    = '-backendless-multipart-form-boundary-' + getNow(),
            badResponse = function(xhr) {
                var result = {};
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    result.message = xhr.responseText;
                }
                result.statusCode = xhr.status;
                return result;
            };

        xhr.open("PUT", this.uploadPath, true);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.setRequestHeader('application-id', Backendless.applicationId);
        xhr.setRequestHeader("secret-key", Backendless.secretKey);
        xhr.setRequestHeader("application-type", "JS");

        if (UIState !== null) {
            xhr.setRequestHeader("uiState", UIState);
        }

        var asyncHandler = this.asyncHandler;

        if (asyncHandler) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        asyncHandler.success(JSON.parse(xhr.responseText));
                    } else {
                        asyncHandler.fault(JSON.parse(xhr.responseText));
                    }
                }
            };
        }

        xhr.send(e.target.result.split(',')[1]);

        if (asyncHandler) {
            return xhr;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            return xhr.responseText ? JSON.parse(xhr.responseText) : true;
        } else {
            throw badResponse(xhr);
        }
    }

    function FilePermissions() {
        this.restUrl = Backendless.appPath + '/files/permissions';
    }

    FilePermissions.prototype = {
        grantUser  : function(userid, url, permissionType, async) {
            this.varType = 'user';
            this.id = userid;

            return this.grant(url, permissionType, async);
        },

        grantRole  : function(rolename, url, permissionType, async) {
            this.varType = 'role';
            this.id = rolename;

            return this.grant(url, permissionType, async);
        },

        grant      : function(url, permissionType, async) {
            return this.sendRequest('GRANT', url, permissionType, async);
        },

        denyUser   : function(rolename, url, permissionType, async) {
            this.varType = 'role';
            this.id = rolename;

            return this.deny(url, permissionType, async);
        },

        denyRole   : function(rolename, url, permissionType, async) {
            this.varType = 'role';
            this.id = rolename;

            return this.deny(url, permissionType, async);
        },

        deny       : function(url, permissionType, async) {
            return this.sendRequest('DENY', url, permissionType, async);
        },

        sendRequest: function(type, url, permissionType, async) {
            var responder = extractResponder(arguments),
                isAsync   = responder != null,
                data      = {
                    "permission": permissionType
                };

            data[this.varType] = this.id || "*";

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
        saveFile  : function(path, fileName, fileContent, overwrite, async) {
            if (!path || !Utils.isString(path)) {
                throw new Error('Missing value for the "path" argument. The argument must contain a string value');
            }

            if (!fileName || !Utils.isString(path)) {
                throw new Error('Missing value for the "fileName" argument. The argument must contain a string value');
            }

            if (overwrite instanceof Backendless.Async) {
                async = overwrite;
                overwrite = null;
            }

            if (!(fileContent instanceof File)) {
                fileContent = new Blob([fileContent]);
            }

            if (fileContent.size > 2800000) {
                throw new Error('File Content size must be less than 2,800,000 bytes');
            }

            var baseUrl = this.restUrl + '/binary/' + path + ((Utils.isString(fileName)) ? '/' + fileName : '') + ((overwrite) ? '?overwrite=true' : '');

            try {
                var reader = new FileReader();
                reader.fileName = encodeURIComponent(fileName).replace(/'/g, "%27").replace(/"/g, "%22");
                reader.uploadPath = baseUrl;
                reader.onloadend = sendEncoded;

                if (async) {
                    reader.asyncHandler = async;
                }

                reader.onerror = function(evn) {
                    async.fault(evn);
                };

                reader.readAsDataURL(fileContent);

                if (!async) {
                    return true;
                }
            } catch (err) {
                console.log(err);
            }
        },

        upload    : function(files, path, overwrite, async) {
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
                            reader.fileName = encodeURIComponent(files[i].name).replace(/'/g, "%27").replace(/"/g, "%22");
                            reader.uploadPath = baseUrl + reader.fileName + overwriting;
                            reader.onloadend = send;
                            reader.asyncHandler = async;
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
                    var fileName      = encodeURIComponent(files.value).replace(/'/g, "%27").replace(/"/g, "%22"),
                        index         = fileName.lastIndexOf('\\');

                    if (index) {
                        fileName = fileName.substring(index + 1);
                    }
                    form.action = baseUrl + fileName + overwriting;
                    form.submit();
                }
            } else {
                throw "Upload File not supported with NodeJS";
            }
        },

        listing   : function(path, pattern, recursively, pagesize, offset, async) {
            var responder = extractResponder(arguments),
                isAsync   = responder != null,
                url       = this.restUrl + '/' + path;

            if ((arguments.length > 1) && !(arguments[1] instanceof Backendless.Async)) {
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

        renameFile: function(oldPathName, newName, async) {
            this._checkPath(oldPathName);

            var parameters = {
                oldPathName: oldPathName,
                newName    : newName
            };

            return this._doAction("rename", parameters, async);
        },

        moveFile  : function(sourcePath, targetPath, async) {
            this._checkPath(sourcePath);
            this._checkPath(targetPath);

            var parameters = {
                sourcePath: sourcePath,
                targetPath: targetPath
            };

            return this._doAction("move", parameters, async);
        },

        copyFile  : function(sourcePath, targetPath, async) {
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

        _doAction : function(actionType, parameters, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            return Backendless._ajax({
                method      : 'PUT',
                url         : this.restUrl + '/' + actionType,
                data        : JSON.stringify(parameters),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        remove    : function(fileURL, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;
            var url = fileURL.indexOf("http://") === 0 || fileURL.indexOf("https://") === 0 ? fileURL : this.restUrl + '/' + fileURL;

            Backendless._ajax({
                method      : 'DELETE',
                url         : url,
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        exists    : function(path, async) {
            if (!path || !Utils.isString(path)) {
                throw new Error('Missing value for the "path" argument. The argument must contain a string value');
            }

            var responder = extractResponder(arguments),
                isAsync   = responder != null,
                url       = this.restUrl + '/exists/' + path;

            return Backendless._ajax({
                method      : 'GET',
                url         : url,
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        removeDirectory: function(path, async) {
            var responder = extractResponder(arguments);
            var isAsync = responder != null;

            return Backendless._ajax({
                method      : 'DELETE',
                url         : this.restUrl + '/' + path,
                isAsync     : isAsync,
                asyncHandler: responder
            });
        }
    };

    function Commerce() {
        this.restUrl = Backendless.appPath + '/commerce/googleplay';
    }

    Commerce.prototype.validatePlayPurchase = function(packageName, productId, token, async) {
        if (arguments.length < 3) {
            throw new Error('Package Name, Product Id, Token must be provided and must be not an empty STRING!');
        }

        for (var i = arguments.length - 2; i >= 0; i--) {
            if (!arguments[i] || !Utils.isString(arguments[i])) {
                throw new Error('Package Name, Product Id, Token must be provided and must be not an empty STRING!');
            }
        }

        var responder = extractResponder(arguments),
            isAsync   = responder != null;

        if (responder) {
            responder = wrapAsync(responder);
        }

        return Backendless._ajax({
            method      : 'GET',
            url         : this.restUrl + '/validate/' + packageName + '/inapp/' + productId + '/purchases/' + token,
            isAsync     : isAsync,
            asyncHandler: responder
        });
    };

    Commerce.prototype.cancelPlaySubscription = function(packageName, subscriptionId, token, Async) {
        if (arguments.length < 3) {
            throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
        }

        for (var i = arguments.length - 2; i >= 0; i--) {
            if (!arguments[i] || !Utils.isString(arguments[i])) {
                throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
            }
        }

        var responder = extractResponder(arguments),
            isAsync   = responder != null;

        if (responder) {
            responder = wrapAsync(responder);
        }

        return Backendless._ajax({
            method      : 'POST',
            url         : this.restUrl + '/' + packageName + '/subscription/' + subscriptionId + '/purchases/' + token + '/cancel',
            isAsync     : isAsync,
            asyncHandler: responder
        });
    };

    Commerce.prototype.getPlaySubscriptionStatus = function(packageName, subscriptionId, token, Async) {
        if (arguments.length < 3) {
            throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
        }

        for (var i = arguments.length - 2; i >= 0; i--) {
            if (!arguments[i] || !Utils.isString(arguments[i])) {
                throw new Error('Package Name, Subscription Id, Token must be provided and must be not an empty STRING!');
            }
        }

        var responder = extractResponder(arguments),
            isAsync   = responder != null;

        if (responder) {
            responder = wrapAsync(responder);
        }

        return Backendless._ajax({
            method      : 'GET',
            url         : this.restUrl + '/' + packageName + '/subscription/' + subscriptionId + '/purchases/' + token,
            isAsync     : isAsync,
            asyncHandler: responder
        });
    };

    function Events() {
        this.restUrl = Backendless.appPath + '/servercode/events';
    }

    Events.prototype.dispatch = function(eventname, eventArgs, Async) {
        if (!eventname || !Utils.isString(eventname)) {
            throw new Error('Event Name must be provided and must be not an empty STRING!');
        }

        eventArgs = Utils.isObject(eventArgs) ? eventArgs : {};

        var responder = extractResponder(arguments),
            isAsync   = responder != null;

        if (responder) {
            responder = wrapAsync(responder);
        }

        eventArgs = eventArgs instanceof Backendless.Async ? {} : eventArgs;

        return Backendless._ajax({
            method      : 'POST',
            url         : this.restUrl + '/' + eventname,
            data        : JSON.stringify(eventArgs),
            isAsync     : isAsync,
            asyncHandler: responder
        });
    };

    var Cache = function() {
    };

    var FactoryMethods = {};

    Cache.prototype = {
        put             : function(key, value, timeToLive, async) {
            if (!Utils.isString(key)) {
                throw new Error('You can use only String as key to put into Cache');
            }

            if (!(timeToLive instanceof Backendless.Async)) {
                if (typeof timeToLive == 'object' && !arguments[3]) {
                    async = timeToLive;
                    timeToLive = null;
                } else if (typeof timeToLive != ('number' || 'string') && timeToLive != null) {
                    throw new Error('You can use only String as timeToLive attribute to put into Cache');
                }
            } else {
                async = timeToLive;
                timeToLive = null;
            }

            if (Utils.isObject(value) && value.constructor !== Object) {
                value.___class = value.___class || getClassName.call(value);
            }

            var responder = extractResponder([async]), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder);
            }

            return Backendless._ajax({
                method      : 'PUT',
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/cache/' + key + ((timeToLive) ? '?timeout=' + timeToLive : ''),
                data        : JSON.stringify(value),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        expireIn        : function(key, seconds, async) {
            if (Utils.isString(key) && (Utils.isNumber(seconds) || Utils.isDate(seconds)) && seconds) {
                seconds = (Utils.isDate(seconds)) ? seconds.getTime() : seconds;
                var responder = extractResponder(arguments), isAsync = false;
                if (responder != null) {
                    isAsync = true;
                    responder = wrapAsync(responder);
                }

                return Backendless._ajax({
                    method      : 'PUT',
                    url         : Backendless.serverURL + '/' + Backendless.appVersion + '/cache/' + key + '/expireIn?timeout=' + seconds,
                    data        : JSON.stringify({}),
                    isAsync     : isAsync,
                    asyncHandler: responder
                });
            } else {
                throw new Error('The "key" argument must be String. The "seconds" argument can be either Number or Date');
            }
        },

        expireAt        : function(key, timestamp, async) {
            if (Utils.isString(key) && (Utils.isNumber(timestamp) || Utils.isDate(timestamp)) && timestamp) {
                timestamp = (Utils.isDate(timestamp)) ? timestamp.getTime() : timestamp;
                var responder = extractResponder(arguments), isAsync = false;
                if (responder != null) {
                    isAsync = true;
                    responder = wrapAsync(responder);
                }

                return Backendless._ajax({
                    method      : 'PUT',
                    url         : Backendless.serverURL + '/' + Backendless.appVersion + '/cache/' + key + '/expireAt?timestamp=' + timestamp,
                    data        : JSON.stringify({}),
                    isAsync     : isAsync,
                    asyncHandler: responder
                });
            } else {
                throw new Error('You can use only String as key while expire in Cache. Second attribute must be declared and must be a Number or Date type');
            }
        },

        cacheMethod     : function(method, key, contain, async) {
            if (!Utils.isString(key)) {
                throw new Error('The "key" argument must be String');
            }

            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder);
            }

            return Backendless._ajax({
                method      : method,
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/cache/' + key + (contain ? '/check' : ''),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        contains        : function(key, async) {
            return this.cacheMethod('GET', key, true, async);
        },

        get             : function(key, async) {
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

            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder, parseResult, this);
            }

            var result = Backendless._ajax({
                method      : 'GET',
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/cache/' + key,
                isAsync     : isAsync,
                asyncHandler: responder
            });

            return isAsync ? result : parseResult(result);
        },

        remove          : function(key, async) {
            return this.cacheMethod('DELETE', key, false, async);
        },

        setObjectFactory: function(objectName, factoryMethod) {
            FactoryMethods[objectName] = factoryMethod;
        }
    };

    var Counters = function() {
    };

    var AtomicInstance = function(counterName) {
        this.name = counterName;
    };

    Counters.prototype = {
        of                      : function(counterName) {
            return new AtomicInstance(counterName);
        },

        getConstructor          : function() {
            return this;
        },

        counterNameValidation   : function(counterName) {
            if (!counterName) {
                throw new Error('Missing value for the "counterName" argument. The argument must contain a string value.');
            }

            if (!Utils.isString(counterName)) {
                throw new Error('Invalid value for the "value" argument. The argument must contain only string values');
            }

            this.name = counterName;
        },

        implementMethod         : function(method, urlPart, async) {
            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder);
            }

            return Backendless._ajax({
                method      : method,
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/counters/' + this.name + urlPart,
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        incrementAndGet         : function(counterName, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethod('PUT', '/increment/get', async);
        },

        getAndIncrement         : function(counterName, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethod('PUT', '/get/increment', async);
        },

        decrementAndGet         : function(counterName, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethod('PUT', '/decrement/get', async);
        },

        getAndDecrement         : function(counterName, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethod('PUT', '/get/decrement', async);
        },

        reset                   : function(counterName, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethod('PUT', '/reset', async);
        },

        get                     : function(counterName, async) {
            this.counterNameValidation(counterName, async);

            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder);
            }

            return Backendless._ajax({
                method      : 'GET',
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/counters/' + this.name,
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        implementMethodWithValue: function(urlPart, value, async) {
            if (!value) {
                throw new Error('Missing value for the "value" argument. The argument must contain a numeric value.');
            }

            if (!Utils.isNumber(value)) {
                throw new Error('Invalid value for the "value" argument. The argument must contain only numeric values');
            }

            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder);
            }

            return Backendless._ajax({
                method      : 'PUT',
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/counters/' + this.name + urlPart + ((value) ? value : ''),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        },

        addAndGet               : function(counterName, value, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethodWithValue('/get/incrementby?value=', value, async);
        },

        getAndAdd               : function(counterName, value, async) {
            this.counterNameValidation(counterName, async);

            return this.implementMethodWithValue('/incrementby/get?value=', value, async);
        },

        compareAndSet           : function(counterName, expected, updated, async) {
            this.counterNameValidation(counterName, async);

            if (!expected || !updated) {
                throw new Error('Missing values for the "expected" and/or "updated" arguments. The arguments must contain numeric values');
            }

            if (!Utils.isNumber(expected) || !Utils.isNumber(updated)) {
                throw new Error('Missing value for the "expected" and/or "updated" arguments. The arguments must contain a numeric value');
            }

            var responder = extractResponder(arguments), isAsync = false;

            if (responder != null) {
                isAsync = true;
                responder = wrapAsync(responder);
            }

            return Backendless._ajax({
                method      : 'PUT',
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/counters/' + this.name + '/get/compareandset?expected=' + ((expected && updated) ? expected + '&updatedvalue=' + updated : ''),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        }
    };

    AtomicInstance.prototype = {
        incrementAndGet: function(async) {
            return Counters.prototype.getConstructor().incrementAndGet(this.name, async);
        },
        getAndIncrement: function(async) {
            return Counters.prototype.getConstructor().getAndIncrement(this.name, async);
        },
        decrementAndGet: function(async) {
            return Counters.prototype.getConstructor().decrementAndGet(this.name, async);
        },
        getAndDecrement: function(async) {
            return Counters.prototype.getConstructor().getAndDecrement(this.name, async);
        },
        reset          : function(async) {
            return Counters.prototype.getConstructor().reset(this.name, async);
        },
        get            : function(async) {
            return Counters.prototype.getConstructor().get(this.name, async);
        },
        addAndGet      : function(value, async) {
            return Counters.prototype.getConstructor().addAndGet(this.name, value, async);
        },
        getAndAdd      : function(value, async) {
            return Counters.prototype.getConstructor().getAndAdd(this.name, value, async);
        },
        compareAndSet  : function(expected, updated, async) {
            return Counters.prototype.getConstructor().getAndAdd(this.name, expected, updated, async);
        }
    };

    var lastFlushListeners;

    Backendless.Logging = {
        restUrl              : root.url,
        loggers              : {},
        logInfo              : [],
        messagesCount        : 0,
        numOfMessages        : 10,
        timeFrequency        : 1,
        getLogger            : function(loggerName) {
            if (!Utils.isString(loggerName)) {
                throw new Error("Invalid 'loggerName' value. LoggerName must be a string value");
            }

            if (!this.loggers[loggerName]) {
                this.loggers[loggerName] = new Logging(loggerName);
            }

            return this.loggers[loggerName];
        },

        flush: function() {
            var async = extractResponder(arguments);

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
                    asyncHandler: async && new Async(cb('success'), cb('failure')),
                    url         : Backendless.serverURL + '/' + Backendless.appVersion + '/log',
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

        sendRequest          : function() {
            var logging = this;

            this.flushInterval = setTimeout(function() {
                logging.flush(new Backendless.Async());
            }, this.timeFrequency * 1000);
        },

        checkMessagesLen     : function() {
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
    }

    CustomServices.prototype = {
        invoke: function(serviceName, serviceVersion, method, parameters, async) {
            var responder = extractResponder(arguments),
                isAsync   = responder != null;

            return Backendless._ajax({
                method      : "POST",
                url         : Backendless.serverURL + '/' + Backendless.appVersion + '/services/' + serviceName + '/' + serviceVersion + '/' + method,
                data        : JSON.stringify(parameters),
                isAsync     : isAsync,
                asyncHandler: responder
            });
        }
    };

    function promisify(fn) {
        return function() {
            var context = this;
            var args = [].slice.call(arguments);

            return new Promise(function(resolve, reject)  {
                args.push(new Async(resolve, reject, context));
                fn.apply(context, args);
            });
        }
    }

    function promisifyPack(data) {
        var obj = data[0];
        var methods = data[1];

        methods.forEach(function(name) {
            obj[name] = promisify(obj[name]);
        });
    }

    function enablePromises() {
        if (promisesEnabled) {
            return;
        }

        if (typeof Promise === 'undefined') {
            throw new Error('Promises are not supported by your browser. ' +
                'Please use "Backendless.Async" to make async requests, ' +
                'or upgrade to a modern browser.\nSee ' + 'http://caniuse.com/#feat=promises');
        }

        promisesEnabled = true;

        [
            [DataPermissions.prototype.FIND, Object.keys(DataPermissions.prototype.FIND)],
            [DataPermissions.prototype.REMOVE, Object.keys(DataPermissions.prototype.REMOVE)],
            [DataPermissions.prototype.UPDATE, Object.keys(DataPermissions.prototype.UPDATE)],
            [Files.prototype, ['saveFile', 'upload', 'listing', '_doAction', 'remove', 'exists', 'removeDirectory']],
            [Commerce.prototype, ['validatePlayPurchase', 'cancelPlaySubscription', 'getPlaySubscriptionStatus']],
            [Counters.prototype, ['implementMethod', 'get', 'implementMethodWithValue', 'compareAndSet']],
            [DataStore.prototype, ['save', 'remove', 'find', 'findById', 'loadRelations']],
            [Cache.prototype, ['put', 'expireIn', 'expireAt', 'cacheMethod', 'get']],
            [persistence, ['describe', 'getView', 'callStoredProcedure']],
            [FilePermissions.prototype, ['sendRequest']],
            [CustomServices.prototype, ['invoke']],
            [Events.prototype, ['dispatch']],
            [PollingProxy.prototype, ['poll']],
            [Backendless.Logging, ['flush']],
            [Messaging.prototype, ['publish', 'sendEmail', 'cancel', 'subscribe', 'registerDevice',
                                   'getRegistrations', 'unregisterDevice']],
            [Geo.prototype, ['addPoint', 'savePoint', 'findUtil', 'loadMetadata', 'getClusterPoints', 'addCategory',
                             'getCategories', 'deleteCategory', 'deletePoint']],
            [UserService.prototype, ['register', 'getUserRoles', 'roleHelper', 'login', 'describeUserClass',
                                     'restorePassword', 'logout', 'update', 'isValidLogin', 'loginWithFacebookSdk',
                                     'loginWithGooglePlusSdk', 'loginWithGooglePlus', 'loginWithTwitter', 'loginWithFacebook',
                                     'resendEmailConfirmation']]
        ].forEach(promisifyPack);

        UserService.prototype.getCurrentUser = function() {
            if (currentUser) {
                return Promise.resolve(this._getUserFromResponse(currentUser));
            }

            var stayLoggedIn = Backendless.LocalCache.get("stayLoggedIn");
            var currentUserId = stayLoggedIn && Backendless.LocalCache.get("current-user-id");

            return currentUserId && persistence.of(User).findById(currentUserId) || Promise.resolve(null);
        };

        UserService.prototype.isValidLogin = function() {
            var userToken = Backendless.LocalCache.get("user-token");

            if (userToken) {
                return new Promise(function(resolve, reject) {
                    return Backendless._ajax({
                        method: 'GET',
                        url: Backendless.serverURL + '/' + Backendless.appVersion + '/users/isvalidusertoken/' + userToken,
                        isAsync: true,
                        asyncHandler: new Async(resolve, reject)
                    });
                });
            }

            return Backendless.UserService.getCurrentUser()
                .then(function(user) {
                    return Promise.resolve(!!user);
                }, function() {
                    return Promise.resolve(false);
                });
        };
    }

    Backendless.initApp = function(appId, secretKey, appVersion) {
        Backendless.applicationId = appId;
        Backendless.secretKey = secretKey;
        Backendless.appVersion = appVersion;
        Backendless.appPath = [Backendless.serverURL, Backendless.appVersion].join('/');
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

    var DataQuery = function () {
        this.properties = [];
        this.condition = null;
        this.options = null;
        this.url = null;
    };

    DataQuery.prototype = {
        addProperty: function(prop) {
            this.properties = this.properties || [];
            this.properties.push(prop);
        }
    };

    var GeoQuery = function() {
        this.searchRectangle = undefined;
        this.categories = [];
        this.includeMetadata = true;
        this.metadata = undefined;
        this.condition = undefined;
        this.relativeFindMetadata = undefined;
        this.relativeFindPercentThreshold = undefined;
        this.pageSize = undefined;
        this.latitude = undefined;
        this.longitude = undefined;
        this.radius = undefined;
        this.units = undefined;
        this.degreePerPixel = undefined;
        this.clusterGridSize = undefined;
    };

    GeoQuery.prototype = {
        addCategory        : function() {
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
        this.pushPolicy = args.pushPolicy || undefined;
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

    Backendless.DataQuery = DataQuery;
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