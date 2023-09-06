neptune.isEmpty = function (data) {
    if (!data) return true;
    if (Array.isArray(data) && data.length === 0) {
        return true;
    }
    if (typeof data === "object" && Object.keys(data).length === 0 && data.constructor === Object) {
        return true;
    }
    return false;
};

neptune.clone = function (data) {
    return JSON.parse(JSON.stringify(data));
}

neptune.IECheck = function () {
    var useragant = window.navigator.userAgent;
    if (useragant.indexOf("Trident") > -1) {
        document.getElementById("topShell").innerHTML = "<style type='text/css'>" + ".sapUiBody {font-family:arial;font-size:18px; line-height:1.3; background: #3f5161; color:#fff;}" + ".nepLaunchpadShell {position: absolute;}" + "h1 {font-family: arial;font-weight: normal;font-size:40px;line-height:1.2;color: #EBB700;margin-bottom: 0;}" + ".wrap {width:80%;margin:70px auto;position: relative;}" + ".space {height:40px;}" + "li, ul {margin:0;padding:0;}" + "li {list-style: none;margin-left: 20px;}" + "li span {width:14px;height: 14px;position: relative;border:1px solid #EBB700;display: inline-block;margin-right:10px;" + "-moz-border-radius: 30px; -webkit-border-radius: 28px; border-radius: 28px;}" + ".bar {position: absolute;background: #EBB700;width:120px;height: 8px;bottom:-20px;left:0px;}" + "</style>" + "<div class='wrap'>" + "<h1>Browser not supported</h1>" + "<div class='space'></div>" + "<ul>" + "<li><span></span>Microsoft Internet Explorer is not supported</li>" + "<li><span></span>Please use a modern browser like Google Chrome or Microsoft Edge</li>" + "</ul>" + "</div>"
    }
};

neptune.Artifact = {
    create: function (options, success, error) {
        neptune.Utils.api({
            path: "/neptune/core",
            operation: "artifactCreate",
            type: "POST",
            data: JSON.stringify({
                GS_RECENT: options
            }),
            success: success,
            error: error
        });
    },
    update: function (options, success, error) {
        neptune.Utils.api({
            path: "/neptune/core",
            operation: "artifactUpdate",
            type: "POST",
            data: JSON.stringify({
                GS_RECENT: options.metaData,
                GT_RECENT: options.recentItems
            }),
            success: success,
            error: error
        });
    },
    reset: function (options, success, error) {
        neptune.Utils.api({
            path: "/neptune/core",
            operation: "artifactReset",
            type: "POST",
            data: JSON.stringify({
                GS_RECENT: options
            }),
            success: success,
            error: error
        });
    },
    Filter: {        
        update: function (options, success, error) {
            neptune.Utils.api({
                path: "/neptune/core",
                operation: "artifactFilterUpdate",
                type: "POST",
                data: JSON.stringify({
                    GS_RECENT: options.metaData,
                    GT_RECENT_FILTER: options.recentFilters
                }),
                success: success,
                error: error
            });
        }
    }
};

