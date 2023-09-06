var AppCache = {

    // AppCache Variables
    Initialized: false,
    Encrypted: '',
    CurrentUname: '',
    CurrentApp: '',
    CurrentConfig: '',
    CurrentLanguage: '',
    AppVersion: '',
    StartApp: '',
    navNotif: false,
    Url: '',
    UrlBase: '',
    Client: '',
    Passcode: '',
    Auth: '',
    enablePasscode: false,
    enableMocana: false,
    enableSMP: false,
    enableAzure: false,
    enableLogging: false,
    enableSMPCaptcha: false,
    enablePush: false,
    enablePortal: false,
    enableNotif: false,
    enableTwoFactor: false,
    enableEncryption: false,
    enablePrincipal: false,
    enableCustomLogin: false,
    enableNativeLogin: false,
    enableSAML: false,
    enableOKTA: false,
    pushProvider: '',
    numPasscode: 5,
    deviceType: '',
    deviceID: '',
    smpApplication: '',
    GoogleID: '',
    PushWooshID: '',
    PhoneID: '',
    AppID: '',
    xmlString: '',
    PortalUrl: '',
    PortalLogoffUrl: '',
    OtpSalt: '',
    PortalSalt: '',
    isOffline: false,
    isRestricted: false,
    isMobile: false,
    inLogon: false,
    View: {},
    ViewChild: {},
    doOnboard: false,
    samlUrlLogon: '',
    samlUrlLogoff: '',
    samlUserField: 'UserName',
    samlPasswordField: 'Password',
    samlPrefix: '',
    adfsMultiSetup: [],
    OKTAUrlLogon: '',
    OKTADomain: '',
    diaView: '',
    passUrlReset: '',
    loadQueue: [],
    loadRunning: false,
    biometricAuthentication: false,
    webauthnAuthentication: false,
    translationRestore: [],
    sapsso_otp_header: '',
    sapsso_otp_value: '',
    passcodeLength: 4,
    Dialogs: [],
    allowIcfNode: '',
    defaultTheme: 'sap_belize',
    publicAccess: false,
    enableCertificate: false,
    cacheLoaded: 0,
    preview: false,
    internetNotAllowed: false,
    shellTouchArea: 200,
    shellMouseArea: 200,
    navigatorHideSplashDelay: 500,
    navigatorHideSplashDelayStartApp: 3000,
    runtimeLanguage: 'E',
    sideMenuWidth: '300px',
    navBarWidth: '300px',
    masthead: "",
    containerizeAppCss: false,
    CurrentLayout: {},

    Home: function() {

        sap.m.InstanceManager.closeAllDialogs();
        if (sap.n && sap.n.Launchpad) {
            location.hash = "Home";
        }
    },

    Back: function() {

        var dialogs = sap.m.InstanceManager.getOpenDialogs();
        if (dialogs.length > 0) {
            dialogs[dialogs.length - 1].close();

        } else if (sap.n && sap.n.Launchpad) {
            AppCache._Back();
        }
    },
    
    Load: function(value, options) {

        // Check Queue - Put in queue of working
        if (this.loadRunning) {
            var appData = {
                "APPLID": value,
                "OPTIONS": options || {}
            };
            this.loadQueue.push(appData);
            return;
        }
        value = value.toUpperCase();

        if (!neptune.storageReady) {
            neptune.initLoadOperations.push({
                value: value,
                options: options
            });
            return;
        }

        this.loadRunning = true;

        var applid = value.replace(/\//g, "");

        options = options || {};
        AppCache.LoadOptions = {};
        AppCache.LoadOptions.nullifyCordovaEvents = true;
        AppCache.LoadOptions.appWidthLimited = options.appWidthLimited;
        AppCache.LoadOptions.loadInBackground = options.loadInBackground || false;
        AppCache.LoadOptions.dialogShow = options.dialogShow || false;
        AppCache.LoadOptions.dialogHeight = options.dialogHeight || "90%";
        AppCache.LoadOptions.dialogWidth = options.dialogWidth || "1200px";
        AppCache.LoadOptions.dialogTitle = options.dialogTitle || "";
        AppCache.LoadOptions.dialogModal = options.dialogModal || false;
        AppCache.LoadOptions.dialogHideMinimize = options.dialogHideMinimize || !sap.ui.Device.system.desktop;
        AppCache.LoadOptions.dialogHideMosaic = options.dialogHideMosaic || !sap.ui.Device.system.desktop;
        AppCache.LoadOptions.dialogHideMaximize = options.dialogHideMaximize || !sap.ui.Device.system.desktop;
        AppCache.LoadOptions.dialogHideClose = options.dialogHideClose || false;
        AppCache.LoadOptions.dialogStretch = options.dialogStretch || false;
        AppCache.LoadOptions.load = options.load || "";
        AppCache.LoadOptions.splitviewId = options.splitviewId || "";
        AppCache.LoadOptions.appVariantFn = options.appVariantFn || function(){};
        AppCache.LoadOptions.parentObject = options.parentObject || "";
        AppCache.LoadOptions.appGUID = options.appGUID || "";

//22.10.0007 #18854
        // AppCache.LoadOptions.startParams = options.startParams || {};
        // AppCache.LoadOptions.hashParams = options.hashParams;
        const params = options.hashParams || options.startParams || "";
        AppCache.LoadOptions.startParams = neptune.Utils.formatHashData(params);
//22.10.0007 #18854 End

        AppCache.LoadOptions.onDialogClose = (typeof options.onDialogClose === 'function') ? options.onDialogClose : function() {};
        AppCache.LoadOptions.enableDoc = options.enableDoc || false;
        AppCache.LoadOptions.applid = applid;
        // AppCache.LoadOptions.sidePanel = options.sidePanel || false;
        var hideHeader = (sap.n && sap.n.Launchpad && sap.n.Launchpad.getHideHeader()) || false;
        AppCache.LoadOptions.hideHeader = options.hideHeader || hideHeader || false;
        AppCache.LoadOptions.external = options.external || false;

        AppCache.LoadOptions.navTitle = options.navTitle || "";
        AppCache.LoadOptions.navInfo = options.navInfo || "";
        AppCache.LoadOptions.navIconSrc = options.navIconSrc || "";
        AppCache.LoadOptions.navIconImg = options.navIconImg || "";

        AppCache.LoadOptions.dialogResizable = (options.hasOwnProperty("dialogResizable")) ? options.dialogResizable : true;
        AppCache.LoadOptions.dialogDraggable = (options.hasOwnProperty("dialogDraggable")) ? options.dialogDraggable : true;

        AppCache.LoadOptions.activeAppTitle = options.navTitle;

        AppCache.LoadOptions.navObjEventHandler = options.navObjEventHandler || {
            updateNavigationItemFn: function() {},
        };

        // should the application set all Cordova events to null... so that the loaded app can set new events
        AppCache.LoadOptions.keepCordovaEvents = false;
        if (AppCache.LoadOptions.parentObject || options.load === "init" || options.load === "download") {
            AppCache.LoadOptions.keepCordovaEvents = true;
        }

        if (options.load === "init" || options.load === "download" || options.load === "card" || options.load === "appVariant") {
            AppCache.LoadOptions.loadInBackground = true;
        }
        
        if (!AppCache.LoadOptions.loadInBackground && !sap.n && !AppCache.LoadOptions.parentObject) {
            AppCache.LoadOptions.dialogShow = true;
        }

        // Set Current App - Not for dialogs
        if (!AppCache.LoadOptions.dialogShow && !AppCache.LoadOptions.parentObject && !AppCache.LoadOptions.loadInBackground) {
            AppCache.CurrentApp = value;
        }

        // if modal => not possible to minimize
        if (AppCache.LoadOptions.dialogModal) {
            AppCache.LoadOptions.dialogHideMinimize = true;
        }

        // Busyindicator Handling
        if (!!AppCache.LoadOptions.parentObject) {

            AppCache.LoadOptions.parentObject.addStyleClass && AppCache.LoadOptions.parentObject.addStyleClass("nepParent");
            AppCache.LoadOptions.appGUID = applid + AppCache.LoadOptions.parentObject.getId();

            if (typeof AppCache.LoadOptions.parentObject.setBusy === "function") {
                AppCache.LoadOptions.parentObject.setBusy(true);
            }

            var childView = false;
            $.each(AppCache.ViewChild, function(id, views) {

                $.each(views, function(id, view) {

                    if (id === AppCache.LoadOptions.appGUID) {
                        childView = true;
                        AppCache.childView = view;
                        return false;
                    }
                });
            });

            if (childView) {
                AppCache.buildView({
                    value: value
                });
                return;
            }
        }

        if (AppCache.LoadOptions.load === "nav") {

            //splitview create ID on its own
            if (!AppCache.LoadOptions.appGUID) {
                AppCache.LoadOptions.appGUID = applid + "__nav" + new Date().getTime();
            }
            location.hash = "";

        } else if (AppCache.LoadOptions.dialogShow) {

            AppCache.LoadOptions.appGUID = applid + "__dia" + new Date().getTime();

        } else if (!AppCache.LoadOptions.appGUID) {

            AppCache.LoadOptions.appGUID = applid;

            if (sap.n && AppCache.LoadOptions.load !== "download"  && AppCache.LoadOptions.load !== "init" && AppCache.LoadOptions.load !== "card" && AppCache.LoadOptions.load !== "external") {
                location.hash = "";
                if (sap.n && sap.n.Launchpad) sap.n.Launchpad.currentTile = {
                    GUID: AppCache.LoadOptions.appGUID
                };
            }
        }

        // Get App from Memory
        if (!AppCache.LoadOptions.dialogShow && AppCache.LoadOptions.load !== "nav") {

            if (AppCache.LoadOptions.appGUID) {
                if (AppCache.View[AppCache.LoadOptions.appGUID]) {
                    AppCache.buildView({
                        value: value
                    });
                    return;
                }

            } else {
                if (AppCache.View[applid] && AppCache.viewExists(AppCache.View[applid])) {
                    AppCache.buildView({
                        value: value
                    });
                    return;
                }
            }
        }

        // Get App from DB/LS if exist in repository
        if (!AppCache.CurrentLanguage) {
            if (neptune.ui.debug) console.warn("AppCache.Load: AppCache.CurrentLanguage is empty. Using English...");
        }
        var language = AppCache.CurrentLanguage || "E";
        var system = AppCache.System || "SID";
        if (!!AppCache.CustomSystem) {
            system = AppCache.CustomSystem.toUpperCase().substring(0, 3).padEnd(3, "X");
        }
        var viewName = system + '_' + AppCache.Client + '_' + language + '_' + value;

        if (AppCache.LoadOptions.load === "nav") {

            if (!AppCache.LoadOptions.loadInBackground) {
                if (sap.n && sap.n.Launchpad) sap.n.Launchpad.currentTile = {
                    GUID: AppCache.LoadOptions.appGUID
                };
            }

            if (sap.n && sap.n.Launchpad) {

                sap.n.Launchpad.setTileContentObject(AppCache.LoadOptions.appGUID);

                sap.n.Launchpad.handleNavButton({
                    dataLoad: {
                        applid: AppCache.LoadOptions.applid,
                        appGUID: AppCache.LoadOptions.appGUID,
                        navTitle: AppCache.LoadOptions.navTitle,
                        navInfo: AppCache.LoadOptions.navInfo,
                        navIconSrc: AppCache.LoadOptions.navIconSrc,
                        navIconImg: AppCache.LoadOptions.navIconImg,
                        startParams: AppCache.LoadOptions.startParams,
                        navObjEventHandler: AppCache.LoadOptions.navObjEventHandler,
                        appWidthLimited: AppCache.LoadOptions.appWidthLimited,
                        hideHeader: AppCache.LoadOptions.hideHeader
                    }
                });
                sap.n.Launchpad.handleTileRun({
                    GUID: AppCache.LoadOptions.appGUID
                });
            }
        }

        // Get applications that prefers to be loaded online
        var forceOnline = JSON.parse(localStorage.getItem("forceOnline") || "{}");

        if (AppStorage.database) {
            AppStorage.getView(viewName).then(function AppCacheGetView(viewData) {

                // Load cached view if it exists and the application does not prefer to be loaded online
                if (typeof viewData === "object" && viewData.view.length > 2 && !forceOnline[viewName]) {
                    AppCache.initView({
                        value: value,
                        viewData: viewData,
                        appWidthLimited: AppCache.LoadOptions.appWidthLimited
                    });

                } else {

                    AppCache.getView({
                        value: value,
                        appWidthLimited: AppCache.LoadOptions.appWidthLimited,
                        option: {}
                    });
                }
            });

        } else {

            sap.ui.requireSync("jquery.sap.storage");
            var ls = $.sap.storage($.sap.storage.Type.local, "GLOBAL");
            
            var data = ls.get(viewName);

            // Load cached view if it exists and the application does not prefer to be loaded online
            if (data && !forceOnline[viewName]) {
                AppCache.initView({
                    value: value,
                    viewData: data,
                    appWidthLimited: AppCache.LoadOptions.appWidthLimited
                });

            } else {

                AppCache.getView({
                    value: value,
                    appWidthLimited: AppCache.LoadOptions.appWidthLimited,
                    option: {}
                });
            }
        }
    },

    initView: function(config) {

        var value = config.value;
        var isInvalid = config.isInvalid || false;
        var appWidthLimited = config.appWidthLimited;

        if (AppCache.LoadOptions.load === "download") {
            sap.ui.core.BusyIndicator.hide();
            this._loadQueue();
            return;
        }

        //22.10.0006 #18719
        // var viewData = atob(config.viewData.view);
        var decodedViewData = atob(config.viewData.view);
        var viewData = decodeURIComponent(decodedViewData);
        //22.10.0006 #18719 End
        
        var modules = config.viewData.modules || [];
        var libraries = config.viewData.libraries || [];

        sap.ui.require(modules, function() {
            sap.ui.getCore().loadLibraries(libraries, {
                async: true
            }).then(function() {

                var applid = value.replace(/\//g, "");

                try {
                    new Function(viewData)();
                    viewData = null;
                } catch (error) {

                    var msg = "AppCache.initView: Error getting => " + value + ".view.js";
                    if (!!error.message) {
                        msg = "AppCache.initView: " + value + " => " + error.message;
                    }
                    AppCache.handleAfterLoadError(msg);
                    return;
                }

                // nav loading is using the same app multiple times, keep the app events in a temporary obj while the new nav object is beeing created
                var navObj;
                if (sap.n && sap.n.Launchpad && AppCache.LoadOptions.load === "nav") {
                    navObj = sap.n.Apps[value];
                }
                
                // sap.ui.core.mvc.JSONView.create({
                sap.ui.core.mvc.JSView.create({
                    viewName: value
                }).then(function (view) {

                    if (sap.n && sap.n.Launchpad) {
                        AppCacheNav.views[view.getId()] = {
                            appWidthLimited: appWidthLimited
                        };
                    }
                    if (AppCache.LoadOptions.dialogShow) {
                        AppCache.diaView = view;
        
                    } else if (AppCache.LoadOptions.parentObject) {
                        view.addStyleClass("nepChildView");
                        AppCache.childView = view;
        
                    } else {
                        if (AppCache.LoadOptions.appGUID) {
                            AppCache.View[AppCache.LoadOptions.appGUID] = view;
                        } else {
                            AppCache.View[applid] = view;
                        }
                    }
                    if (sap.n) {
                        if (navObj) {
                            sap.n.Apps[value] = navObj;
                        }
                        if (AppCache.LoadOptions.appGUID && sap.n.Apps[AppCache.LoadOptions.appGUID]) {
                            sap.n.Apps[AppCache.LoadOptions.appGUID].viewId = view.getId();
                        }
                    }
        
                    AppCache.buildView({
                        value: value
                    });

                }).catch(function(err) {
                    console.error("Init View Error: " + value);
                    console.error(err);

                    AppCache.loadRunning = false;
                    
                    if (sap.n && sap.n.Launchpad) {
                        sap.n.Launchpad.currentTile = {};
                    }
                    if (AppCache.busyTile) {
                        AppCache.busyTile.addStyleClass("nepBlocked");
                        AppCache.busyTile.setBusy(false);
                        AppCache.busyTile = null;
                    }
                    AppCache.CurrentApp = "";
                    AppCache.LoadOptions = null;

                    sap.m.MessageToast.show("Init View Error: " + value);
                });
            }).catch(function(err) {
                console.error("Init View Load Libraries Error: " + value);
                console.error(err);

                AppCache.loadRunning = false;
                
                if (sap.n && sap.n.Launchpad) {
                    sap.n.Launchpad.currentTile = {};
                }
                if (AppCache.busyTile) {
                    AppCache.busyTile.addStyleClass("nepBlocked");
                    AppCache.busyTile.setBusy(false);
                    AppCache.busyTile = null;
                }
                AppCache.CurrentApp = "";
                AppCache.LoadOptions = null;

                sap.m.MessageToast.show("Init View Error: " + value);
            });
        }.bind(this));
    },

    buildView: function(config) {

        var localView, appObject;

        var value = config.value;
        var applid = value.replace(/\//g, "");
        var eventId, oStyle, styleData, oHtml, html, htmlId, htmlData, idFrom, idTo, regex;

        if (AppCache.LoadOptions.appGUID) {
            eventId = AppCache.LoadOptions.appGUID;
        } else {
            eventId = applid;
        }

        appObject = (sap.n) ? sap.n.Apps[eventId] : {};
        if (!appObject) {
            appObject = {};
            if (neptune.ui.debug) console.warn("sap.n.Apps missing object: " + eventId + ", for app: " + value + ", in: AppCache.buildView");
        }

        // Load Option: Save As Tile
        if (AppCache.LoadOptions.load === "appVariant") {
            sap.ui.core.BusyIndicator.hide();
            this._loadQueue();

            if(!appObject.appVariant) {
                AppCache.LoadOptions.appVariantFn(null);
                return;
            }

            new Promise(function(resolve, reject) {

                appObject.appVariant({
                    resolve: resolve,
                    reject: reject
                });

            }).then(function AppCacheBuildViewAppVariant(data) {

                AppCache.LoadOptions.appVariantFn({
                    data: data,
                    eventId: eventId,
                    applid: applid
                });
                
            }).catch(function(errorMsg) {

            });
            return;
        }

        if (AppCache.LoadOptions.appGUID) {
            localView = AppCache.View[AppCache.LoadOptions.appGUID];
        } else {
            localView = AppCache.View[applid];
        }

        if (sap.n && sap.n.Launchpad) {

            AppCacheUserActionHideHeader.setVisible(false);
            AppCacheUserActionAppVariant.setVisible(false);

            if (!AppCache.LoadOptions.parentObject && !AppCache.LoadOptions.dialogShow && !AppCache.LoadOptions.loadInBackground && AppCache.activeAppTitle && typeof AppCacheShellAppTitle !== "undefined") {
                AppCacheShellAppTitle.setVisible(true);
                AppCacheShellAppTitle.setText(AppCache.LoadOptions.activeAppTitle);
                AppCacheShellAppTitle.setIcon("");
                AppCacheShellAppTitle.setType("Default");
            }
            if (!AppCache.LoadOptions.dialogShow && !AppCache.LoadOptions.loadInBackground && !AppCache.StartApp) {
                AppCacheBackButton.setVisible(true);
            }

            if (!AppCache.LoadOptions.parentObject && !AppCache.LoadOptions.dialogShow && !AppCache.LoadOptions.loadInBackground) {
                sap.n.currentView = localView;
            }

            // // Turn off debug
            // if (!AppCache.LoadOptions.sidePanel) {
            //     AppCacheShellDebug.setVisible(false);
            // }

            if (AppCache.LoadOptions.enableDoc) {

                if (!appObject.init) {
                    appObject.init = [];
                }
                var fields = $.grep(modelAppCacheFieldDoc.oData, function(fieldDoc, i) {
                    return (value === fieldDoc.APPLID);
                });

                if (fields.length > 0) {

                    sap.n.Documentation.load(applid);

                    appObject.init.push(function(data) {
                        setTimeout(function() {
                            $.each(fields, function(i, fieldDoc) {
                                try {
                                    var element = sap.ui.getCore().byId(localView.createId(fieldDoc.CONTENT_NAME));
                                    element.addStyleClass("nepLabelHelp");
                                    element.attachBrowserEvent('click', function(e) {

                                        sap.n.Documentation.openByElement({
                                            element: element,
                                            doc: function() {
                                                return fieldDoc.GUID;
                                            }
                                        });
                                    });
                                } catch (e) {
                                    // No message
                                }
                            });
                        }, 200);
                    });
                }
            }

            var fromSplitView = (AppCache.LoadOptions.load === "splitview") ? true : false;

            $.each(appObject.init, function(i, data) {
//22.10.0007 #18854
                // if (AppCache.LoadOptions.startParams) {
                //     try {
                //         AppCache.LoadOptions.startParams = JSON.parse(AppCache.LoadOptions.startParams);
                //     } catch (e) {
                //         // No message, startParams already in correct format
                //     }
                // }
                // var startParams = AppCache.LoadOptions.hashParams || AppCache.LoadOptions.startParams || {};
                // data(startParams, AppCache.LoadOptions.navObjEventHandler, fromSplitView);
                data(AppCache.LoadOptions.startParams, AppCache.LoadOptions.navObjEventHandler, fromSplitView);
//22.10.0007 #18854 End
            });

//22.10.0007 #18854
            // AppCache.LoadOptions.hashParams = null;
//22.10.0007 #18854 End
            appObject.init = null;

            try {
                // no cached objects in app, call the cacheLoaded event handler directly
                if ($.isEmptyObject(appObject.cache.objects) && appObject.cacheLoaded) {
                    $.each(appObject.cacheLoaded, function(i, func) {
                        func(AppCache.LoadOptions.startParams, fromSplitView);
                    });
                }
            } catch (e) {}

            sap.n.Launchpad.AppTitleFn = function() {};

            // Save as tile
            if (appObject.appVariant && sap.n.Customization && sap.n.Customization.tileChangeEnabled()) {
                AppCacheUserActionAppVariant.setVisible(true);
            }

            // Custom beforeDisplay
            if (appObject.beforeDisplay && AppCache.LoadOptions.load !== "init") {
                $.each(appObject.beforeDisplay, function(i, data) {

//22.10.0007 #18854
                    // try {
                    //     AppCache.LoadOptions.startParams = JSON.parse(AppCache.LoadOptions.startParams);
                    // } catch (e) {
                    //     // No message, startParams already in correct format
                    // }
//22.10.0007 #18854 End
                    data(AppCache.LoadOptions.startParams, !appObject.initialized, fromSplitView);
                    appObject.initialized = true;
                });
            }

            // Custom onNavigation
//22.10.0009 #19156
            if (appObject.onNavigation && AppCache.LoadOptions.load !== "init") {
                $.each(appObject.onNavigation, function(i, data) {
                    data(AppCache.LoadOptions.startParams, !appObject.initialized);
            // if (appObject.onNavigation) {
            //     $.each(appObject.onNavigation, function(i, data) {
            //         data(sap.n.HashNavigation.data, true);
            //         sap.n.HashNavigation.data = {};
//22.10.0009 #19156
                });
            }

            // Turn off BusyIndicator
            if (AppCache.busyTile) AppCache.busyTile.setBusy(false);

            // Load Option: Not full load
            if (AppCache.LoadOptions.load === "init") {
                sap.ui.core.BusyIndicator.hide();
                AppCache.diaView = null;
                this._loadQueue();
                return;
            }
        }

        // Dialog
        if (AppCache.LoadOptions.dialogShow) {

            var contHeight = AppCache.LoadOptions.dialogHeight;
            var contWidth = AppCache.LoadOptions.dialogWidth;
            var diaTitle = AppCache.LoadOptions.dialogTitle;
            var diaHideMinimize = AppCache.LoadOptions.dialogHideMinimize;
            var diaHideMosaic = AppCache.LoadOptions.dialogHideMosaic;
            var diaHideMaximize = AppCache.LoadOptions.dialogHideMaximize;
            var diaHideClose = AppCache.LoadOptions.dialogHideClose;
            // var screenWidth = $(window).width();
            var stretch = AppCache.LoadOptions.dialogStretch;
            var onDialogClose = AppCache.LoadOptions.onDialogClose;

            // On Mobile
            if (!sap.ui.Device.system.desktop) {
                contWidth = "100%";
                contHeight = "100%";
            }

            // Create Dialog
            var dia = new nep.integration.Dialog({
                contentWidth: contWidth,
                contentHeight: contHeight,
                type: "Message",
                resizable: AppCache.LoadOptions.dialogResizable,
                draggable: AppCache.LoadOptions.dialogDraggable,
                // draggable: true,
                stretch: stretch,
                title: diaTitle,
                hideMinimize: diaHideMinimize,
                hideMosaic: diaHideMosaic,
                hideMaximize: diaHideMaximize,
                hideClose: diaHideClose,
                afterClose: function(oEvent) {

                    var diaId = dia.getId();

                    // Delete From Array
                    for (var i = 0; i < AppCache.Dialogs.length; i++) {
                        if (AppCache.Dialogs[i] === dia.getId()) {
                            AppCache.Dialogs.splice(i, 1);
                            break;
                        }
                    }

                    dia.destroyContent();
                    dia = null;

                    if (sap.n) {

                        if (AppCache.Dialogs.length === 0) {
                            if (sap.n && sap.n.Launchpad) AppCacheShellDialog.setVisible(false);
                        }

                        // trigger afterClose event before closing
                        if (sap.n.Apps[appObject.app] && sap.n.Apps[appObject.app].afterClose) {
                            $.each(sap.n.Apps[appObject.app].afterClose, function(i, data) {
                                var oEvent = new sap.ui.base.Event('afterClose', new sap.ui.base.EventProvider());
                                data(oEvent);
                                oEvent = null;
                            });
                        }
                        delete sap.n.Apps[appObject.app];

                        if (AppCache.ViewChild[appObject.app]) {

                            // Close Objects Loaded into the App
                            $.each(AppCache.ViewChild[appObject.app], function(id, view) {

                                sap.n.Shell.clearObjects(view.sId);

                                // afterClose - Memory Cleanup
                                if (sap.n.Apps[id] && sap.n.Apps[id].afterClose) {
                                    $.each(sap.n.Apps[id].afterClose, function(i, data) {
                                        var oEvent = new sap.ui.base.Event('afterClose', new sap.ui.base.EventProvider());
                                        data(oEvent);
                                        oEvent = null;
                                    });
                                }
                                delete sap.n.Apps[id];
                            });

                            delete AppCache.ViewChild[appObject.app];
                        }
                    }
                },
                beforeClose: function(oEvent) {
                    onDialogClose(oEvent);
                }
            });

            // Add Dialog to Array
            AppCache.Dialogs.push(dia.getId());
            dia.addContent(AppCache.diaView);

            oStyle = sap.ui.getCore().byId('oStyle' + applid);
            oHtml = sap.ui.getCore().byId('oHtml' + applid);

            idFrom = "#" + applid + "--";
            idTo = "#" + AppCache.diaView.sId + "--";
            regex = new RegExp(idFrom, 'g');
            html;

            // Add Style / Html Code
            if (oStyle) {
                
                if (sap.n && sap.n.Launchpad) {
                    styleData = decodeURIComponent(oStyle.getContent()).replace(regex, idTo);
                    styleData = sap.n.Utils.addViewIdToAppCss(styleData, AppCache.diaView.sId);
                    html = new sap.ui.core.HTML(AppCache.diaView.sId.replace("view", "style"));

                } else {
                    styleData = decodeURIComponent(oStyle.getContent());
                    html = new sap.ui.core.HTML("style");
                }                
                html.setDOMContent(styleData);
            }

            if (oHtml) {

                if (sap.n && sap.n.Launchpad) {
                    htmlData = decodeURIComponent(oHtml.getContent()).replace(regex, idTo);
                    html = new sap.ui.core.HTML(AppCache.diaView.sId.replace("view", "html"));

                } else {
                    htmlData = decodeURIComponent(oHtml.getContent());
                    html = new sap.ui.core.HTML("html");
                }
                html.setDOMContent(htmlData);
            }

            dia.open();
            sap.ui.core.BusyIndicator.hide();
            this._loadQueue();
            return;
        }

        // ParentObject
        if (AppCache.LoadOptions.parentObject) {

            var view = AppCache.childView;

            AppCache.childView = null;
            oStyle = sap.ui.getCore().byId('oStyle' + applid);
            oHtml = sap.ui.getCore().byId('oHtml' + applid);

            idFrom = "#" + applid + "--";
            idTo = "#" + view.sId + "--";
            regex = new RegExp(idFrom, 'g');

            // Add Style / Html Code
            if (oStyle) {
                
                if (sap.n && sap.n.Launchpad) {
                    styleData = decodeURIComponent(oStyle.getContent()).replace(regex, idTo);
                    styleData = sap.n.Utils.addViewIdToAppCss(styleData, view.sId);
                    html = new sap.ui.core.HTML(view.sId.replace("view", "style"));

                } else {
                    styleData = decodeURIComponent(oStyle.getContent());
                    html = new sap.ui.core.HTML("style");
                }                
                html.setDOMContent(styleData);
            }

            if (oHtml) {

                if (sap.n && sap.n.Launchpad) {
                    htmlData = decodeURIComponent(oHtml.getContent()).replace(regex, idTo);
                    html = new sap.ui.core.HTML(view.sId.replace("view", "html"));

                } else {
                    htmlData = decodeURIComponent(oHtml.getContent());
                    html = new sap.ui.core.HTML("html");
                }
                html.setDOMContent(htmlData);
            }

            if (AppCache.LoadOptions.parentObject.addContent) {
                AppCache.LoadOptions.parentObject.removeAllContent();
                AppCache.LoadOptions.parentObject.addContent(view);
                AppCache.LoadOptions.parentObject.rerender();

            } else if (AppCache.LoadOptions.parentObject.addItem) {
                AppCache.LoadOptions.parentObject.removeAllItems();
                AppCache.LoadOptions.parentObject.addItem(view);
                AppCache.LoadOptions.parentObject.rerender();
            }

            if (typeof AppCache.LoadOptions.parentObject.setBusy === "function") {
                AppCache.LoadOptions.parentObject.setBusy(false);
            }

            var viewId = AppCache.LoadOptions.parentObject.sId.split("--")[0];

            this._loadQueue();
            AppCache.diaView = null;

            if (AppCache.LoadOptions.load !== "card") {
                AppCache.saveChildView(view, appObject, viewId);
            }
            return;
        }

        if (sap.n && sap.n.Launchpad && typeof AppCacheNav.getPage !== "function") {
            if (neptune.ui.debug) console.warn("AppCacheNav not available!");
            if (neptune.ui.debug) sap.m.MessageToast.show("AppCacheNav not available!");
            return;
        }

        // External call, like from the Neptune Cockpit
        if (AppCache.LoadOptions.load === "external") {
            this._loadQueue();
            AppCache.LoadOptions.external(localView);
            return;
        }

        // Normal Page
        if (sap.n.currentView && !AppCacheNav.getPage(sap.n.currentView.sId)) {
            AppCacheNav.addPage(sap.n.currentView);
        }

        // Navigate
        if (!AppCache.LoadOptions.loadInBackground) {
            AppCacheNav.to(sap.n.currentView);
        }

        // Apply Style
        oStyle = sap.ui.getCore().byId('oStyle' + applid);
        oHtml = sap.ui.getCore().byId('oHtml' + applid);

        idFrom = "#" + applid + "--";
        idTo = "#" + localView.sId + "--";
        regex = new RegExp(idFrom, 'g');

        // Add Style / Html Code
        if (oStyle) {
            if (sap.n && sap.n.Launchpad) {
                styleData = decodeURIComponent(oStyle.getContent()).replace(regex, idTo);
                styleData = sap.n.Utils.addViewIdToAppCss(styleData, localView.sId);

                html = new sap.ui.core.HTML(localView.sId.replace("view", "style"));
            } else {
                styleData = decodeURIComponent(oStyle.getContent());
                html = new sap.ui.core.HTML("style");
            }                
            html.setDOMContent(styleData);
        }

        if (oHtml) {
            if (sap.n && sap.n.Launchpad) {
                htmlData = decodeURIComponent(oHtml.getContent()).replace(regex, idTo);
                html = new sap.ui.core.HTML(view.sId.replace("view", "html"));

            } else {
                htmlData = decodeURIComponent(oHtml.getContent());
                html = new sap.ui.core.HTML("html");
            }
            html.setDOMContent(htmlData);
        }

        var hideHeader = AppCache.LoadOptions.hideHeader || false;

        // Set Shell Title
        if (sap.n && sap.n.Launchpad && sap.n.Launchpad.SetHeader) {
            hideHeader = sap.n.Launchpad.SetHeader(hideHeader);
        }

        if (sap.n && sap.n.Launchpad && hideHeader) {
            
            sap.n.Launchpad.setHideHeader(true);

            $("#AppCacheNav").off().on('touchstart mousedown', function(e) {

                if (e.type === "touchstart") {

                    var touchStart = e.changedTouches[0].screenY;
                    if (touchStart > AppCache.shellTouchArea) {
                        return;
                    }
                    $("#AppCacheNav").on('touchend', function(e) {
                        $("#AppCacheNav").off('touchend touchmove');
                    });

                    $("#AppCacheNav").on('touchmove', function(e) {
                        moved = e.changedTouches[0].screenY - touchStart;
                        if (moved > 50) {
                            sap.n.Launchpad.setHideHeader(false);
                            AppCacheUserActionHideHeader.setVisible(true);
                        }
                    });
                } else {

                    var mouseStart = e.screenY;
                    if (mouseStart > AppCache.shellMouseArea) {
                        return;
                    }
                    $("#AppCacheNav").on('mouseup', function(e) {
                        $("#AppCacheNav").off('mouseup mousemove');
                    });
                    $("#AppCacheNav").on('mousemove', function(e) {
                        moved = e.screenY - mouseStart;
                        if (moved > 50) {
                            sap.n.Launchpad.setHideHeader(false);
                            AppCacheUserActionHideHeader.setVisible(true);
                            $("#AppCacheNav").off('mouseup mousemove');
                        }
                    });
                }
            });
        }

        sap.ui.core.BusyIndicator.hide();
        this._loadQueue();

        //22.10.0005 #18595
        if (AppCache.StartApp) {
            neptune.Splash.hide();
        }
        //22.10.0005 #18595 End
    },

    getView: function(config) {

        var value = config.value;
        var applid = value.replace(/\//g, "");
        var option = config.option;
        var appWidthLimited = config.appWidthLimited;
        var url;
        var sign = "?";
        var urlPath = "";
        var method = "POST";
        var appName = value + '.view.js';
        appName = appName.replace(/\//, "");

        if (AppCache.busyTile) {
            AppCache.busyTile.removeStyleClass("nepLoadError");
        }

        // Set viewname
        if (!AppCache.CurrentLanguage) {
            if (neptune.ui.debug) console.warn("AppCache.getView: AppCache.CurrentLanguage is empty. Using English...");
        }
        var language = AppCache.CurrentLanguage || "E";
        var system = AppCache.System || "SID";
        if (!!AppCache.CustomSystem) {
            system = AppCache.CustomSystem.toUpperCase().substring(0, 3).padEnd(3, "X");
        }
        var viewName = system + '_' + AppCache.Client + '_' + language + '_' + value;

        if (AppCache.isHCP) {
            appName = AppCache.hcpDestination + '/' + value + '.view.js?hcp-destination=' + AppCache.hcpDestination;
            sign = "&";
        }

        if (AppCache.allowIcfNode) {
            urlPath = "/" + AppCache.allowIcfNode.toLowerCase();
        }

        if (AppCache.isMobile) {
            if (AppCache.exportApps && location.protocol === "file:") {
                method = "GET";
                url = cordova.file.applicationDirectory + "www/views/" + appName;
            } else {
                if (AppCache.extIcfAlias){
                    url = AppCache.UrlBase + AppCache.extIcfAlias + urlPath + "/native/" + appName;
                } else {
                    url = AppCache.UrlBase + "/neptune" + urlPath + "/native/" + appName;
                }
    
            }
        } else {
            if (AppCache.isHCP) {
                url = '/' + AppCache.hcpDestination + '/' + value + '.view.js?hcp-destination=' + AppCache.hcpDestination;
                sign = "&";
            } else {
                url = AppCache.UrlBase + "/neptune" + urlPath + "/" + appName;
            }
        }

        url += sign + "dxp=" + neptune.dxpVersion;

        if (AppCache.neptuneUiDebug) {
            url += "&debug";
        }

        $.ajax({
            contentType: "application/json",
            dataType: "json",
            type: method,
            url: url,
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            },
            success: function(data, status, request) {

                // Save in DB/LocalStorage
                if (AppStorage.database) {
                    if (sap.n) AppStorage.saveView(viewName, data);

                } else {
                    sap.ui.requireSync("jquery.sap.storage");
                    var ls = $.sap.storage($.sap.storage.Type.local, "GLOBAL");
                    ls.put(viewName, data);
                }

                if (request.getResponseHeader("disable-frontend-cache")) {

                    // In the ABAP HTTP Handler the disable-frontend-cache will be set if the "Disable Frontend Client Cache" has been enabled
                    var forceOnline = JSON.parse(localStorage.getItem("forceOnline") || "{}");
                    forceOnline[viewName] = true;
                    localStorage.setItem("forceOnline", JSON.stringify(forceOnline));

                }

                // Update Application Data
                if (!AppCache.exportApps && typeof getOnlineAppCacheAppTimestamp === "function") getOnlineAppCacheAppTimestamp(value);

                // touchStart View
                AppCache.initView({
                    value: value,
                    viewData: data,
                    isInvalid: true,
                    appWidthLimited: appWidthLimited,
                    option: option
                });
            },
            error: function(xhr, status, error) {

                function _handle() {

                    AppCache.loadRunning = false;

                    if (sap.n && sap.n.Launchpad) {
                        sap.n.Launchpad.currentTile = {};
                    }
                    if (AppCache.busyTile) {
                        AppCache.busyTile.setBusy(false);
                        AppCache.busyTile.addStyleClass("nepLoadError");
                        AppCache.busyTile = null;
                    }

                    switch (xhr.status) {
                        case 0:
                            if (!AppCache.isClientOnline()) {
                                AppCache.handleAfterLoadError(AppCache_tViewNoConnection.getText(), true);
                            }
                            return;

                        case 403: // unauthorized
                            AppCache.Logout(xhr.status);
                            return;
                        case 401: // not authenticated
                            var currUname = AppCache.CurrentUname;
                            AppCache.Logout(xhr.status);
                            if (AppCache.isMobile) {
                                if (AppCache.enablePwa) {
                                    AppCache.userLogout(currUname);
                                    AppCache.setEnableLogonScreen();
                                    AppCache.handleErrorMessage(AppCache_tUserLocked.getText());

                                }

                                // this might be enhanced to other authentication methods in the future
                            } else {
                                location.reload();
                            }
                            return;
                        default:
                            var errTxt = xhr.statusText || "AJAX error posting " + url;
                            AppCache.handleAfterLoadError("AppCache.getView: " + xhr.status + " - " + errTxt, true);
                            return;
                    }
                }

                // Get forceOnline view from cache on offline
                var forceOnline = JSON.parse(localStorage.getItem("forceOnline") || "{}");
                if (forceOnline[viewName]) {

                    if (AppStorage.database) {

                        AppStorage.getView(viewName).then(function AppCacheGetView(viewData) {
                            if (typeof viewData === "object" && viewData.view.length > 2) {
                                AppCache.initView({
                                    value: value,
                                    viewData: viewData,
                                    appWidthLimited: AppCache.LoadOptions.appWidthLimited
                                });
            				} else {
            				    _handle();
            				}
                        });
            			
                    } else {

                        sap.ui.requireSync("jquery.sap.storage");
                        var ls = $.sap.storage($.sap.storage.Type.local, "GLOBAL");

                        var data = ls.get(viewName);

                        if (data) {
                            AppCache.initView({
                                value: value,
                                viewData: data,
                                appWidthLimited: AppCache.LoadOptions.appWidthLimited
                            });
                        } else {
                            _handle();
                        }
                    }
                    return;

                } else {
                    _handle();
                }
            }
        });
    },

    saveChildView: function(view, appObject, viewId) {

        if (!sap.n) return;

        var id;

        if (AppCache.LoadOptions.load === "splitview") {
            if (!AppCache.LoadOptions.splitviewId) {
                if (neptune.ui.debug) console.warn("Splitview ID missing");
                return;
            }
            id = AppCache.LoadOptions.splitviewId;

        } else {

            $.each(sap.n.Apps, function(key, app) {
                if (app.viewId === viewId) {
                    id = app.app;
                    return false;
                }
            });
        }

        try {
            if (!AppCache.ViewChild[id]) {
                AppCache.ViewChild[id] = {};
            }
            if (typeof AppCache.ViewChild[id][appObject.app] === "undefined") {
                AppCache.ViewChild[id][appObject.app] = view;
            }

        } catch (e) {
            if (neptune.ui.debug) console.warn("AppCache.saveChildView: " + e.message);
        }
    },

    _loadQueue: function() {
        this.loadRunning = false;

        var appData = this.loadQueue[0];

        if (appData) {
            this.loadQueue.splice(0, 1);
            this.Load(appData.APPLID, appData.OPTIONS);
        }

    },

    // p8GetViewAll => moved to AppStorage.getViewAll

    getParameterByName: function(name, str) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(str);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    },

    handleAfterLoadError: function(msg, doNotBlock) {

        sap.m.MessageToast.show(msg, {
            duration: 6000
        });
        console.error(msg);

        AppCache.loadRunning = false;

        if (AppCache.busyTile) AppCache.busyTile.setBusy(false);
        try {
            if (!doNotBlock) {
                if (AppCache.busyTile) {
                    AppCache.busyTile.setBlocked(true);
                    AppCache.busyTile.addStyleClass("nepBlocked");
                }
            }
        } catch (e) {
            // No message, just do nothing...
        }

        // Close Sidebar
        if (sap.n && sap.n.Launchpad) {
            var tileData = sap.n.Launchpad.currentTile;
            sap.n.Launchpad.currentTile = {};
            sap.n.Shell.closeTile(tileData);
        }
    },

    isClientOnline: function() {
        if (navigator.connection) {
            if (navigator.connection.type !== 'none' && AppCache.isOffline === false) {
                return true;
            } else {
                return false;
            }
        } else {
            // iOS does not have navigator.connection
            if (window.navigator.onLine && AppCache.isOffline === false) {
                return true;
            } else {
                return false;
            }
        }
    },
    
    viewExists: function(view) {
        var found = false;
        $.each(sap.ui.getCore().byFieldGroupId(""), function(i, data) {
            var id = data.getId().split("--");
            if (id[0] === view.sId) found = true;
        });
        return found;
    }
};