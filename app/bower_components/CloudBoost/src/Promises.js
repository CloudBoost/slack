/*

 This is the version 1.0.0 of the CloudBoost JS/Node SDK
 This SDK is dependent on jQuery.

 */

var CB = CB || {}; //namespace.

CB.version = "1.0.0";
CB._isNode = false;
CB.Socket = null;

CB.serverUrl = 'https://api.cloudboost.io'; // server url.
CB.socketIoUrl = 'https://realtime.cloudboost.io';
CB.serviceUrl = 'https://service.cloudboost.io';

CB.io = null; //socket.io library is saved here.


CB.apiUrl = CB.serverUrl;

CB.appId = CB.appId || null;
CB.appKey = CB.appKey || null;

if (typeof(process) !== "undefined" &&
    process.versions &&
    process.versions.node) {
    CB._isNode = true;
}
else
{
    CB._isNode = false;
}

/*
 Parse codes:
 */
CB._ajaxIE8 = function(method, url, data) {
    var promise = new CB.Promise();
    var xdr = new XDomainRequest();
    xdr.onload = function() {
        var response;
        try {
            response = JSON.parse(xdr.responseText);
        } catch (e) {
            promise.reject(e);
        }
        if (response) {
            promise.resolve(response);
        }
    };
    xdr.onerror = xdr.ontimeout = function() {
        // Let's fake a real error message.
        var fakeResponse = {
            responseText: JSON.stringify({
                code: 500,
                error: "IE's XDomainRequest does not supply error info."
            })
        };
        promise.reject(fakeResponse);
    };
    xdr.onprogress = function() {};
    xdr.open(method, url);
    xdr.send(data);
    return promise;
};
CB._loadXml = function()
{
    var xmlhttp;
    var req = typeof(require) === 'function' ? require : null;
    // Load references to other dependencies
    if (typeof(XMLHttpRequest) !== 'undefined') {
        xmlhttp = XMLHttpRequest;
    } else if (typeof(require) === 'function' &&
        typeof(require.ensure) === 'undefined') {
        xmlhttp = req('xmlhttprequest').XMLHttpRequest;
    }
    xmlhttp = new xmlhttp();
    return xmlhttp;
};
CB.Promise = function() {
    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];

    this._isPromisesAPlusCompliant = false;
    this.is = function(promise) {
        return promise && promise.then && Object.prototype.toString.call(promise.then) === "[object Function]";
    };
    this.as = function() {
        var promise = new CB.Promise();
        promise.resolve.apply(promise, arguments);
        return promise;
    };
    this.error = function() {
        var promise = new CB.Promise();
        promise.reject.apply(promise, arguments);
        return promise;
    };
    this.when = function(promises) {
        // Allow passing in Promises as separate arguments instead of an Array.
        var objects;
        if (promises && (typeof promises.length === "undefined" || promises.length === null)) {
            objects = arguments;
        } else {
            objects = promises;
        }

        var total = objects.length;
        var hadError = false;
        var results = [];
        var errors = [];
        results.length = objects.length;
        errors.length = objects.length;

        if (total === 0) {
            return CB.Promise.as.apply(this, results);
        }

        var promise = new CB.Promise();

        var resolveOne = function() {
            total = total - 1;
            if (total === 0) {
                if (hadError) {
                    promise.reject(errors);
                } else {
                    promise.resolve.apply(promise, results);
                }
            }
        };

        objects.forEach(function(object, i) {
            if (CB.Promise.is(object)) {
                object.then(function(result) {
                    results[i] = result;
                    resolveOne();
                }, function(error) {
                    errors[i] = error;
                    hadError = true;
                    resolveOne();
                });
            } else {
                results[i] = object;
                resolveOne();
            }
        });

        return promise;
    };
    this._continueWhile = function(predicate, asyncFunction) {
        if (predicate()) {
            return asyncFunction().then(function() {
                return CB.Promise._continueWhile(predicate, asyncFunction);
            });
        }
        return CB.Promise.as();
    }
};

CB.Promise.is = function(promise) {
    return promise && promise.then && Object.prototype.toString.call(promise.then) === "[object Function]";
};
/**
 * Marks this promise as fulfilled, firing any callbacks waiting on it.
 * @param {Object} result the result to pass to the callbacks.
 */
CB.Promise.prototype["resolve"] = function(result) {
    if (this._resolved || this._rejected) {
        throw "A promise was resolved even though it had already been " +
        (this._resolved ? "resolved" : "rejected") + ".";
    }
    this._resolved = true;
    this._result = arguments;
    var results = arguments;
    this._resolvedCallbacks.forEach(function(resolvedCallback) {
        resolvedCallback.apply(this, results);
    });
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
};

/**
 * Marks this promise as fulfilled, firing any callbacks waiting on it.
 * @param {Object} error the error to pass to the callbacks.
 */
