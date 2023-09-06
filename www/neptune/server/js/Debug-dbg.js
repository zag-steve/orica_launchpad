neptune.Debug = {

    // save the original console functions, they will be reinstated if debug is deactivated
    console: {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    },

    init: false,
    initLog: [],
    timestamp: null,
    ext: 0,

    loaded: function(classicLaunchpad) {
        neptune.Debug.init = true;
        sap.n.Debug.classicLaunchpad = classicLaunchpad;
        if (AppCache.enableLaunchpadDebug && neptune.UserDefault.debugEnable && neptune.Debug.modernBrowser()) {
            sap.n.Debug.setDebugButtonsVisibility(!neptune.UserDefault.debugHidePop);
            neptune.Debug.updateInitLog();
        } else {
            neptune.Debug.deactivate();
        }
    },

    add: function(type, msg, stackTrace) {

        if (typeof msg === "object") msg = JSON.stringify(msg);

        // Neptune objects has been loaded and there is a logged on user
        if (neptune.Debug.init && !AppCache.isRestricted) {

            var date = new Date();
            var timestamp = date.getTime();
            neptune.Debug.ext = (timestamp === neptune.Debug.timestamp) ? ++neptune.Debug.ext : 0;
            var ext = neptune.Debug.ext;
            neptune.Debug.timestamp = timestamp;
            var guid = timestamp + "-" + ext;
            var trace = stackTrace[1].toString().trim();
            var applid = "";

            try {
                applid = sap.n.Launchpad.currentTile.APPLID;
            } catch (e) {}

            sap.n.Debug.add({
                GUID: guid,
                CREDAT: neptune.Debug.sapDate(date),
                CRETIM: neptune.Debug.sapTime(date),
                CRENAM: AppCache.CurrentUname,
                UNAME: AppCache.CurrentUname,
                CONFIGURATION: AppCache.CurrentConfig,
                APPLID: applid,
                LOG_TYPE: type,
                LOG_MSG: msg,
                LOG_TRACE: trace,
                OS: neptune.Debug.device.getOS(),
                SYS: neptune.Debug.device.getSystem(),
                DEVICE: neptune.Debug.device.getDevice(),
                SUPPORT: neptune.Debug.device.getSupport(),
                SCREEN: neptune.Debug.device.getScreen(),
                BROWSER: neptune.Debug.device.getBrowser(),
                UUID: neptune.Debug.device.getUUID(),
                UDID: neptune.Debug.device.getUDID()
            }, stackTrace);

        } else {

            // Save logs until all Neptune objects has been loaded and a user is logged on
            neptune.Debug.initLog.push({
                type: type,
                msg: msg,
                trace: stackTrace.join('\n')
            });
        }
    },

    updateInitLog: function() {

        if (!AppCache.isRestricted) {

            // Add logs and send them to SAP when all Neptune objects has been loaded and a user is logged in
            $.each(neptune.Debug.initLog, function(i, log) {
                var trace = log.trace.split(/\r?\n/);
                neptune.Debug.add(log.type, log.msg, trace);
            });
            neptune.Debug.initLog = [];
        }
    },

    activate: function() {

        if (!AppCache.enableLaunchpadDebug || !neptune.Debug.modernBrowser()) return;
        // if (!neptune.UserDefault.debugEnable || !neptune.Debug.modernBrowser()) return;

        window.onerror = function(msg, url, line, columnNo, error) {

            var trace = error.stack.split(/\r?\n/);
            neptune.Debug.add('E', JSON.stringify(msg), trace);
        };

        Error.stackTraceLimit = Infinity;

        console.log = function() {
            if (arguments[0].toString().indexOf("ASSERT") === 0) return;
            var trace = neptune.Debug.getStackTrace(arguments);
            neptune.Debug.add('I', arguments[0], trace);
            if (trace.length === 1) trace.push("No Stacktrace Support...");
            if (typeof trace[0] === "object") trace[0] = JSON.stringify(trace[0]);
            neptune.Debug.console.log(trace.splice(0, 2).join('\n'));
        };

        console.info = function() {
            var trace = neptune.Debug.getStackTrace(arguments);
            neptune.Debug.add('I', arguments[0], trace);
            if (trace.length === 1) trace.push("No Stacktrace Support...");
            if (typeof trace[0] === "object") trace[0] = JSON.stringify(trace[0]);
            neptune.Debug.console.info(trace.splice(0, 2).join('\n'));
        };

        console.warn = function() {
            neptune.Debug.console.warn(arguments[0]);
            var trace = neptune.Debug.getStackTrace(arguments);
            neptune.Debug.add('W', arguments[0], trace);
        };

        console.error = function() {
            neptune.Debug.console.error(arguments[0]);
            var trace = neptune.Debug.getStackTrace(arguments);
            neptune.Debug.add('E', arguments[0], trace);
        };
    },

    deactivate: function() {
        console.log = neptune.Debug.console.log;
        console.info = neptune.Debug.console.info;
        console.warn = neptune.Debug.console.warn;
        console.error = neptune.Debug.console.error;

        window.onerror = null;
        sap.n.Debug.setDebugButtonsVisibility(false);
    },
    getStackTrace: function(args) {
        var iOS = (typeof device !== "undefined" && device.platform === "iOS");
        var trace = false;
        var arr = [];
        if (!iOS) {
            trace = neptune.Debug._getStackTrace();
        }
        if (trace) {
            arr = trace.split(/\r?\n/).splice(3);
        }
        if (arr.length === 0) {
            arr.push(args[0]);
        } else {
            arr.unshift(args[0]);
        }
        if (arr.length === 1) {
            arr.push("No Stacktrace Support...");
        }
        return arr;
    },

    _getStackTrace: function() {
        try {
            var obj = {};
            Error.captureStackTrace(obj, neptune.Debug._getStackTrace);
            return obj.stack;
        } catch (e) {
            return false;
        }
    },

    device: {
        getBrowser: function() {
            var browser = "";
            switch (sap.ui.Device.browser.name) {
                case sap.ui.Device.browser.BROWSER.ANDROID:
                    browser = "Android";
                    break;
                case sap.ui.Device.browser.BROWSER.CHROME:
                    browser = "Chrome";
                    break;
                case sap.ui.Device.browser.BROWSER.EDGE:
                    browser = "Edge";
                    break;
                case sap.ui.Device.browser.BROWSER.FIREFOX:
                    browser = "Firefox";
                    break;
                case sap.ui.Device.browser.BROWSER.INTERNET_EXPLORER:
                    browser = "IE";
                    break;
                case sap.ui.Device.browser.BROWSER.OPERA:
                    browser = "Opera";
                    break;
                case sap.ui.Device.browser.BROWSER.SAFARI:
                    browser = "Safari";
                    break;
            }
            browser += "-" + sap.ui.Device.browser.versionStr;
            if (sap.ui.Device.browser.name === sap.ui.Device.browser.BROWSER.OPERA && sap.ui.Device.browser.chrome) {
                browser += " (chrome)";
            }
            if (sap.ui.Device.browser.webkit) {
                browser += ", Webkit-" + sap.ui.Device.browser.webkitVersion;
            }
            return browser;
        },
        getScreen: function() {
            var screen = sap.ui.Device.resize.width + "x" + sap.ui.Device.resize.height;
            if (sap.ui.Device.orientation.landscape) {
                screen += "-landscape";
            } else if (sap.ui.Device.orientation.portrait) {
                screen += "-portrait";
            }
            return screen;
        },
        getOS: function() {
            var os = "";
            switch (sap.ui.Device.os.name) {
                case sap.ui.Device.os.OS.ANDROID:
                    os = "Android";
                    break;
                case sap.ui.Device.os.OS.BLACKBERRY:
                    os = "Blackberry";
                    break;
                case sap.ui.Device.os.OS.IOS:
                    os = "iOS";
                    break;
                case sap.ui.Device.os.OS.LINUX:
                    os = "Linux";
                    break;
                case sap.ui.Device.os.OS.MACINTOSH:
                    os = "Mac";
                    break;
                case sap.ui.Device.os.OS.WINDOWS:
                    os = "Windows";
                    break;
                case sap.ui.Device.os.OS.WINDOWS_PHONE:
                    os = "WinPhone";
                    break;
            }
            os += "-" + sap.ui.Device.os.versionStr;
            return os;
        },
        getSystem: function() {
            var system = "";
            if (sap.ui.Device.system.desktop) {
                system = "Desktop";
            } else if (sap.ui.Device.system.phone) {
                system = "Phone";
            } else if (sap.ui.Device.system.tablet) {
                system = "Tablet";
            }
            if (sap.ui.Device.system.combi) {
                system += "-Combi";
            }
            if (typeof device !== "undefined") {
                system += ", Cordova " + device.cordova;
                if (device.isVirtual) {
                    system += "-virtual";
                }
            }
            if (!!AppCache.AppVersion) {
                system += ", App v." + AppCache.AppVersion;
            }

            system += ", UI5 v." + sap.ui.version;
            return system;
        },
        getDevice: function() {
            var dev = "";
            if (typeof device !== "undefined") {
                dev = device.manufacturer + "-" + device.model;
            }
            return dev;
        },
        getSupport: function() {
            var support = [];
            if (sap.ui.Device.support.orientation) {
                support.push("Orientation");
            }
            if (sap.ui.Device.support.pointer) {
                support.push("Pointer");
            }
            if (sap.ui.Device.support.retina) {
                support.push("Retina");
            }
            if (sap.ui.Device.support.touch) {
                support.push("Touch");
            }
            if (sap.ui.Device.support.websocket) {
                support.push("Websocket");
            }
            return support.join(', ');
        },
        // ID generated by device each time mobile client is installed
        getUUID: function() {
            return (typeof device !== "undefined") ? device.uuid : "";
        },
        // unique device ID, only Android, enable UDID read in mobile client configuration
        getUDID: function() {
            return (typeof udid !== "undefined") ? udid.getUdid() : "";
        }
    },

    sapDate: function(date) {
        if (!date) {
            date = new Date();
        }
        jQuery.sap.require("sap.ui.core.format.DateFormat");
        var outFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
            pattern: "yyyyMMdd",
            relative: false
        });
        return outFormat.format(date);
    },

    sapTime: function(date) {
        if (!date) {
            date = new Date();
        }
        jQuery.sap.require("sap.ui.core.format.DateFormat");
        var outFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
            pattern: "HHmmss",
            relative: false
        });
        return outFormat.format(date);
    },

    modernBrowser: function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return false;
        }
        else {
            return true;
        }
    }
};
neptune.Debug.activate();
