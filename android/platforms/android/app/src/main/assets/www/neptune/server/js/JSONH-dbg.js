var JSONH = function(Array, JSON) {

    function getKeys(modelData) {
        var keys = [];
        $.each(modelData, function(i, data) {
            for (var name in data) {
                if ($.inArray(name, keys) === -1) {
                    keys.push(name);
                }
            }
        });
        return keys;
    }

    function hpack(list) {
        for (var
            length = list.length,
            keys = getKeys(list),
            klength = keys.length,
            result = Array(length * klength),
            i = 0,
            j = 0,
            ki, o; i < length; ++i) {
            for (
                o = list[i], ki = 0; ki < klength; result[j++] = o[keys[ki++]]
            );
        }
        return concat.call([klength], keys, result);
    }

    function hunpack(hlist) {
        if (typeof hlist[0] === "object") {
            return hlist;
        }
        for (var
            length = hlist.length,
            klength = hlist[0],
            result = Array(((length - klength - 1) / klength) || 0),
            i = 1 + klength,
            j = 0,
            ki, o; i < length;) {
            for (
                result[j++] = (o = {}), ki = 0; ki < klength; o[hlist[++ki]] = hlist[i++]
            );
        }
        return result;
    }

    // JSONH.pack
    function pack(list) {
        if (!list.length) {
            return list;
        } else {
            return hpack(list);
        }
    }

    // JSONH unpack
    function unpack(hlist) {
        if (!hlist || !hlist.length) {
            return []; //hlist;
        } else {
            return hunpack(hlist);
        }
    }

    // JSON.stringify after JSONH.pack
    function stringify(list, replacer, space, schema) {
        return JSON_stringify(pack(list, schema), replacer, space);
    }

    // JSONH.unpack after JSON.parse
    function parse(hlist, reviver, schema) {
        return unpack(JSON_parse(hlist, reviver), schema);
    }

    var arr = [],
        concat = arr.concat,
        isArray = Array.isArray || (function(toString, arrayToString) {
            arrayToString = toString.call(arr);
            return function isArray(o) {
                return toString.call(o) == arrayToString;
            };
        }({}.toString)),

        map = arr.map || function(callback, context) {
            for (var
                self = this, i = self.length, result = Array(i); i--; result[i] = callback.call(context, self[i], i, self));
            return result;
        },
        JSON_stringify = JSON.stringify,
        JSON_parse = JSON.parse;

    return {
        pack: pack,
        parse: parse,
        stringify: stringify,
        unpack: unpack
    };

}(Array, JSON);

var jsonh = JSONH;
