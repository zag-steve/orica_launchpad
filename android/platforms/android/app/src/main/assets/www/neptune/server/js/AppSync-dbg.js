AppSync = {
    diaSync: null,
    diaSyncIcon1: null,
    diaSyncIcon2: null,
    diaSyncIcon3: null,
    diaSyncCount1: null,
    diaSyncCount2: null,
    diaSyncCount3: null,
    diaSyncCount4: null,
    serverUrl: null,
    db: null,
    updateArray: [],
    updateRunning: false,
    tablesToSync: [],
    tablesToSyncViaModel: [], // Reference Model
    syncInfo: null,
    syncResult: null,
    lastSyncDate: 0,
    firstSync: false,
    cbEndSync: null,
    sqlSplit: 100,
    runParallell: true,
    noDialog: false,
    updPackage: 0,
    recPackage: 0,
    numPackage: 1,
    applid: '',

    checkTable: function(table, fields) {
        AppDB.transaction(function(tx) {
            tx.executeSql('SELECT name, sql FROM sqlite_master WHERE type="table" AND name = ?', [table], function(tx, results) {
                var colParts = results.rows.item(0).sql.replace(/^[^\(]+\(([^\)]+)\)/g, '$1').split(',');
                var colNames = [];
                for (var i in colParts) {
                    if (typeof colParts[i] === 'string')
                        colNames.push(colParts[i].split(" ")[1]);
                }
                $.each(fields, function(i, data) {
                    if (colNames.indexOf(data) === -1) {
                        var alterTable = "ALTER TABLE " + table + " ADD " + data + " VARCHAR;";
                        try {
                            AppDB.transaction(function(transaction) {
                                transaction.executeSql(alterTable, []);
                                if (neptune.ui.debug) console.log("Table: " + table + ", added field: " + data);
                            });
                        } catch (e) {
                            if (neptune.ui.debug) console.error("Error: Unable to alter table " + e + ".");
                        }
                    }
                });
            });
        });
    },

    openDatabase: function() {
        AppStorage._AppCache_Open_DB();
    },

    initSync: function(theTablesToSync, dbObject, theSyncInfo, theServerUrl, callBack, theApp) {
        var self = this;
        var i = 0;
        this.applid = theApp;
        this.db = dbObject;
        this.serverUrl = theServerUrl;
        // this.tablesToSync = theTablesToSync; // Reference Model
        this.tablesToSync = [];
        this.tablesToSyncViaModel = [];
        this.syncInfo = theSyncInfo;

        var tmpTablesToSync = theTablesToSync;
        // We will build two arrays here:
        // -----> this.tablesToSync <-----
        // will contain the normal webSql table entries so the old AppSync framework source code can still rely on the fact that this array will contain all websql related tablesToSyncViaModel
        //
        // -----> this.tablesToSyncViaModel <-----
        // will contain the table entries which should be hadled as normal model objects those don't requre websql to be available because we use the ModelData.Add... functions
        for (i = 0; i < tmpTablesToSync.length; i++) {
            if (tmpTablesToSync[i].model) {
                this.tablesToSyncViaModel.push(tmpTablesToSync[i]); // Reference Model
            } else {
                this.tablesToSync.push(tmpTablesToSync[i]); // WebSQL
            }
        }

        for (i = 0; i < self.tablesToSync.length; i++) {
            if (typeof self.tablesToSync[i].idName === 'undefined') {
                self.tablesToSync[i].idName = 'id';
            }
        }

        if (self.db) {
            self.db.transaction(function(transaction) {
                self._executeSql('CREATE TABLE IF NOT EXISTS SYNCINFO (key VARCHAR PRIMARY KEY,last_sync TIMESTAMP);', [], transaction);
            });

            self._selectSql('SELECT last_sync FROM SYNCINFO WHERE key = ?', [self.applid], null, function(res) {

                if (res.length === 0 || res[0] === 0) {
                    self._executeSql('INSERT OR REPLACE INTO SYNCINFO (key,last_sync) VALUES (?,?)', [self.applid, 0]);
                    self.firstSync = true;
                    self.lastSyncDate = 0;
                    self.syncInfo.lastSyncDate = self.lastSyncDate;
                    callBack(true);
                } else {
                    self.lastSyncDate = res[0].last_sync;
                    if (self.lastSyncDate === 0) {
                        self.firstSync = true;
                    }
                    self.syncInfo.lastSyncDate = self.lastSyncDate;
                    callBack(false);
                }
            });
        } else {
            console.error("AppSync.initSync: DB not available!");
            callBack();
        }
    },

    syncNow: function(callBackProgress, callBackEndSync, numPackage) {

        var self = this;

        // Reference Models don't require WebSQL
        // if (this.db === null) {
        //     throw 'You should call the initSync before (db is null)';
        // }

        self.syncResult = {
            syncOK: false,
            codeStr: 'noSync',
            message: 'No Sync yet',
            nbSent: 0,
            nbUpdated: 0
        };

        // Init
        self.updPackage = 0;
        self.recPackage = 0;

        if (numPackage) {
            self.numPackage = numPackage;
        } else {
            self.numPackage = 1;
        }

        // Status dialog
        self.createDialog();

        self.cbEndSync = function() {
            callBackProgress(self.syncResult.message, 100, self.syncResult.codeStr);
            callBackEndSync(self.syncResult);
        };
        var dataToSync = {
            info: self.syncInfo,
            data: {}
        };
        self._sendDataToServer(dataToSync);
    },

    createDialog: function() {

        // if application has been updated, it will be loaded two times in short seques
        if (this.diaSync) {

            if (this.diaSync.isOpen()) {
                this.diaSync.close();
            }
        } else {

            this.diaSync = new sap.m.Dialog({
                contentHeight: "260px",
                contentWidth: "400px",
                title: "Syncronization"
            });
            var diaSyncTable = new sap.m.Table({
                fixedLayout: false
            });
            this.diaSync.addContent(diaSyncTable);
            var diaSyncCol1 = new sap.m.Column({
                width: "40px"
            });
            diaSyncTable.addColumn(diaSyncCol1);
            var diaSyncCol2 = new sap.m.Column();
            diaSyncTable.addColumn(diaSyncCol2);
            var diaSyncCol3 = new sap.m.Column({
                hAlign: "End",
                width: "100px"
            });
            diaSyncTable.addColumn(diaSyncCol3);
            var diaSyncItem1 = new sap.m.ColumnListItem();
            diaSyncTable.addItem(diaSyncItem1);
            this.diaSyncIcon1 = new sap.ui.core.Icon({
                size: "20px"
            });
            diaSyncItem1.addCell(this.diaSyncIcon1);
            var diaSyncText1 = new sap.m.Text({
                text: "Select"
            });
            diaSyncItem1.addCell(diaSyncText1);
            this.diaSyncCount1 = new sap.m.BusyIndicator();
            diaSyncItem1.addCell(this.diaSyncCount1);

            var diaSyncItem2 = new sap.m.ColumnListItem();
            diaSyncTable.addItem(diaSyncItem2);
            this.diaSyncIcon2 = new sap.ui.core.Icon({
                size: "20px"
            });
            diaSyncItem2.addCell(this.diaSyncIcon2);
            var diaSyncText2 = new sap.m.Text({
                text: "Receive"
            });
            diaSyncItem2.addCell(diaSyncText2);
            this.diaSyncCount2 = new sap.m.Text();
            diaSyncItem2.addCell(this.diaSyncCount2);
            var diaSyncItem3 = new sap.m.ColumnListItem();
            diaSyncTable.addItem(diaSyncItem3);
            this.diaSyncIcon3 = new sap.ui.core.Icon({
                size: "20px"
            });
            diaSyncItem3.addCell(this.diaSyncIcon3);
            var diaSyncText3 = new sap.m.Text({
                text: "Update"
            });
            diaSyncItem3.addCell(diaSyncText3);
            this.diaSyncCount3 = new sap.m.Text();
            diaSyncItem3.addCell(this.diaSyncCount3);

            var diaSyncItem4 = new sap.m.ColumnListItem();
            diaSyncTable.addItem(diaSyncItem4);
            this.diaSyncIcon4 = new sap.ui.core.Icon({
                src: "sap-icon://number-sign",
                size: "20px"
            });
            diaSyncItem4.addCell(this.diaSyncIcon4);
            var diaSyncText4 = new sap.m.Text({
                text: "Records"
            });
            diaSyncItem4.addCell(diaSyncText4);
            this.diaSyncCount4 = new sap.m.Text();
            diaSyncItem4.addCell(this.diaSyncCount4);
        }

        this.diaSyncCount2.setText(this.recPackage + "/" + this.numPackage);
        this.diaSyncCount3.setText(this.updPackage + "/" + this.numPackage);
        this.diaSyncCount4.setText("0");
        this.diaSyncIcon1.setSrc("sap-icon://process");
        this.diaSyncIcon2.setSrc("sap-icon://process");
        this.diaSyncIcon3.setSrc("sap-icon://process");
        this.diaSyncIcon1.setColor("#f39c12");
        this.diaSyncIcon2.setColor("#f39c12");
        this.diaSyncIcon3.setColor("#f39c12");
        this.diaSync.rerender();

        if (!this.noDialog) {
            this.diaSync.open();
        }
    },

    log: function(message) {
        //console.log(message);
    },

    error: function(message) {
        console.error(message);
    },

    resetSyncDate: function() {
        this.syncInfo.lastSyncDate = 0;
        this.firstSync = true;
        this._executeSql('UPDATE SYNCINFO SET last_sync = "0" WHERE key=?', [this.applid]);
    },

    _sendDataToServer: function(dataToSync) {
        var self = this;

        jQuery.ajax({
            url: self.serverUrl + "&key=BUILD" + "&ajax_value=" + self.numPackage,
            type: 'POST',
            data: JSON.stringify(dataToSync),
            dataType: 'json',
            success: function(serverAnswer) {
                self.diaSyncCount4.setText(serverAnswer.rows);
                self.diaSyncIcon1.setColor("#007833");
                self.diaSyncIcon1.setSrc("sap-icon://accept");

                AppSyncBeforeUpdate(self);

                // Only one package
                if (self.numPackage === 1) {
                    self._updatePutInQueue(serverAnswer);
                    return;
                }

                // Multiple packages
                if (self.runParallell) {
                    for (i = 0; i < self.numPackage; i++) {
                        self._getPackageFromServer(dataToSync, i);
                    }
                } else {
                    self._getPackageFromServer(dataToSync, 0);
                }

            },
            error: function(serverAnswer) {
                self.diaSync.close();
                serverAnswer.result = 'ERROR';
                serverAnswer.message = serverAnswer.statusText;
                self.cbEndSync(self.syncResult);
            }
        });
    },

    _getPackageFromServer: function(dataToSync, currRec) {
        var self = this;

        jQuery.ajax({
            url: self.serverUrl + "&key=GET&key_id=" + currRec,
            type: 'POST',
            data: JSON.stringify(dataToSync),
            dataType: 'json',
            success: function(serverAnswer) {

                // Status
                self.recPackage++;
                self.diaSyncCount2.setText(self.recPackage + "/" + self.numPackage);
                self.diaSyncCount1.setVisible(false);

                self._updatePutInQueue(serverAnswer);

                if (self.recPackage === self.numPackage) {
                    self.diaSyncIcon2.setColor("#007833");
                    self.diaSyncIcon2.setSrc("sap-icon://accept");
                } else {
                    if (!self.runParallell) {
                        self._getPackageFromServer(dataToSync, self.recPackage);
                    }
                }

            },
            error: function(serverAnswer) {
                self.diaSync.close();
                serverAnswer.result = 'ERROR';
                serverAnswer.message = serverAnswer.statusText;
                self.cbEndSync(self.syncResult);
            }
        });
    },

    _updatePutInQueue: function(serverAnswer) {
        this.updateArray.push(serverAnswer);
        this._updateStartQueue();
    },

    _updateStartQueue: function() {
        if (!this.updateRunning) {
            this._updateLocalDb(this.updateArray[0]);
            this.updateArray.splice(0, 1);
        }
    },


    _updateModels: function(serverData) { // Reference Models
        var self = this;

        self.updateRunning = true;

        self.tablesToSyncViaModel.forEach(function(table) {
            if (table.model) {
                // Really check that we have a model object...
                if (typeof serverData.data[table.tableName] === "undefined") {
                    serverData.data[table.tableName] = [];
                }

                var unpackedJSON = JSONH.unpack(serverData.data[table.tableName]);
                delete serverData.data[table.tableName]; // Free up memory as early as possible
                ModelData.AddArray(table.model, unpackedJSON);
            }
        }); //end forEach


    },

    _postUpdateTasks: function(serverData, tx) {
        var self = this;

        self.updPackage++;
        self._finishSync(serverData.syncDate, tx);
        self.diaSyncCount3.setText(self.updPackage + "/" + self.numPackage);

        // Start Update
        self.updateRunning = false;
        serverData = "";

        if (self.updateArray.length !== 0) {
            setTimeout(function() {
                self._updateStartQueue();
            }, 100);
        }

        if (self.updPackage === self.numPackage) {
            AppSyncAfterUpdate(self);

            self.diaSyncIcon3.setColor("#007833");
            self.diaSyncIcon3.setSrc("sap-icon://accept");

            self.syncResult.syncOK = true;
            self.cbEndSync(self.syncResult);

            setTimeout(function() {
                self.diaSync.close();
            }, 100);
        }
    },

    _updateLocalDb: function(serverData) {
        var self = this;

        if (self.updPackage > self.numPackage) {
            return;
        }

        if (!serverData || serverData.result === 'ERROR') {
            self.syncResult.syncOK = false;
            self.syncResult.codeStr = 'syncKoServer';
            if (serverData) {
                self.syncResult.message = serverData.message;
            } else {
                self.syncResult.message = 'No answer from the server';
            }
            self.cbEndSync(self.syncResult);
            return;
        }

        if (self.db && self.tablesToSync.length > 0) {

            if (typeof serverData.data === 'undefined' || serverData.data.length === 0) {
                self.db.transaction(function(tx) {
                    self._finishSync(serverData.syncDate, tx);
                });
                return;
            }

            self.db.transaction(function(tx) {

                self.updateRunning = true;

                var counterNbTable = 0;
                var nbTables = self.tablesToSync.length;

                self.tablesToSync.forEach(function(table) {

                    if (typeof serverData.data[table.tableName] === "undefined") {
                        serverData.data[table.tableName] = [];
                    }

                    var members = serverData.data[table.tableName].slice(1, serverData.data[table.tableName][0] + 1);
                    var currRec = 0;
                    var sql = '';
                    var doLast = false;

                    // Remove Column Headers
                    serverData.data[table.tableName] = serverData.data[table.tableName].slice(parseInt(serverData.data[table.tableName][0]) + 1, serverData.data[table.tableName].length);

                    // sqlStatement
                    var sqlStart = 'INSERT OR REPLACE INTO ' + table.tableName + ' (';
                    var sep = '';
                    var fieldCount = 0;

                    // sqlStatement - Part 1
                    sqlStart += self._arrayToString(members, ',');
                    sqlStart += ') SELECT ';
                    sql = sqlStart;

                    $.each(serverData.data[table.tableName], function(nr, data) {

                        // New batch
                        if (fieldCount === members.length) {

                            sep = '';
                            fieldCount = 0;
                            doLast = true;
                            currRec++;

                            // Union select or start new
                            if (currRec === AppSync.sqlSplit) {
                                self._executeSql(sql, null, tx);
                                sql = sqlStart;
                                currRec = 0;
                                // doLast = false; removed due to ticket 12188
                            } else {
                                sql += ' UNION SELECT ';
                            }
                        }
                        // Values
                        fieldCount++;
                        sql += sep + '"' + data + '"';
                        sep = ',';
                    });
                    if (doLast || serverData.data[table.tableName].length === members.length) {
                        self._executeSql(sql, null, tx);
                    }
                });

                self._updateModels(serverData);
                self._postUpdateTasks(serverData, tx);
 
            }); //end tx

        } else {

            // No websql at all only Reference Models
            self._updateModels(serverData);
            self._postUpdateTasks(serverData, null);

        }
    },

    _finishSync: function(syncDate, tx) {
        this.firstSync = false;
        this.lastSyncDate = syncDate;
        this.syncInfo.lastSyncDate = this.lastSyncDate;
        this._executeSql('UPDATE SYNCINFO SET last_sync = "' + this.lastSyncDate + '" WHERE key=?', [this.applid], tx);
    },

    _selectSql: function(sql, params, optionalTransaction, callBack) {
        var self = this;
        self._executeSql(sql, params, optionalTransaction, function(tx, rs) {
            callBack(self._transformRs(rs));
        }, self._errorHandler);
    },

    _transformRs: function(rs) {
        var elms = [];
        if (typeof(rs.rows) === 'undefined') {
            return elms;
        }
        for (var i = 0; i < rs.rows.length; ++i) {
            elms.push(rs.rows.item(i));
        }
        return elms;
    },

    _executeSql: function(sql, params, optionalTransaction, optionalCallBack) {
        var self = this;
        self.log('_executeSql: ' + sql + ' with param ' + params);
        if (!optionalCallBack) {
            optionalCallBack = self._defaultCallBack;
        }
        if (optionalTransaction) {
            self._executeSqlBridge(optionalTransaction, sql, params, optionalCallBack, self._errorHandler);
        } else {
            if (self.db) {
                self.db.transaction(function(tx) {
                    self._executeSqlBridge(tx, sql, params, optionalCallBack, self._errorHandler);
                });
            }
        }
    },

    _executeSqlBridge: function(tx, sql, params, dataHandler, errorHandler) {
        var self = this;
        if (typeof self.db.dbPath !== 'undefined') {
            var sqlAndParams = [sql].concat(params);
            var cb = function(res) {
                res.rows.item = function(i) {
                    return this[i];
                };
                dataHandler(tx, res);
            };
            tx.executeSql(sqlAndParams, cb, errorHandler);
        } else {
            tx.executeSql(sql, params, dataHandler, errorHandler);
        }
    },

    _defaultCallBack: function(transaction, results) {

    },

    _errorHandler: function(transaction, error) {
        AppSync.error('Error : ' + error.message + ' (Code ' + error.code + ') Transaction.sql = ' + transaction.sql);
    },

    _arrayToString: function(array, separator) {
        var result = '';
        for (var i = 0; i < array.length; i++) {
            result += array[i];
            if (i < array.length - 1) {
                result += separator;
            }
        }
        return result;
    }
};