neptune.Utils = {

    hash: function(str) {
        return CryptoJS.MD5(str).toString().toUpperCase();
    },

    ConvertFlatToNested: function(n, r, t) {
        for (var e, h, u, a = [], c = {}, o = 0, f = n.length; f > o; o++) e = n[o], h = e[r], u = e[t] || 0, c[h] = c[h] || [],
            e.children = c[h], 0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
        return {
            "children": a
        };
    },

    ConvertNestedToFlat: function(a) {
        if (typeof a.children === "undefined" || !Array.isArray(a.children) || a.children.length === 0) {
            return a;
        }
        var b = [],
            c = function(a) {
                $.each(a, function(a, d) {
                    d.children && (c(d.children), delete d.children), b.push(d);
                });
            };
        c(JSON.parse(JSON.stringify(a.children)));
        return b;
    },

    ConvertDatesToString: function(t) {
        Date.prototype._yyyymmdd = function() {
            var t = this.getMonth() + 1,
                o = this.getDate();
            return [this.getFullYear(), (t > 9 ? "" : "0") + t, (o > 9 ? "" : "0") + o].join("");
        };
        for (var o in t.oData) "function" == typeof t.oData[o]._yyyymmdd && (t.oData[o] = t.oData[o]._yyyymmdd());
        return t;
    },

    Core: {

        appChangeRead: function (options, success, error) {
            neptune.Utils.api({
                path: "/neptune/core",
                operation: "appChangeRead",
                type: "GET",
                options: options,
                success: success,
                error: error
            });
        },

        planetImageRead: function (options, success, error) {
            neptune.Utils.api({
                path: "/neptune/core",
                operation: "planetImageRead",
                type: "GET",
                options: options,
                success: success,
                error: error
            });
        }
    },

    /**
     * Trace when an object property changes
     * var obj = {
     *     name: "Name",
     *     address: "Street 123"
     * }
     * neptune.Utils.trace(obj, "name");
     */
    trace: function (object, property, operation) {
        var value = object[property];
        operation = operation || "both",
            Object.defineProperty(object, property, {
                get: function () {
                    if (operation === "both" || operation === "get") {
                        console.trace("${property} requested");
                    }
                    return value;
                },
                set: function (newValue) {
                    if (operation === "both" || operation === "set") {
                        console.trace("setting ${property} to ", newValue);
                    }
                    value = newValue;
                }
            });
    },
    
//22.10.0007 #18854
    formatHashData: function(hashData) {
        if (!hashData) return "";
        if (typeof hashData === "object") {
            return hashData;
        }
        let formattedHashData = "";
        const decodedHashData = decodeURIComponent(hashData);    
        try {
            formattedHashData = JSON.parse(decodedHashData);
        } catch (e) {
            formattedHashData = decodedHashData;
        }
        return formattedHashData;
    },
//22.10.0007 #18854 End

    urlHelper: {

        getLoginPingUrl: function () {
            var urlPath = "";
            var urlBase = AppCache.UrlBase || "";

            if (AppCache.allowIcfNode) {
                urlPath = "/" + AppCache.allowIcfNode.toLowerCase();
            }
            var prefix = this.getUrlPrefix();
            var loginUrl = urlBase + prefix + urlPath + "/native/neptune_login_ping.html";
            return loginUrl;
        },

        getLogoutPingUrl: function () {
            var urlPath = "";
            var urlBase = AppCache.UrlBase || "";

            if (AppCache.allowIcfNode) {
                urlPath = "/" + AppCache.allowIcfNode.toLowerCase();
            }
            var prefix = this.getUrlPrefix();
            var logoutUrl = urlBase + prefix + urlPath + "/native/neptune_login_ping.html?sap-clearsso2";
            return logoutUrl;
        },

        getUrlPrefix: function () {
            var prefix = '/neptune';

            if (typeof AppCache.extIcfAlias !== "undefined" && AppCache.extIcfAlias !== "") {
                prefix = AppCache.extIcfAlias;
            }
            if (prefix.substr(0, 1) != "/") {
                prefix = '/' + prefix;
            }
            if (prefix.substr(prefix.length - 1, 1) == "/") {
                prefix = prefix.substr(0, prefix.length - 1);
            }
            return prefix;
        },

        getApiUrl: function (options) {
            var url;
            var urlBase = AppCache.UrlBase || "";
            var urlPath = '/';

            if (AppCache.allowIcfNode) {
                urlPath = urlPath + AppCache.allowIcfNode.toLowerCase() + '/';
            }
            if (urlPath.substr(1, 1) === "/") {
                urlPath = urlPath.substr(1);
            }
            var path = options.path;
            if (path.substr(0, 1)) {
                path = path.substr(1);
            }
            var prefix = this.getUrlPrefix();

            // Clear SSO
            var url = urlBase + prefix + '/api' + urlPath + path + '/' + options.operation;

            return url;
        }
    },

    jsonDeserialize: function (json) {

        if (typeof json === "undefined" || json === null || typeof json === "boolean") {
            return json;
        }

        if (Array.isArray(json) && neptune.Utils.isJSONH(json)) {
            json = JSONH.unpack(json);
            json = neptune.Utils.jsonDeserialize(json);
        } else {
            for (var property in json) {
                if (Array.isArray(json[property])) {
                    if (neptune.Utils.isJSONH(json[property])) {
                        json[property] = JSONH.unpack(json[property]);
                        neptune.Utils.jsonDeserialize(json[property]);
                    } else {
                        neptune.Utils.jsonDeserialize(json[property]);
                    }
                } else if (typeof json[property] === "object") {
                    neptune.Utils.jsonDeserialize(json[property]);
                }
            }
        }
        return json;
    },

    jsonDecode: function(encoded) {
        try {
            const decoded = atob(encoded);
            const json = decodeURIComponent(decoded);
            const obj = JSON.parse(json);
            return obj;
        } catch (error) {
            if (neptune.ui.debug) console.warn("Error decoding JSON");
            return encoded;
        }
    },

    isJSONH: function(json) {
        if (typeof json[0] === "number") {
            if (json.length > 0 && typeof json[1] === "number") return false;
            for (var i = 1; i <= json[0]; i++) {
                if (typeof json[i] !== "string") {
                    return false;
                };
            }
            return true;
        } else {
            return false;
        }
    },

    api: function (config) {

        const path = config.path;
        const operation = config.operation;
        const data = config.data || "";
        const parameters = config.options || {};
        const success = config.success || function () { };
        const error = config.error || function () { };
        const type = config.type || "GET";

        if (neptune.public) {
            success({});
            return;
        }

        var apiUrl = neptune.Utils.urlHelper.getApiUrl({
            path: path,
            operation: operation
        });
        let query = "";
        let del = "";
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                if (parameters[key]) {
                    query += del + key + "=" + parameters[key];
                    del = "&";
                }
            }
        }
        if (!!query) query = "?" + query;
        const url = apiUrl + query;

        $.ajax({
            type: type,
            contentType: "application/json",
            url: url,
            dataType: "json",
            data: data,
            success: function (data) {
                success(data.result);
            },
            error: function (result, status, errorThrown) {
                error(result, status, errorThrown);
            }
        });
    },

    userDefault: {

        read: function (options, success, error) {
            if (!success) success = function () { };
            neptune.Utils.api({
                path: "/neptune/userdefault",
                operation: "read",
                type: "GET",
                options: options,
                success: function (result) {
                    success(result.USER_DEFAULT, result.MESSAGES);
                },
                error: error
            });
        },

        update: function (options, success, error) {
            neptune.Utils.api({
                path: "/neptune/userdefault",
                operation: "update",
                type: "POST",
                data: JSON.stringify({
                    USER_DEFAULT: options
                }),
                success: success,
                error: error
            });
        },

        delete: function (options, success, error) {
            neptune.Utils.api({
                path: "/neptune/userdefault",
                operation: "delete",
                type: "POST",
                data: JSON.stringify({
                    USER_DEFAULT: options
                }),
                success: success,
                error: error
            });
        }
    },

    /** 
     * Deprecate API: neptune.Utils.userCustomization
     */
    userCustomization: {
        customizationCreate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.customizationCreate");
        },
        customizationUpdate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.customizationUpdate");
        },
        customizationDelete: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.customizationDelete");
        },
        tileCreate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tileCreate");
        },
        tilegroupCreate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tilegroupCreate");
        },
        tilegroupUpdate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tilegroupUpdate");
        },
        tilegroupDelete: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tilegroupDelete");
        },
        tilegroupShow: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tilegroupShow");
        },
        tilegroupHide: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tilegroupHide");
        },
        tileOrderUpdate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tileOrderUpdate");
        },
        tileOrderDelete: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tileOrderDelete");
        },
        tileSizeUpdate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tileSizeUpdate");
        },
        tileSizeDelete: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tileSizeDelete");
        },
        tilegroupOrderUpdate: function (options, success, error) {
            if(neptune.ui.debug) console.warn("Deprecated API: neptune.Utils.userCustomization.tilegroupOrderUpdate");
        }
    }
};