CB.Promise.prototype["reject"] = function(error) {
    if (this._resolved || this._rejected) {
        throw "A promise was rejected even though it had already been " +
        (this._resolved ? "resolved" : "rejected") + ".";
    }
    this._rejected = true;
    this._error = error;
    this._rejectedCallbacks.forEach(function(rejectedCallback) {
        rejectedCallback(error);
    });
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
};

/**
 * Adds callbacks to be called when this promise is fulfilled. Returns a new
 * Promise that will be fulfilled when the callback is complete. It allows
 * chaining. If the callback itself returns a Promise, then the one returned
 * by "then" will not be fulfilled until that one returned by the callback
 * is fulfilled.
 * @param {Function} resolvedCallback Function that is called when this
 * Promise is resolved. Once the callback is complete, then the Promise
 * returned by "then" will also be fulfilled.
 * @param {Function} rejectedCallback Function that is called when this
 * Promise is rejected with an error. Once the callback is complete, then
 * the promise returned by "then" with be resolved successfully. If
 * rejectedCallback is null, or it returns a rejected Promise, then the
 * Promise returned by "then" will be rejected with that error.
 * @return {CB.Promise} A new Promise that will be fulfilled after this
 * Promise is fulfilled and either callback has completed. If the callback
 * returned a Promise, then this Promise will not be fulfilled until that
 * one is.
 */
CB.Promise.prototype["then"] = function(resolvedCallback, rejectedCallback) {
    var promise = new CB.Promise();

    var wrappedResolvedCallback = function() {
        var result = arguments;
        if (resolvedCallback) {
            if (CB.Promise._isPromisesAPlusCompliant) {
                try {
                    result = [resolvedCallback.apply(this, result)];
                } catch (e) {
                    result = [CB.Promise.error(e)];
                }
            } else {
                result = [resolvedCallback.apply(this, result)];
            }
        }
        if (result.length === 1 && CB.Promise.is(result[0])) {
            result[0].then(function() {
                promise.resolve.apply(promise, arguments);
            }, function(error) {
                promise.reject(error);
            });
        } else {
            promise.resolve.apply(promise, result);
        }
    };

    var wrappedRejectedCallback = function(error) {
        var result = [];
        if (rejectedCallback) {
            if (CB.Promise._isPromisesAPlusCompliant) {
                try {
                    result = [rejectedCallback(error)];
                } catch (e) {
                    result = [CB.Promise.error(e)];
                }
            } else {
                result = [rejectedCallback(error)];
            }
            if (result.length === 1 && CB.Promise.is(result[0])) {
                result[0].then(function() {
                    promise.resolve.apply(promise, arguments);
                }, function(error) {
                    promise.reject(error);
                });
            } else {
                if (CB.Promise._isPromisesAPlusCompliant) {
                    promise.resolve.apply(promise, result);
                } else {
                    promise.reject(result[0]);
                }
            }
        } else {
            promise.reject(error);
        }
    };

    var runLater = function(func) {
        func.call();
    };
    if (CB.Promise._isPromisesAPlusCompliant) {
        if (typeof(window) !== 'undefined' && window.setTimeout) {
            runLater = function(func) {
                window.setTimeout(func, 0);
            };
        } else if (typeof(process) !== 'undefined' && process.nextTick) {
            runLater = function(func) {
                process.nextTick(func);
            };
        }
    }

    var self = this;
    if (this._resolved) {
        runLater(function() {
            wrappedResolvedCallback.apply(self, self._result);
        });
    } else if (this._rejected) {
        runLater(function() {
            wrappedRejectedCallback(self._error);
        });
    } else {
        this._resolvedCallbacks.push(wrappedResolvedCallback);
        this._rejectedCallbacks.push(wrappedRejectedCallback);
    }

    return promise;
};

/**
 * Add handlers to be called when the promise
 * is either resolved or rejected
 */
CB.Promise.prototype["always"] = function(callback) {
    return this.then(callback, callback);
};

/**
 * Add handlers to be called when the Promise object is resolved
 */
CB.Promise.prototype["done"] = function(callback) {
    return this.then(callback);
};

/**
 * Add handlers to be called when the Promise object is rejected
 */
CB.Promise.prototype["fail"] = function(callback) {
    return this.then(null, callback);
};

/**
 * Run the given callbacks after this promise is fulfilled.
 * @param optionsOrCallback {} A Backbone-style options callback, or a
 * callback function. If this is an options object and contains a "model"
 * attributes, that will be passed to error callbacks as the first argument.
 * @param model {} If truthy, this will be passed as the first result of
 * error callbacks. This is for Backbone-compatability.
 * @return {CB.Promise} A promise that will be resolved after the
 * callbacks are run, with the same result as this.
 */
