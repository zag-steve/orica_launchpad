neptune.Sort = {

    mTable: {

        register: function(tab, config) {

            if (typeof tab.neptuneSort === "object") return;
            tab.neptuneSort = new this.mTable(tab, config);
        },

        mTable: function(tab, config) {

            this.tab = tab;
            this.app = config.app;
            this.tabId = this.tab.getId().split('--')[1] || this.tab.getId();
            this.columns = {};
            this.defaultColumn = tab.defaultColumn || this.tab.getColumns()[0].getId().split('--')[1] || this.tab.getColumns()[0].getId();
            this.defaultDirection = tab.defaultColumnDirection || sap.ui.core.SortOrder.Ascending;
            this.defaultColumnIndex = 0;
            
            this.addClickEvents = function() {
                
                var that = this;

                $.each(that.tab.getColumns(), function(i, column) {

                    if (that.columns[i].sorting === "None" || !that.columns[i].sortField) return true;
                    
                    column.setStyleClass("nepMTableSortCell");

                    var colId = column.getId().split('--')[1] || column.getId();
                    // $("#" + column.getId()).addClass("nepMTableSortCell");

                    var _column_delegate = {
                        onclick: function(e) {
                            that.change(colId);
                            that.sort();
                        }
                    };
                    column.addEventDelegate(_column_delegate);
                    column.exit = function() {
                        column.removeEventDelegate(_column_delegate);
                    };
                    if (colId === that.column) {
                        that.sorting = that.columns[i].sorting;
                    }
                });
            };

            this.init = function(data) {

                var that = this;

                $.each(this.tab.getColumns(), function(i, column) {

                    that.columns[i] = {};
                    var colId = column.getId().split('--')[1] || column.getId();

                    if (colId === that.defaultColumn) {
                        that.defaultColumnIndex = i;
                    }
                    if (!!column.customSortField) {
                        that.columns[i].sortField = column.customSortField;

                    } else {
                        var cell = that.tab.mBindingInfos.items.template.mAggregations.cells[i];
                        that.columns[i].sortField = that.getPath(cell.mBindingInfos);
                    }
                    that.columns[i].sorting = column.sorting || "Both";
                });

                neptune.Utils.userDefault.read({
                    AREA: 'SORT',
                    GROUPING: this.app,
                    NAME: this.tabId
                }, 
                function(data) {
                    if (data && !!data.VAL0) {
                        that.column = data.VAL0;
                        that.field = data.VAL1;
                        that.direction = data.VAL2 || sap.ui.core.SortOrder.Ascending;
                    }
                    that.addClickEvents();
                    that.sort();
                }),
                function(err) {
                    that.addClickEvents();
                    that.sort();
                };
            };

            this.change = function(sortColumn) {

                if (this.column === sortColumn && this.column === this.defaultColumn) {
                    this.direction = (this.direction === sap.ui.core.SortOrder.Descending) ? sap.ui.core.SortOrder.Ascending : sap.ui.core.SortOrder.Descending;

                } else if (this.column === sortColumn && (this.sorting === sap.ui.core.SortOrder.Ascending || this.sorting === sap.ui.core.SortOrder.Descending)) {
                    this.column = this.defaultColumn;
                    this.direction = this.defaultDirection;

                } else if (this.column !== sortColumn && sortColumn === this.defaultColumn) {
                    this.column = sortColumn;
                    this.direction = this.defaultDirection;

                } else if (this.column !== sortColumn) {
                    this.column = sortColumn;
                    this.direction = sap.ui.core.SortOrder.Ascending;

                } else if (this.direction === sap.ui.core.SortOrder.Ascending) {
                    this.direction = sap.ui.core.SortOrder.Descending;

                } else {
                    this.column = this.defaultColumn;
                    this.direction = this.defaultDirection;
                }

                var that = this;
                $.each(this.tab.getColumns(), function(i, column) {

                    var colId = column.getId().split('--')[1] || column.getId();
                    if (colId === that.column) {

                        var cell = that.tab.mBindingInfos.items.template.mAggregations.cells[i];
                        that.sorting = that.columns[i].sorting;
                        that.field = that.columns[i].sortField;

                        if (that.columns[i].sorting === sap.ui.core.SortOrder.Ascending || that.columns[i].sorting === sap.ui.core.SortOrder.Descending) {
                            that.direction = that.columns[i].sorting;
                        }
                        return false;
                    }
                });

                neptune.Utils.userDefault.update({
                    AREA: 'SORT',
                    GROUPING: this.app,
                    NAME: this.tabId,
                    KEY0: 'column',
                    VAL0: this.column,
                    KEY1: 'field',
                    VAL1: this.field,
                    KEY2: 'direction',
                    VAL2: this.direction
                });
            };

            this.setDefaultColumn = function() {

                var column = this.tab.getColumns()[this.defaultColumnIndex];

                this.column = column.getId().split('--')[1] || column.getId();
                this.direction = this.defaultDirection;

                this.sorting = this.columns[this.defaultColumnIndex].sorting;
                this.field = this.columns[this.defaultColumnIndex].sortField;
            };

            this.getPath = function(bindingInfos) {
                var path = "";
                var del = "";

                if (bindingInfos.text) {
                    path = bindingInfos.text.parts[0].path;
                } else if (bindingInfos.number) {
                    path = bindingInfos.number.parts[0].path;
                }
                return path;
            };

            this.sort = function() {

                var that = this;

                if (!this.column) {
                    this.setDefaultColumn();
                }

                var sorters = [];
                var columns = this.tab.getColumns();

                if (typeof this.tab.customSorter === "function") {

                    var customSorter = this.tab.customSorter(this.field, (this.direction === sap.ui.core.SortOrder.Descending)) || null;

                    if (Array.isArray(customSorter)) {
                        sorters = customSorter;

                    } else if (customSorter && typeof customSorter === "object" && typeof customSorter.getMetadata === "function" && customSorter.getMetadata().getName() === "sap.ui.model.Sorter") {
                        sorters.push(customSorter);
                    }

                } else if (!!this.tab.groupBy) {
                    sorters.push(new sap.ui.model.Sorter(this.tab.groupBy, false, true));
                }

                $.each(columns, function(i, column) {

                    column.setSortIndicator(sap.ui.core.SortOrder.None);
                    var colId = column.getId().split('--')[1] || column.getId();

                    if (colId === that.column) {
                        column.setSortIndicator(that.direction);

                        var styleClass = that.direction;
                        $("#" + column.getId()).addClass("nepMTableSort" + styleClass);

                        if (typeof column.customSorter === "function") {

                            var customSorter = column.customSorter(that.field, (that.direction === sap.ui.core.SortOrder.Descending));

                            if (Array.isArray(customSorter)) {
                                sorters = customSorter;
                            } else if (customSorter !== null) {
                                sorters.push(customSorter);
                            }

                        } else {
                            sorters.push(new sap.ui.model.Sorter(that.field, (that.direction === sap.ui.core.SortOrder.Descending), false));

                            if (that.field === "UPDDAT") {
                                sorters.push(new sap.ui.model.Sorter("UPDTIM", true, false));
                            }
                        }
                    }
                });
                this.tab.getBinding("items").sort(sorters);
            };
            this.init();
        }
    }
};