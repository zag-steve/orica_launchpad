neptune.JSON = {
    /**
     * From DXP SAP 6.1 AJAX payload is no longer a mix of JSON and JSONH. Pure JSON Should be send to the ABAP server.
     * Neptune applications loaded pre 6.1, might have cached data stored in JSONH that it tries to send to the server
     * after an upgrade => unpack that to plain JSON.
     */
    stringify: function(obj) {
        $.each(obj, function(key, data) { // IE complains about "for (const key of keys)", so cannot use "Object.keys"
            if (Array.isArray(data)) {
                if (typeof data[0] === "number") {
                    obj[key] = JSONH.unpack(data);
                }
            }
        });
        return JSON.stringify(obj);
    },
    reduce: function(data) {
        if (typeof data !== "object") return data;
        if (Array.isArray(data)) return data.map(obj => neptune.JSON.reduce(obj));
        return Object
            .keys(data)
            .map(key => [key, data[key]])
            .filter(([key, value]) => value === 0 || !!value)
            .reduce(function(acc, [key, value]) {
                if(Array.isArray(value)){
                    acc[key] = value.map(neptune.JSON.reduce);
                } else if(typeof value === "object"){
                    acc[key] = neptune.JSON.reduce(value);
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {});
    }
};
