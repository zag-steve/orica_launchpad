var AppDB;
var AppStorage = {

    database: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB,
    deviceID: "",
    initGetViewOperations: [],

    startup: function() {
        var that = this;
        this.deviceID = localStorage.getItem("AppCacheID");
        if (!this.deviceID) {
            this.deviceID = this.genID();
            localStorage.setItem("AppCacheID", this.deviceID);
        }
        if (typeof this.database === "undefined" || this.database === null) {
            this._AppCache_Cache_Fallback();
        } else {
            if (typeof this.views === "undefined") {
                this.views = this.database.open("p8View", 1);
                this.views.isOpen = false;
            }
            if (typeof this.models === "undefined") {
                this.models=this.database.open("p8Model", 1);
                this.models.isOpen = false;
            }
            this.views.onupgradeneeded = function(e) {
                var db = e.target.result;
                db.createObjectStore("view", {
                    keyPath: "key"
                });
            };
            this.models.onupgradeneeded = function(e) {
                var db = e.target.result;
                db.createObjectStore("model", {
                    keyPath: "key"
                });
            };
            this.views.onsuccess = function(e) {
                that.initGetViewOperations.forEach(fn => {
                    fn();
                });
                that.initGetViewOperations = [];
                that.views.isOpen = true;
            };
            this.models.onsuccess = function(e) {
                that.models.isOpen = true;
            };
            this.views.onerror = function(e) {
                that._AppCache_Cache_Fallback();
            };
            this.models.onerror = function(e) {
                that._AppCache_Cache_Fallback();
            };
        }
    },

    getModelAll: function() {
        var that = this;
        var promise = new Promise(function(resolve, reject) {
            var db = that.models.result;
            var tx = db.transaction("model", "readwrite");
            var store = tx.objectStore("model");
            var request = store.getAll()
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function(e) {
                resolve("Error");
            };
        });
        return promise;
    },

    removeUserCache: function(uname) {
        if (!uname) uname = neptune.UserDefault.uname;
        this.getModelAll().then(function(models){
            models.forEach(model => {
                if (model.key.indexOf(uname + ":") === 0) {
                    AppStorage.deleteModel(model.key).then(function(reuslt){});
                }
            });
        });

        sap.ui.requireSync("jquery.sap.storage");
        var ls = $.sap.storage($.sap.storage.Type.local, uname);
        ls.removeAll();

        if (!this._AppCache_Open_DB()) return;
        try {
            AppDB.transaction(function(tx) {
                tx.executeSql("DELETE FROM model WHERE KEY LIKE '" + uname + ":%'");
            });
        } catch (e) {
            console.error("Error deleting from SQLite: " + e.message);
        }
    },
    
    deleteModel: async function(key) {
        var that = this;
        var promise = new Promise(function(resolve, reject) {
            var db = that.models.result;
            var tx = db.transaction("model", "readwrite");
            var store = tx.objectStore("model");
            var request = store.delete(key);
            request.onsuccess = function() {
                resolve(true);
            };
            request.onerror = function(e) {
                console.error("IndexedDB Error (AppStorage.getModel) Key " + key + request.error);
                resolve(false);
            };
        });
        return promise;
    },
    getCache: function(args, model, type, online, event, jsonh, encryption, callback, scope, isArray) {

        if (typeof args !== "object") {
            args = {
                id: args,
                model: model, 
                type: type,
                online: online,
                event: event,
                jsonh: jsonh,
                encryption: encryption,
                successFn: callback,
                errorFn: null,
                scope: scope,
                isArray: isArray
            };
        }

        if (args.type === "DB") {
            if (typeof window.openDatabase !== "undefined" || typeof window.sqlitePlugin !== "undefined") {
                this._AppCache_GetCache_DB(args);
                return;
            } else if (this.database) {
                if (neptune.ui.debug) console.warn("AppStorage.getCache: WebSQL/SQLite not available, using IndexedDB as fallback: " + args.id);
                this._AppCache_GetCache_IDB(args);
                return;
            }
        }
        if (this.database && args.type === "IDB") {
            this._AppCache_GetCache_IDB(args);
            return;
        }
        this._AppCache_GetCache_LS(args);
    },
    setCache: function(args, model, type, data, jsonh, encryption, successFn, errorFn, scope) {

        if (typeof args !== "object") {
            args = {
                id: args,
                model: model, 
                type: type,
                data: data,
                jsonh: jsonh,
                encryption: encryption,
                successFn: successFn,
                errorFn: errorFn,
                scope: scope
            };
        }
        if (args.type === "DB") {
            if (typeof window.openDatabase !== "undefined" || typeof window.sqlitePlugin !== "undefined") {
                this._AppCache_SetCache_DB(args);
                return;
            } else if ((this.database)) {
                if (neptune.ui.debug) console.warn("AppStorage.getCache: WebSQL/SQLite not available, using IndexedDB as fallback: " + args.id);
                this._AppCache_SetCache_IDB(args);
                return;
            }
        }
        if (this.database && args.type === "IDB") {
            this._AppCache_SetCache_IDB(args);
            return;
        }
        this._AppCache_SetCache_LS(args);
    },
    saveModel: function(args, retry) {
        try {
            var db = this.models.result;
            var tx = db.transaction("model", "readwrite");
            var store = tx.objectStore("model");
            var request = store.put({
                key: args.id,
                value: args.jsonData
            });   
            request.onsuccess = function () {
                if (typeof args.successFn === "function") {
                    args.successFn();
                }
            };
            request.onerror = function (e) {
                console.error("IndexedDB Error (AppStorage.saveModel) Key " + args.id + request.error);
                if (typeof args.errorFn === "function") {
                    args.errorFn(e);
                }
            }; 
        } catch (e) {

            if (!retry) {
                AppStorage.models = AppStorage.database.open("p8Model", 1);                
                AppStorage.models.onupgradeneeded = function(e) {
                    var db = e.target.result;
                    db.createObjectStore("model", {
                        keyPath: "key"
                    });
                };
                AppStorage.models.isOpen = false;
                AppStorage.models.onsuccess = function (e) {
                    AppStorage.models.isOpen = true;
                    AppStorage.saveModel(args, true);
                };
                AppStorage.models.onerror = function(e) {
                    console.error("Models IndexedDB could not be opened!");
                };
            } else {
                console.error("IndexedDB Retry error: saveModel...", e);
            }
        }
    },
    openIDBViews: function() {
        return new Promise(function (resolve, reject) {
            AppStorage.views = AppStorage.database.open("p8View", 1);
            
            AppStorage.views.onupgradeneeded = function upgradeNeeded(e) {
                var db = e.target.result;
                db.createObjectStore("view", { 
                    keyPath: 'key' 
                });
            };
            AppStorage.views.onerror = function onError(e) {
                return reject('onerror', e);
            };
            AppStorage.views.onsuccess = function (e) {
                return resolve();
            };
        });
    },
    openIDBModels: function() {
        return new Promise(function (resolve, reject) {
            AppStorage.models = AppStorage.database.open("p8Model", 1);
            
            AppStorage.models.onupgradeneeded = function upgradeNeeded(e) {
                var db = e.target.result;
                db.createObjectStore("model", { 
                    keyPath: 'key' 
                });
            };
            AppStorage.models.onerror = function onError(e) {
                return reject('onerror', e);
            };
            AppStorage.models.onsuccess = function (e) {
                return resolve();
            };
        });
    },
    getModel: function(key, isArray, retry) {
        var that = this;
        var modelType = (isArray) ? "[]" : "{}";
        return promise = new Promise(function(resolve, reject) {
            try {
                var db = that.models.result;
                var tx = db.transaction("model", "readonly");
                var store = tx.objectStore("model");
                var request = store.get(key);
                request.onsuccess = function() {
                    if (request.result) {
                        resolve(request.result.value || modelType);
                    } else {
                        resolve(modelType);
                    }
                };
                request.onerror = function(e) {
                    console.error("IndexedDB Error (AppStorage.getModel) Key " + key + request.error);
                    resolve(modelType);
                };
            } catch (e) {

                if (!retry) {
                    AppStorage.openIDBModels()
                        .then((reloadedDb) => {
                            return resolve(AppStorage.getModel(key, isArray, true));
                        })
                        .catch((e) => {
                            console.error('IndexedDB Model Error => Major Error!!!: Reloaded DB');
                            return resolve(modelType);
                        });
                } else {
                    console.error("IndexedDB Retry error: getModel...", e);
                }
            }
        });
    },
    saveView: function(key, data, retry) {
        try {
            var db = this.views.result;
            var tx = db.transaction("view", "readwrite");
            var store = tx.objectStore("view");
            var request = store.put({
                key: key,
                value: data
            });
            request.onerror = function(e) {
                console.error("IndexedDB Error (AppStorage.saveView) Key " + key + request.error);
            };
        } catch (e) {

            if (!retry) {
                AppStorage.views = AppStorage.database.open("p8View", 1);
                
                AppStorage.views.onupgradeneeded = function(e) {
                    var db = e.target.result;
                    db.createObjectStore("view", {
                        keyPath: "key"
                    });
                };
                AppStorage.views.isOpen = false;
                AppStorage.views.onsuccess = function (e) {
                    AppStorage.views.isOpen = true;
                    AppStorage.saveView(key, data, true);
                };
                AppStorage.views.onerror = function(e) {
                    console.error("Views IndexedDB could not be opened!");
                };
            } else {
                console.error("IndexedDB Retry error: saveView...", e);
            }
        }
    },
    getView: function(key, retry) {

        if (!this.views.isOpen) {
            this.initGetViewOperations.push(function() {
                AppStorage.getView(key);
            });
            return;
        }

        var that = this;
        return new Promise(function(resolve, reject) {
            try {
                var db = that.views.result;
                var tx = db.transaction("view", "readonly");
                var store = tx.objectStore("view");
                var request = store.get(key);
                request.onsuccess = function(e) {
                    if (request.result) {
                        resolve(request.result.value || "{}");
                    } else {
                        resolve("{}");
                    }
                };
                request.onerror = function(e) {
                    console.error("IndexedDB Error (AppStorage.getView) Key " + key + request.error);
                    resolve("{}");
                };
            } catch (e) {

                if (!retry) {
                    AppStorage.openIDBViews()
                        .then((reloadedDb) => {
                            return resolve(AppStorage.getView(key, true));
                        })
                        .catch((e) => {
                            console.error('IndexedDB View Error => Major Error!!!: Reloaded DB');
                            resolve("{}");
                        });
                } else {
                    console.error("IndexedDB Retry error: getView...", e);
                }
            }
        });
    },
    getViewAll: function(retry) {
        return new Promise(function(resolve, reject) {
            try {
                if (AppStorage.database) {
                    var db = AppStorage.views.result;
                    var tx = db.transaction("view", "readonly");
                    var store = tx.objectStore("view");
                    var request = store.openCursor();
                    var items = [];

                    request.onsuccess = function(evt) {
                        var cursor = evt.target.result;
                        if (cursor) {
                            items.push(cursor.value);
                            cursor.continue();
                        } else {
                            if (items.length > 0) {
                                resolve(items);
                            } else {
                                resolve([]);
                            }
                        }
                    };

                    request.onerror = function() {
                        resolve([]);
                    };

                } else {
                    var views = [];
                    
                    for(var i=0;i<localStorage.length;i++){
                        var key = localStorage.key(i);
                        var client = key.substr(11, 3);
                        var viewName = key.substr(11, 99);
                        if (key.substr(0, 9) === "state.key" && !isNaN(client)) {
                            views.push({
                                key: viewName
                            });
                        }
                    }
                    resolve(views);
                }
            } catch (e) {
    
                if (!retry) {
                    AppStorage.openIDBViews()
                        .then((reloadedDb) => {
                            return resolve(AppStorage.getViewAll(true));
                        })
                        .catch((e) => {
                            console.error('IndexedDB getViewAll Error => Major Error!!!: Reloaded DB');
                            resolve([]);
                        });
                } else {
                    console.error("IndexedDB Retry error: getViewAll...", e);
                }
            }
        });
    },
    deleteView: function(key) {
        var that = this;
        return new Promise(function(resolve, reject) {
            var db = that.views.result;
            var tx = db.transaction("view", "readwrite");
            var store = tx.objectStore("view");
            var request = store.delete(key);

            request.onsuccess = function() {
                if (request.result) {
                    resolve(request.result);
                } else {
                    resolve("[]");
                }
            };
            request.onerror = function() {
                resolve("[]");
            };
        });
    },
    deleteViewAll: function() {
        var that = this;
        var promise = new Promise(function(resolve, reject) {
//22.10.0008 #18910
            try {
//22.10.0008 #18910 End
                var db = that.views.result;
                var tx = db.transaction("view", "readwrite");
                var store = tx.objectStore("view");
                var request = store.clear();

                request.onsuccess = function() {
                    resolve(true);
                };
                request.onerror = function() {
                    resolve(false);
                };
//22.10.0008 #18910
            } catch (e) {
                resolve(false);
            }
//22.10.0008 #18910
        });
        return promise;
    },
    genID: function() { //NOT Device UUID
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    },
    sortBy: function(field, reverse, primer) {
        var key = primer ?
            function(x) {
                return primer(x[field]);
            } :
            function(x) {
                return x[field];
            };
        reverse = !reverse ? 1 : -1;
        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        };
    },

    isJSONH: function(modelData) {
        return (Array.isArray(modelData) && typeof modelData[0] === "number" && modelData.length > 1 && typeof modelData[1] === "string");
    },

    // Local Storage
    _AppCache_GetCache_LS: function(args) {
        sap.ui.requireSync("jquery.sap.storage");
        var ls = $.sap.storage($.sap.storage.Type.local, args.scope);
        var modelType = (args.isArray) ? [] : {};

        var modelJSON = ls.get(args.id);
        var modelData;

        if (typeof args.online === "function" && neptune.isEmpty(modelJSON)) {
            args.online(modelType);
        }
        if (!modelJSON) {
            if (typeof args.successFn === "function") {
                args.successFn(modelType);
            }
            if (typeof args.event === "function") {
                args.event(modelType);
            }
            return;
        }
        if (args.encryption) {
            if (modelJSON.indexOf("[") !== 0 && modelJSON.indexOf("{") !== 0) {
                var decrypted = CryptoJS.AES.decrypt(modelJSON, this.deviceID);
                modelJSON = decrypted.toString(CryptoJS.enc.Utf8);
            }
        } else {
            if (typeof modelJSON === "string") {
                if (modelJSON.indexOf("[") !== 0 && modelJSON.indexOf("{") !== 0) {
                    return;
                }
            }
        }
        if (args.jsonh) {
            if (typeof modelJSON === "string") {
                modelData = JSONH.unpack(JSON.parse(modelJSON));
            } else {
                modelData = modelJSON;
            }
        } else {
            if (typeof modelJSON === "string") {
                modelData = JSON.parse(modelJSON);
            } else {
                modelData = modelJSON;
            }
        }

        //Backward compatibility. DXP6 data in cache can be stored in JSONH
        if (AppStorage.isJSONH(modelData)) {
            modelData = JSONH.unpack(modelData);
        }
        if (args.model) {
            try {
                args.model.setData(modelData);
            } catch (error) {
                console.error("AppStorage._AppCache_GetCache_LS: Could not set data to model: " + args.id);
                args.model.setData(modelType);
            }
        }
        if (typeof args.successFn === "function") {
            args.successFn(modelData);
        }
        if (typeof args.event === "function") {
            args.event(modelData);
        }
    },
    _AppCache_SetCache_LS: function(args) {
        sap.ui.requireSync("jquery.sap.storage");
        try {
            var ls = $.sap.storage($.sap.storage.Type.local, args.scope);

            var modelData;
            if (args.data) {
                modelData = JSON.stringify(args.data);
            } else if (args.model) {
                if (args.jsonh) {
                    modelData = JSON.stringify(JSONH.pack(args.model.oData));
                } else {
                    modelData = args.model.getJSON();
                }
            }
            if (args.encryption) {
                var encrypted = CryptoJS.AES.encrypt(modelData, this.deviceID);
                modelData = encrypted.toString();
            }
            ls.remove(args.id);
            ls.put(args.id, modelData);
            if (typeof args.successFn === "function") {
                args.successFn();
            }
        } catch (e) {
            console.error(e);
            if (typeof args.errorFn === "function") {
                args.errorFn(e);
            }
        }
    },

    //WebSQL
    _AppCache_Open_DB: function() {

        if (typeof AppDB === 'undefined') {
            if (window.sqlitePlugin) {
                try {
                    AppDB = window.sqlitePlugin.openDatabase({
                        name: 'AppCache',
                        location: 2,
                    });
                    AppSync.db = AppDB;
                } catch (e) {
                    console.error('Unable to open database ' + e);
                    return false;
                }
            } else if (window.openDatabase) {
                try {
                    AppDB = window.openDatabase('AppCache', '1.0', 'AppCache', 60 * 1024 * 1024);
                    AppSync.db = AppDB;
                } catch (e) {
                    console.error('Unable to open database ' + e);
                    return false;
                }
            } else {
                console.error('Your browser do not support WebSQL');
                return false;
            }
            AppDB.transaction(function(e){
                e.executeSql("CREATE TABLE IF NOT EXISTS model (KEY VARCHAR PRIMARY KEY, VALUE VARCHAR)")
            });
        }
        return true;
    },
    _AppCache_GetCache_DB: function(args) {
        if (!this._AppCache_Open_DB()) return;
        var modelType = (args.isArray) ? [] : {};

        var that = this;
        try {
            AppDB.transaction(function(tx) {
                tx.executeSql("SELECT * FROM model WHERE KEY=?", [args.id], function(tx, results) {
                    var modelData;
                    for (var i = 0; i < results.rows.length; i++) {
                        
                        var modelJSON = results.rows.item(i).VALUE;
                        if (args.encryption) {
                            if (modelJSON.indexOf("[") !== 0 && modelJSON.indexOf("{") !== 0) {
                                var decrypted = CryptoJS.AES.decrypt(modelJSON, that.deviceID);
                                modelJSON = decrypted.toString(CryptoJS.enc.Utf8);
                            }
                        } else {
                            if (typeof modelJSON === "string") {
                                if (modelJSON.indexOf("[") !== 0 && modelJSON.indexOf("{") !== 0) {
                                    return;
                                }
                            }
                        }
                        if (args.jsonh) {
                            if (typeof modelJSON === "string") {
                                modelData = JSONH.unpack(JSON.parse(modelJSON));
                            } else {
                                modelData = modelJSON;
                            }
                        } else {
                            modelData = JSON.parse(modelJSON);
                        }

                        //Backward compatibility: DXP6 data in cache can be stored in JSONH
                        if (AppStorage.isJSONH(modelData)) {
                            modelData = JSONH.unpack(modelData);
                        }

                        // Set Model Data
                        if (args.model) {
                            try {
                                args.model.setData(modelData);
                            } catch (error) {
                                console.error("AppStorage._AppCache_GetCache_DB: Could not set data to model: " + args.id);
                                args.model.setData(modelType);
                            }
                        }

                        if (typeof args.event === "function") {
                            args.event(modelData);
                        }
                    }

                    if (results.rows.length === 0) {
                        if (typeof args.event === "function") {
                            args.event(modelData);
                        }
                    }
                    if (typeof args.successFn === "function") {
                        args.successFn(modelData);
                    }
                    if (typeof args.online === "function" && neptune.isEmpty(modelData)) {
                        args.online(modelType);
                    }
                }, null);
            });
        } catch (e) {
            console.error("Error processing SQL: " + e.message);
            return;
        }
    },
    _AppCache_SetCache_DB: function(args) {
        if (!this._AppCache_Open_DB()) return;

        var modelData;
        if (args.data) {
            modelData = JSON.stringify(args.data);
        } else {
            if (args.jsonh) {
                modelData = JSON.stringify(JSONH.pack(args.model.oData));
            } else {
                modelData = args.model.getJSON();
            }
        }
        if (args.encryption) {
            var encrypted = CryptoJS.AES.encrypt(modelData, this.deviceID);
            modelData = encrypted.toString();
        }
        try {
            AppDB.transaction(function(tx) {
                tx.executeSql("INSERT OR REPLACE INTO model (KEY,VALUE) VALUES (?,?)", [args.id, modelData], function(tx, results) {
                    if (typeof args.successFn === "function") {
                        args.successFn();
                    }
                });
            }, function(e) {
                console.error(e);
                if (typeof args.errorFn === "function") {
                    args.errorFn(e);
                }
            });
        } catch (e) {
            console.error("Error processing SQL: " + e.message);
            return;
        }
    },

    //IndexedDB
    _AppCache_GetCache_IDB: function(args) {
        var that = this;
        var modelType = (args.isArray) ? [] : {};

        (function() {
            var tries = 0;

            function check() {
                var modelData;
                if (!that.models.isOpen) {
                    tries++;
                    if (tries < 100) {
                        setTimeout(check, 50);
                    } else {
                        that._AppCache_Cache_Fallback();
                    }
                } else {
                    that.getModel(args.id, args.isArray).then(function(value) {

                        var modelData = value;
                        if (args.encryption) {
                            if (modelData.indexOf('[') !== 0 && modelData.indexOf('{') !== 0) {
                                var decrypted = CryptoJS.AES.decrypt(modelData, that.deviceID);
                                if (decrypted) {
                                    modelData = decrypted.toString(CryptoJS.enc.Utf8);
                                } else {
                                    modelData = [];
                                }
                            }
                        }
                        if (typeof modelData === 'string') {
                            modelData = JSON.parse(modelData);
                        }

                        // Backward compatibility: DXP6 data in cache can be stored in JSONH
                        if (AppStorage.isJSONH(modelData)) {
                            modelData = JSONH.unpack(modelData);
                        }

                        if (args.model) {
                            try {
                                args.model.setData(modelData);
                            } catch (error) {
                                console.error("AppStorage._AppCache_GetCache_IDB: Could not set data to model: " + args.id);
                                args.model.setData(modelType);
                            }
                        }

                        if (typeof args.successFn === "function") {
                            args.successFn(modelData);
                        }
                        if (typeof args.event === "function") {
                            args.event(modelData);
                        }
                        if (typeof args.online === "function" && neptune.isEmpty(modelData)) {
                            args.online(modelType);
                            return;
                        }
                    });
                }
            }
            check();
        })();
    },
    _AppCache_SetCache_IDB: function(args) {
        var that = this;
        var jsonData = args.data;

        if (!jsonData) {
            if (args.model) {
                jsonData = args.model.oData;
            } else {
                jsonData = {};
                if (neptune.ui.debug) console.warn("Error setting IndexedDB cache. Data model object not supplied!");
            }
        }
        if (args.encryption) {
            var encrypted = CryptoJS.AES.encrypt(JSON.stringify(jsonData), this.deviceID);
            jsonData = encrypted.toString();
        }
        (function() {
            var tries = 0;

            function check() {
                if (!that.models.isOpen) {
                    tries++;
                    if (tries < 100) {
                        setTimeout(check, 50);
                    } else {
                        that._AppCache_Cache_Fallback();
                    }
                } else {
                    that.saveModel({
                        id: args.id,
                        jsonData: jsonData,
                        successFn: args.successFn,
                        errorFn: args.errorFn
                    });
                }
            }
            check();
        })();
    },
    _AppCache_Cache_Fallback: function() {
        this._AppCache_GetCache_IDB = this._AppCache_GetCache_LS;
        this._AppCache_SetCache_IDB = this._AppCache_SetCache_LS;
        this.database = null;
    }
};
AppStorage.startup();
var sort_by = AppStorage.sortBy;