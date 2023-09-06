
var ModelData = (function() {
    var versioninfo = {
        version: '5.1.1',
        lastChanged: '2021-04-08',
        authors: 'Neptune Software, Max Schaufler',
    };

    var version = versioninfo.version;

    /**
     * ModelData FindFirst
     * Returns the first result of a Find operation
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            values: value(s),
            operators: operator(s),
            fnCallback: callback function, result array as argument
        }
     *
     * Legacy arguments:
     *   source, key, val, oper, callBack
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var FindFirst = function(argsObject, sKey, sValue, sOper=undefined, callBack=undefined) {
        var oSource = argsObject;
        if (isArgsObject(argsObject)) {
            oSource = argsObject.source;
            sKey = argsObject.keys;
            sValue = argsObject.values;
            sOper = argsObject.operators;
            callBack = argsObject.fnCallback;
            argsObject.fnCallback = null;
            // do NOT pass on the callback function, will be executed here!
        }
        // no parameter checking, passing on to internal methods
        var aResults = Find(oSource, sKey, sValue, sOper);
        var resultObject = false;
        if (aResults.length > 0) {
            resultObject = aResults[0];
        }
        if (resultObject && typeof callBack === 'function') {
            callBack(resultObject);
        }
        return resultObject;
    };

    /**
     * ModelData LookupValue
     * Returns a certain field value from the first result entry
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            values: value(s),
            lookupField: field to retrieve,
            operators: operator(s),
            fnCallback: callback function, result array as argument
        }
     *
     * Legacy arguments:
     *   source, key, val, oper, callBack
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var LookupValue = function(argsObject, sKey, sValue, sField, sOper, callBack) {
        var oSource = argsObject;
        if (isArgsObject(argsObject)) {
            oSource = argsObject.source;
            sKey = argsObject.keys;
            sValue = argsObject.values;
            sField = argsObject.lookupField;
            sOper = argsObject.operators;
            callBack = argsObject.fnCallback;
        }
        // no parameter checking, passing on to internal methods
        var result = FindFirst(oSource, sKey, sValue, sOper, callBack);
        if (result) {
            return getAttributeViaPath(result, sField);
        } else {
            return sValue;
        }
    };

    var FindDB = function(obj, table, queryString, queryData, callBack) {
        if (typeof AppSync.db === 'undefined') {
            if (typeof callBack === 'function') {
                callBack();
            }
            return;
        }
        var model = v4_getModel(obj);
        var newArr = [];
        var qData = [];
        if (typeof queryData === 'string') {
            qData[0] = queryData;
        } else {
            qData = queryData;
        }
        AppSync.db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM ' + table + ' WHERE ' + queryString, qData, function(tx, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var obj = results.rows.item(i);
                    for (var p in obj) {
                        if (obj[p] === 'false') {
                            obj[p] = false;
                        }
                        if (obj[p] === 'true') {
                            obj[p] = true;
                        }
                    }
                    newArr.push(obj);
                }
                // model.setData(newArr);
                _modelSetData(model, newArr);
                if (typeof callBack === 'function') {
                    callBack();
                }
            }, null, );
        }, function(tx) {
            if (tx.code !== '0') {
                console.log(tx.message);
                callBack();
            }
        }, );
    };

    var _Compare = function(lookIn, lookFor, oper) {
        if (Array.isArray(lookIn) && lookFor !== null && typeof lookFor == 'object' && Object.keys(lookFor).length > 0) {
            // if search subject is an array, and lookFor is an object,
            //   >> we assume lookIn holds objects as well
            //   then look through all entries, if one matches then the parent object entry matches
            var bCompare = false;
            // start with false, but use OR to compare results, any one is fine
            // let's try this as a recursive call of ModelData.Find, since we can use arrays now!!
            Object.keys(lookFor).forEach(function(key) {
                bCompare = bCompare || Find(lookIn, key, lookFor[key], oper).length > 0;
            });
            return bCompare;
        } else if (Array.isArray(lookIn)) {
            // if search subject is an array, and lookFor is a simple value
            //   >> we assume lookIn holds simple values as well
            //   then look through all entries, if one matches then the parent object entry matches
            var bCompare = false;
            // start with false, but use OR to compare results, any one is fine
            lookIn.forEach(function(lookInValue) {
                bCompare = bCompare || _CompareSimpleValues(lookInValue, lookFor, oper);
            });
            return bCompare;
        } else if (typeof lookIn == 'object' && lookFor !== null && typeof lookFor == 'object' && Object.keys(lookFor).length > 0) {
            var bCompare = true;
            // start with true, but use AND to compare results, all must match
            // if object is used as a search criteria, all its attributes must match!
            Object.keys(lookFor).forEach(function(key) {
                bCompare = bCompare && _CompareSimpleValues(lookIn[key], lookFor[key], oper);
            });
            return bCompare;
        } else {
            return _CompareSimpleValues(lookIn, lookFor, oper);
        }
    };

    var _CompareSimpleValues = function(lookIn, lookFor, oper) {
        var bCompare = false;
        switch (oper) {
        case 'Contains':
            bCompare = lookIn.indexOf(lookFor) != -1;
            break;

        case 'NE':
            bCompare = lookIn != lookFor;
            break;

        case 'GT':
            bCompare = lookIn > lookFor;
            break;

        case 'GE':
            bCompare = lookIn >= lookFor;
            break;

        case 'LT':
            bCompare = lookIn < lookFor;
            break;

        case 'LE':
            bCompare = lookIn <= lookFor;
            break;

        case 'BT':
            if (Array.isArray(lookFor) && lookFor.length == 2) {
                bCompare = lookIn >= lookFor[0] && lookIn <= lookFor[1];
            }
            break;

        case 'StartsWith':
            bCompare = lookFor.toString().length <= lookIn.toString().length && lookFor.toString() == lookIn.toString().substr(0, lookFor.toString().length);
            break;

        case 'EndsWith':
            bCompare = lookFor.toString().length <= lookIn.toString().length && lookFor.toString() == lookIn.toString().substr(lookIn.toString().length - lookFor.toString().length, lookFor.toString().length, );
            break;

        default:
            // EQ
            bCompare = lookIn == lookFor;
            break;
        }
        return bCompare;
    };

    var pathSeparator = '/';

    var isPath = function(path) {
        return path.search(pathSeparator) > 0;
    };
    var splitPath = function(path) {
        return path.split(pathSeparator);
    };
    var joinPath = function(pathArray) {
        return pathArray.join(pathSeparator);
    };
    var getAttributeViaPath = function(obj, keyPath) {
        if (isPath(keyPath)) {
            // path found, split and call recursively
            pathArray = splitPath(keyPath);
            firstPart = pathArray.shift();
            // checks first
            // element found at firstPart of path  ...
            if (typeof obj[firstPart] == 'object') {
                // ... is an object, call next level
                return getAttributeViaPath(obj[firstPart], joinPath(pathArray));
            } else {
                // ... is not an object
                return obj[firstPart];
            }
        } else {
            // no path found, direct compare
            return obj[keyPath];
        }
    };
    var setAttributeViaPath = function(obj, keyPath, newValue) {
        if (isPath(keyPath)) {
            // path found, split and call recursively
            pathArray = splitPath(keyPath);
            firstPart = pathArray.shift();
            // checks first
            // element found at firstPart of path  ...
            if (typeof obj[firstPart] == 'object') {
                // ... is an object, call next level
                setAttributeViaPath(obj[firstPart], joinPath(pathArray), newValue);
            } else {
                // ... is not an object
                obj[firstPart] = newValue;
            }
        } else {
            // no path found, direct set
            obj[keyPath] = newValue;
        }
    };

    var _ComparePath = function(obj, keyPath, val, oper) {
        var attributeValue = getAttributeViaPath(obj, keyPath);
        return _Compare(attributeValue, val, oper);
    };

    var _CompareObjWithArray = function(obj, key, val, oper) {
        var bCompare = true;
        key.forEach(function(keyElem, IDX, ARR) {
            bCompare = bCompare && _ComparePath(obj, keyElem, val[IDX], oper[IDX]);
        });
        return bCompare;
    };

    var _CompareObjWithObj = function(obj, key, objComp, oper) {
        var bCompare = true;
        key.forEach(function(keyElem, IDX, ARR) {
            bCompare = bCompare && _ComparePath(obj, keyElem, objComp[keyElem], oper[IDX]);
        });
        return bCompare;
    };

    /**
     * getModel implementation from ModelData v4
     */
    var v4_getModel = function(obj) {
        var model = obj.getModel();
        if (model && typeof model.oData !== 'undefined' && typeof model.oData.length === 'undefined')
            model.oData = [];
        if (model && typeof model.oData === 'undefined')
            model.oData = [];
        return model;
    };

    /**
     * Provide uniform access to the data source for all three possible sources:
     *   - Control, on which a model is set
     *   - Model, a JSONModel element
     *   - Array, the data array itself
     */
    function ModelDataSource(source) {
        var Types = {
            array: 'array',
            control: 'control',
            model: 'model',
        };
        var sourceArray = [];
        var sourceControl = null;
        var sourceModel = null;
        var sourceType = '';

        var getArray = function() {
            switch (sourceType) {
            case Types.model:
                return sourceModel.getData();

            case Types.control:
                // return sourceControl.getModel().getData();
                return v4_getModel(sourceControl).getData();
                // really necessary?

            case Types.array:
                return sourceArray;
            }
            throw 'ModelData: bad type for source / ' + this;
        };

        var updateData = function(array) {
            switch (sourceType) {
            case Types.model:
                // sourceModel.setData(array);
                _modelSetData(sourceModel, array);
                break;

            case Types.control:
                // sourceControl.getModel().setData(array);
                _modelSetData(sourceControl.getModel(), array);
                break;

            case Types.array:
                // no update necessary, array already modified directly
                break;
            }
        };

        if (Array.isArray(source)) {
            sourceType = Types.array;
            sourceArray = source;
        } else if (typeof source.getMetadata == 'function') {
            if (source.getMetadata()._sClassName == 'sap.ui.model.json.JSONModel') {
                sourceType = Types.model;
                sourceModel = source;
            } else {
                sourceType = Types.control;
                sourceControl = source;
            }
        } else {
            // bad source
            throw 'ModelData: bad source / ' + source;
        }

        return {
            getArray: getArray,
            updateData: updateData,
        };
    }

    var isArgsObject = function(argsObject) {
        var isArgsObject = false;
        if (typeof argsObject == 'object' && // must be an object
        typeof argsObject.getMetadata != 'function' && // must not be a UI5 element
        typeof argsObject.source != 'undefined') {
            // must at least have source parameter set, all ModelData functions require that
            isArgsObject = true;
        }
        return isArgsObject;
    };

    var ensureArray = function(data) {
        if (!Array.isArray(data)) {
            data = data === undefined ? [] : [data];
        }
        return data;
    };

    var ensureOperator = function(oper, length) {
        var defaultOperator = 'EQ';
        var fillOperator = defaultOperator;
        if (!Array.isArray(oper)) {
            // if only a single value was passed, use it for all the operator array entries
            fillOperator = oper;
            oper = [];
        }
        for (var i = oper.length; i < length; i++) {
            oper[i] = fillOperator;
        }
        return oper;
    };

    /**
     * ModelData Find
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            values: value(s),
            operators: operator(s),
            fnCallback: callback function, result array as argument
        }
     *
     * Legacy arguments:
     *   source, key, val, oper, callBack
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var Find = function(argsObject, key, val, oper=undefined, callBack=undefined) {
        var source = argsObject;
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            key = argsObject.keys;
            val = argsObject.values;
            oper = argsObject.operators;
            callBack = argsObject.fnCallback;
        }
        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();
        var ret = [];
        if (!Array.isArray(arr) || arr.length == 0)
            return ret;

        // create array for all parameters, to have only one codeline for handling
        // TODO only create arrays if both parameters are the same, either array or none-array
        //  this will be necessary to proceed with new use cases, finding data within nested arrays
        //  maybe handle like this: if array in data object is found, start a sub-find for the given data!
        key = ensureArray(key);
        val = ensureArray(val);
        oper = ensureOperator(oper, key.length);
        // if (!Array.isArray(key)) key = key === undefined ? [] : [key];
        // if (!Array.isArray(val)) val = val === undefined ? [] : [val];
        // if (typeof(oper) == "undefined") oper = 'EQ'; // Default = EQ
        // if (!Array.isArray(oper)) {
        //     var operSingle = oper;
        //     oper = [];
        //     key.forEach(function(ELEM, IDX, ARR) {
        //         oper.push(operSingle);
        //     });
        // }

        if (key.length != val.length || key.length != oper.length)
            return ret;
        // parameter arrays not equal size

        if (key.length === 0) {
            ret = arr;
        } else {
            ret = arr.filter(function(arrObj) {
                return _CompareObjWithArray(arrObj, key, val, oper);
            });
        }

        if (typeof callBack === 'function') {
            callBack(ret);
        }

        // Memory Clearing
        arr = null;
        return ret;
    };

    /**
     * ModelData Add
     *
     argsObject = {
            source: dataSource,
            data: dataObject
        }
     *
     * Legacy arguments:
     *   source, rec
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var Add = function(argsObject, rec) {
        var source = argsObject;
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            rec = argsObject.data;
        }
        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();
        arr.push(rec);
        oSource.updateData(arr);
    };

    /**
     * ModelData Add Array
     *
     argsObject = {
            source: dataSource,
            data: dataArray
        }
     *
     * Legacy arguments:
     *   source, addArr
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var AddArray = function(argsObject, addArr) {
        var source = argsObject;
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            addArr = argsObject.data;
        }

        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();
        for (var i = 0; i < addArr.length; i++) {
            arr.push(addArr[i]);
        }
        oSource.updateData(arr);
    };

    /**
     * ModelData Delete
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            values: value(s),
            operators: operator(s),
            fnCallback: callback function
        }
     *
     * Legacy arguments:
     *   source, key, val, oper
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var Delete = function(argsObject, key, val, oper=undefined) {
        var source = argsObject;
        var fnCallBack;
        // define here, because was not a legacy argument
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            key = argsObject.keys;
            val = argsObject.values;
            oper = argsObject.operators;
            callBack = argsObject.fnCallback;
        }
        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();
        if (!Array.isArray(arr) || arr.length == 0)
            return;

        // create array for all parameters, to have only one codeline for handling
        key = ensureArray(key);
        val = ensureArray(val);
        oper = ensureOperator(oper, key.length);

        if (key.length != val.length || key.length != oper.length)
            return;
        // parameter arrays not equal size

        var deletes = [];
        if (key.length === 0) {
            arr = [];
        } else {
            for (var ai, i = arr.length; i--; ) {
                if (_CompareObjWithArray(arr[i], key, val, oper)) {
                    var deleted = arr.splice(i, 1);
                    deletes.push(deleted[0]);
                }
            }
        }
        oSource.updateData(arr);

        if (typeof callBack === 'function') {
            callBack(deletes);
        }
    };

    /**
     * ModelData UpdateField
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            values: value(s),
            updateKeys: keyField(s) to update,
            updateValues: value(s) for update,
            operators: operator(s),
            fnCallback: callback function, receives array updated entries
        }
     *
     * Legacy arguments:
     *   source, key, val, updKey, updVal, oper
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var UpdateField = function(argsObject, key, val, updKey, updVal, oper=undefined) {
        var source = argsObject;
        var fnCallBack;
        // define here, because was not a legacy argument
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            key = argsObject.keys;
            val = argsObject.values;
            updKey = argsObject.updateKeys;
            updVal = argsObject.updateValues;
            oper = argsObject.operators;
            callBack = argsObject.fnCallback;
        }
        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();
        if (typeof updKey == 'undefined')
            return;

        // create array for all parameters, to have only one codeline for handling
        key = ensureArray(key);
        val = ensureArray(val);
        updKey = ensureArray(updKey);
        updVal = ensureArray(updVal);
        oper = ensureOperator(oper, key.length);

        if (key.length != val.length || key.length != oper.length)
            return;
        // parameter arrays not equal size
        if (updKey.length != updVal.length)
            return;

        var updates = [];
        for (var ai, i = arr.length; i--; ) {
            if (_CompareObjWithArray(arr[i], key, val, oper)) {
                updKey.forEach(function(ELEM, IDX, ARR) {
                    setAttributeViaPath(arr[i], ELEM, updVal[IDX]);
                    //arr[i][ELEM] = updVal[IDX];
                });
                updates.push(arr[i]);
            }
        }
        oSource.updateData(arr);

        if (typeof callBack === 'function') {
            callBack(updates);
        }
    };

    /**
     * ModelData Update
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            values: value(s),
            data: dataObject,
            operators: operator(s),
            fnCallback: callback function, receives array updated entries
        }
     *
     * Legacy arguments:
     *   source, key, val, rec, oper
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var Update = function(argsObject, key, val, rec, oper=undefined) {
        var source = argsObject;
        var fnCallBack;
        // define here, because was not a legacy argument
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            key = argsObject.keys;
            val = argsObject.values;
            rec = argsObject.data;
            oper = argsObject.operators;
            callBack = argsObject.fnCallback;
        }

        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();

        // var model = getModel(obj);
        // var arr = model.oData;
        var upd = false;
        // // First record
        // if (typeof mData == 'undefined') {
        //     var mData = new Array();
        // }

        // create array for all parameters, to have only one codeline for handling
        key = ensureArray(key);
        val = ensureArray(val);
        oper = ensureOperator(oper, key.length);

        if (key.length != val.length || key.length != oper.length)
            return;
        // parameter arrays not equal size

        // Update
        var updates = [];
        if (key.length > 0) {
            for (var ai, i = arr.length; i--; ) {
                if (_CompareObjWithArray(arr[i], key, val, oper)) {
                    arr[i] = rec;
                    upd = true;
                    updates.push(arr[i]);
                }
            }
        }
        if (upd !== true) {
            arr.push(rec);
        }
        oSource.updateData(arr);

        if (typeof callBack === 'function') {
            callBack(updates);
        }
    };

    /**
     * ModelData Update Array
     *
     argsObject = {
            source: dataSource,
            keys: keyField(s),
            data: dataArray,
            operators: operator(s),
            fnCallback: callback function, receives array updated entries
        }
     *
     * Legacy arguments:
     *   source, key, updateArr, oper
     * => DO NOT ADD ARGUMENTS, only add additional attributes to the argument object
     */
    var UpdateArray = function(argsObject, key, updateArr, oper) {
        var source = argsObject;
        var fnCallBack;
        // define here, because was not a legacy argument
        if (isArgsObject(argsObject)) {
            source = argsObject.source;
            key = argsObject.keys;
            updateArr = argsObject.data;
            oper = argsObject.operators;
            callBack = argsObject.fnCallback;
        }

        var oSource = new ModelDataSource(source);
        var arr = oSource.getArray();
        // var model = getModel(obj);
        // var mData = model.oData;
        var upd = false;
        // // First record
        // if (typeof mData.length == 'undefined') {
        //     mData = [];
        // }

        // create array for all parameters, to have only one codeline for handling
        key = ensureArray(key);
        oper = ensureOperator(oper, key.length);

        if (key.length != oper.length)
            return;
        // parameter arrays not equal size

        // $.each(updateArr, function(i, newData) {
        var updates = [];
        updateArr.forEach(function(newData) {
            upd = false;
            if (key.length > 0) {
                for (i = 0; i < arr.length; i++) {
                    if (_CompareObjWithObj(arr[i], key, newData, oper)) {
                        arr[i] = newData;
                        upd = true;
                        updates.push(arr[i]);
                    }
                }
            }
            if (upd === false) {
                arr.push(newData);
            }
        });
        oSource.updateData(arr);

        if (typeof callBack === 'function') {
            callBack(updates);
        }
    };

    //  UUID
    var genID = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7) | 0x8).toString(16);
        });
        return uuid;
    };

    var refreshDelayed = false;
    var refreshDelayedModels = new Map();
    var autoRefreshDelayed = true;
    var autoRefreshTimeout = null;
    var autoRefreshDelay = 0;

    function _modelSetData(model, data) {
        if (refreshDelayed) {
            model.oData = data;
            refreshDelayedModels.set(model.getId(), model);
        } else {
            if (autoRefreshDelayed) {
                model.oData = data;
                refreshDelayedModels.set(model.getId(), model);
                clearTimeout(autoRefreshTimeout);
                autoRefreshTimeout = setTimeout(doRefresh, autoRefreshDelay);
            } else {
                model.setData(data);
            }
        }
    }

    function delayRefresh() {
        refreshDelayed = true;
    }

    function doRefresh() {
        for (const [id,model] of refreshDelayedModels) {
            model.refresh();
        }
        refreshDelayedModels = new Map();
        refreshDelayed = false;
    }

    function setAutoDelayRefresh(bAutoDelay) {
        autoRefreshDelayed = bAutoDelay;
    }

    function setAutoDelayRefreshTimeout(delayInMs) {
        try {
            delayInMs = parseInt(delayInMs);
            if (isNaN(delayInMs)) {
                console.error('Value for Delay-Timeout must be an integer (milliseconds)');
                return;
            }
            autoRefreshDelay = delayInMs;
        } catch (e) {
            console.error(e);
        }
    }

    return {
        Find: Find,
        FindFirst: FindFirst,
        LookupValue: LookupValue,
        FindDB: FindDB,
        Add: Add,
        AddArray: AddArray,
        Update: Update,
        UpdateArray: UpdateArray,
        UpdateField: UpdateField,
        Delete: Delete,
        getModel: v4_getModel,
        // legacy support
        genID: genID,
        versioninfo: versioninfo,
        version: version,

        delayRefresh: delayRefresh,
        doRefresh: doRefresh,
        setAutoDelayRefresh: setAutoDelayRefresh,
        setAutoDelayRefreshTimeout: setAutoDelayRefreshTimeout,
    };
}
)();