neptune.ui.Tile = {
    type: {
        Default: "",
        Dynamic: "Dynamic"
    },
    backgroundType: {
        Background: "B",
        Inline: "I",
        Top: "T"
    },
    iconPlacement: {
        AboveLeft: "AboveLeft",
        AboveCenter: "AboveCenter",
        AboveRight: "AboveRight",
        AlignLeft: "AlignLeft",
        AlignCenter: "AlignCenter",
        AlignRight: "AlignRight",
        BelowLeft: "BelowLeft",
        BelowCenter: "BelowCenter",
        BelowRight: "BelowRight"
    },
    backgroundPlacement: {
        Center: "",
        CenterTop: "center top",
        CenterBottom: "center bottom",
        LeftCenter: "left center",
        LeftTop: "left top",
        LeftBottom: "left bottom",
        rightCenter: "right center",
        rightTop: "right top",
        rightBottom: "right bottom"
    },
    backgroundRepeat: {
        NoRepeat: "",
        Repeat: "repeat",
        RepeatY: "repeat-x",
        RepeatX: "repeat-y"
    },
    backgroundSize: {
        Cover: "",
        Auto: "auto",
        Contain: "contain"
    },
    titleLevel: {
        H1: "H1",
        H2: "H2",
        H3: "H3",
        H4: "H4",
        H5: "H5",
        H6: "H6",
    },
    titleAlign: {
        Start: "",
        Center: "Center",
        End: "End"
    }
};

// Old style pure array
function _convertFlatToNested(n, r, t) {
    for (var e, h, u, a = [], c = {}, o = 0, f = n.length; f > o; o++) e = n[o], h = e[r], u = e[t] || 0, c[h] = c[h] || [],
        e.children = c[h], 0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
    return a;
}
function _convertNestedToFlat(a) {
    if (typeof a.children === "undefined" || !Array.isArray(a.children) || a.children.length === 0) {
        return a;
    }
    var b = [],
        c = function(a) {
            $.each(a, function(a, d) {
                d.children && (c(d.children), delete d.children), b.push(d);
            });
        };
    return c(JSON.parse(JSON.stringify(a.children))), b;
}
var _convertDatesToString = neptune.Utils.ConvertDatesToString;

ModelData.ConvertFlatToNested = function(n, r, t) {
    console.warn("ModelData.ConvertFlatToNested deprecated. Use neptune.Utils.ConvertFlatToNested");
    return neptune.Utils.ConvertFlatToNested(n, r, t);
};
ModelData.ConvertNestedToFlat = function(a) {
    console.warn("ModelData.ConvertNestedToFlat deprecated. Use neptune.Utils.ConvertNestedToFlat");
    return neptune.Utils.ConvertNestedToFlat(a);
};
ModelData.ConvertDatesToString = function(t) {
    console.warn("ModelData.ConvertDatesToString deprecated. Use neptune.Utils.ConvertDatesToString");
    return neptune.Utils.ConvertDatesToString(t);
};