CB.clone = function(obj) {
    if (! Object.prototype.toString.call(obj) === "[object Object]") return obj;
    return (Object.prototype.toString.call(obj) === "[object Array]") ? obj.slice() : new Object(obj);
};

CB.Promise.prototype["_thenRunCallbacks"] = function(optionsOrCallback, model) {
    var options;
    if (Object.prototype.toString.call(optionsOrCallback) === "[object Function]") {
        var callback = optionsOrCallback;
        options = {
            success: function(result) {
                callback(result, null);
            },
            error: function(error) {
                callback(null, error);
            }
        };
    } else {
        options = CB.clone(optionsOrCallback);
    }
    options = options || {};

    return this.then(function(result) {
        if (options.success) {
            options.success.apply(this, arguments);
        } else if (model) {
            // When there's no callback, a sync event should be triggered.
            model.trigger('sync', model, result, options);
        }
        return CB.Promise.as.apply(CB.Promise, arguments);
    }, function(error) {
        if (options.error) {
            if (! typeof model === "undefined") {
                options.error(model, error);
            } else {
                options.error(error);
            }
        } else if (model) {
            // When there's no error callback, an error event should be triggered.
            model.trigger('error', model, error, options);
        }
        // By explicitly returning a rejected Promise, this will work with
        // either jQuery or Promises/A semantics.
        return CB.Promise.error(error);
    });
}

/**
 * Returns a new promise that is fulfilled when all of the input promises
 * are resolved. If any promise in the list fails, then the returned promise
 * will fail with the last error. If they all succeed, then the returned
 * promise will succeed, with the results being the results of all the input
 * promises. For example: <pre>
 *   var p1 = Parse.Promise.as(1);
 *   var p2 = Parse.Promise.as(2);
 *   var p3 = Parse.Promise.as(3);
 *
 *   Parse.Promise.when(p1, p2, p3).then(function(r1, r2, r3) {
     *     console.log(r1);  // prints 1
     *     console.log(r2);  // prints 2
     *     console.log(r3);  // prints 3
     *   });</pre>
 *
 * The input promises can also be specified as an array: <pre>
 *   var promises = [p1, p2, p3];
 *   Parse.Promise.when(promises).then(function(r1, r2, r3) {
     *     console.log(r1);  // prints 1
     *     console.log(r2);  // prints 2
     *     console.log(r3);  // prints 3
     *   });
 * </pre>
 * @method when
 * @param {Array} promises a list of promises to wait for.
 * @static
 * @return {Parse.Promise} the new promise.
 */
CB.Promise["all"] = function(promises) {
        var objects;
        if (Array.isArray(promises)) {
            objects = promises;
        } else {
            objects = arguments;
        }

        var total = objects.length;
        var hadError = false;
        var results = [];
        var errors = [];
        results.length = objects.length;
        errors.length = objects.length;

        if (total === 0) {
            return CB.Promise.as.apply(this, results);
        }

        var promise = new CB.Promise();

        var resolveOne = function resolveOne() {
            total--;
            if (total <= 0) {
                if (hadError) {
                    promise.reject(errors);
                } else {
                    promise.resolve(results);
                }
            }
        };

        var chain = function chain(object, index) {
            if (CB.Promise.is(object)) {
                object.then(function (result) {
                    results[index] = result;
                    resolveOne();
                }, function (error) {
                    errors[index] = error;
                    hadError = true;
                    resolveOne();
                });
            } else {
                results[i] = object;
                resolveOne();
            }
        };
        for (var i = 0; i < objects.length; i++) {
            chain(objects[i], i);
        }

        return promise;

};


CB.Events = {
    trigger: function(events) {
        var event, node, calls, tail, args, all, rest;
        if (!(calls = this._callbacks)) {
            return this;
        }
        all = calls.all;
        events = events.split(eventSplitter);
        rest = slice.call(arguments, 1);

        // For each event, walk through the linked list of callbacks twice,
        // first to trigger the event, then to trigger any `"all"` callbacks.
        event = events.shift();
        while (event) {
            node = calls[event];
            if (node) {
                tail = node.tail;
                while ((node = node.next) !== tail) {
                    node.callback.apply(node.context || this, rest);
                }
            }
            node = all;
            if (node) {
                tail = node.tail;
                args = [event].concat(rest);
                while ((node = node.next) !== tail) {
                    node.callback.apply(node.context || this, args);
                }
            }
            event = events.shift();
        }

        return this;
    }
}
/**
 * Adds a callback function that should be called regardless of whether
 * this promise failed or succeeded. The callback will be given either the
 * array of results for its first argument, or the error as its second,
 * depending on whether this Promise was rejected or resolved. Returns a
 * new Promise, like "then" would.
 * @param {Function} continuation the callback.
 */
CB.Promise.prototype["_continueWith"] = function(continuation) {
    return this.then(function() {
        return continuation(arguments, null);
    }, function(error) {
        return continuation(null, error);
    });
};
