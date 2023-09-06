neptune.UI5Objects = {

    load: function(config) {
        this.defineLibrary();
        this.RichTextEditor(config);
        this.Dialog(config);
    },
    queue: {
        RichTextEditor: []
    },

    Dialog: function(config) {

        sap.m.Dialog.extend("nep.integration.Dialog", {

            metadata: {

                properties: {
                    "hideMinimize": {
                        type: "boolean",
                        defaultValue: false
                    },
                    "hideMosaic": {
                        type: "boolean",
                        defaultValue: false
                    },
                    "hideMaximize": {
                        type: "boolean",
                        defaultValue: false
                    },
                    "hideClose": {
                        type: "boolean",
                        defaultValue: false
                    },
                    "contentIsURL": {
                        type: "boolean",
                        defaultValue: false
                    },
                    "_origWidth": {
                        type: "sap.ui.core.CSSSize"
                    },
                    "_origHeight": {
                        type: "sap.ui.core.CSSSize"
                    },
                    "_origTop": {
                        type: "sap.ui.core.CSSSize"
                    },
                    "_origLeft": {
                        type: "sap.ui.core.CSSSize"
                    },
                    "_headerIcon": {
                        type: "sap.ui.core.Icon"
                    },
                    "_headerTitle": {
                        type: "sap.m.Title"
                    },
                    "_butMaximize": {
                        type: "sap.m.Button"
                    },
                    "_butMinimize": {
                        type: "sap.m.Button"
                    },
                    "_butRestore": {
                        type: "sap.m.Button"
                    },
                    "_butMosaic": {
                        type: "sap.m.Button"
                    },
                    "_butClose": {
                        type: "sap.m.Button"
                    },
                    "_viewContent": {
                        type: "string"
                    }
                },
            },

            init: function() {
                sap.m.Dialog.prototype.init.call(this);

                var dia = this;
                dia._viewContent = AppCache.diaView;
                dia._appGUID = AppCache.LoadOptions.appGUID;
                dia._startParams = AppCache.LoadOptions.startParams;

                // Dialog Header
                var diaHeader = new sap.m.Bar();
                dia.setCustomHeader(diaHeader);

                this._headerIcon = new sap.ui.core.Icon({
                    width: "30px"
                });
                diaHeader.addContentLeft(this._headerIcon);

                // Dialog Icon
                if (sap.n && sap.n.Launchpad && sap.n.Launchpad.contextType === "Tile" && sap.n.Launchpad.contextTile.TILE_ICON.indexOf("sap-icon://") === 0) {
                    this._headerIcon.setSrc(sap.n.Launchpad.contextTile.TILE_ICON);
                // } else {
                //     this._headerIcon.setSrc('sap-icon://document-text');
                }

                // Dialog Title
                this._headerTitle = new sap.m.Title({
                    titleStyle: "H6"
                });
                diaHeader.addContentLeft(this._headerTitle);

                // Minimize button
                this._butMinimize = new sap.m.Button({
                    icon: "sap-icon://minimize",
                    press: function(oEvent) {
                        dia.minimize(dia);
                    }
                });
                this._butMinimize.setTooltip(" ");
                diaHeader.addContentRight(this._butMinimize);

                // Mosaic button
                this._butMosaic = new sap.m.Button({
                    icon: "sap-icon://grid",
                    press: function(oEvent) {
                        dia.mosaic();
                    }
                });
                this._butMosaic.setTooltip(" ");
                diaHeader.addContentRight(this._butMosaic);


                // Maximize button
                this._butMaximize = new sap.m.Button({
                    icon: "sap-icon://full-screen",
                    press: function(oEvent) {
                        dia.maximize();
                    }
                });
                this._butMaximize.setTooltip(" ");
                diaHeader.addContentRight(this._butMaximize);

                this._butRestore = new sap.m.Button({ // Restore button
                    icon: "sap-icon://exit-full-screen",
                    visible: false,
                    press: function(oEvent) {
                        dia.restore();
                    }
                });
                this._butRestore.setTooltip(" ");
                diaHeader.addContentRight(this._butRestore);


                // Close button
                if (!this._dialogHideClose) {
                    this._butClose = new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function(oEvent) {
                            dia.close();
                        }
                    });
                    this._butClose.setTooltip(" ");
                    diaHeader.addContentRight(this._butClose);
                }

                setTimeout(function() {
                    dia._headerTitle.setText(dia.getTitle());
                }, 50);

                // Dialog Styling
                dia.addStyleClass("nepAppDialog sapUiNoContentPadding");
                dia.oPopup.setModal(AppCache.LoadOptions.dialogModal);
            },

            onBeforeRendering: function() {

                this._butClose.setVisible(!this.getHideClose());

                if (sap.n && sap.n.Launchpad) {
                    this._butMinimize.setVisible(!this.getHideMinimize());
                    this._butMosaic.setVisible(!this.getHideMosaic());
                    this._butMaximize.setVisible(!this.getHideMaximize());

                } else {
                    this._butMinimize.setVisible(false);
                    this._butMosaic.setVisible(false);
                    this._butMaximize.setVisible(false);
                }
            },

            // trigger beforeClose & afterClose event before closing
            close: function() {

                var that = this;
                var _handle = function() {
                    sap.m.Dialog.prototype.close.call(that);
                    return that;
                };

                if (sap.n && sap.n.Launchpad && sap.n.Application.beforeClose({
                    eventId: this._appGUID,
                    defaultAction: _handle,
                    closeType: "close"
                })) return;

                return _handle();
            },

            ondblclick: function(oEvent) {},

            onfocusin: function(oEvent) {
                try {
                    if (typeof this._viewContent !== "undefined" && AppCache.diaView.sId !== this._viewContent.sId) {
                        AppCache.diaView = this._viewContent;
                    }
                } catch (e) {
                    console.warn("nep.integration.Dialog => onfocusin: " + e.message);
                }
            },

            _getCSS: function(cssprop) {
                return $('#' + this.sId).css(cssprop);
            },

            _setCSS: function(cssprop, value) {
                $('#' + this.sId).css(cssprop, value);
            },

            maximize: function(event) {
                if (this.getContentIsURL()) {

                    var oDomRef = this.getDomRef();

                    // Store original values
                    this._origLeft = oDomRef.style.left;
                    this._origTop = oDomRef.style.top;
                    this._origWidth = oDomRef.style.width;
                    this._origHeight = oDomRef.style.height;

                    // Maximize
                    oDomRef.style.width = "100%";
                    oDomRef.style.height = "99%";

                    if (oDomRef.style.top.indexOf("%") > -1)
                        oDomRef.style.top = "50%";
                    else
                        oDomRef.style.top = "1px";

                    if (oDomRef.style.left.indexOf("%") > -1)
                        oDomRef.style.left = "50%";
                    else
                        oDomRef.style.left = "1px";

                    oDomRef.style['max-height'] = "94%";
                    oDomRef.style['max-width'] = "100%";

                } else {
                    this.setStretch(true);
                }

                this.$('cont').height('');

                if (this.getContentIsURL()) {
                    var dia = this;
                    this._butMaximize.mEventRegistry.press = [];
                    this._butMaximize.attachPress(function(oEvent) {
                        dia.restore();
                    });
                } else {
                    this._butMaximize.setVisible(false);
                    this.setHideMaximize(true);
                    this._butRestore.setVisible(true);
                }
            },

            unminimize: function(oControl) {

                var dia = this;

                AppCacheShellDialog.focus(); // IE11 looses focus
                oControl.destroy(); // Destroy toolbar button

                if (this.getContentIsURL()) {
                    this._setCSS('visibility', 'visible');
                } else {
                    this.setVisible(true);
                }

                if (AppCacheUserDialog.getButtons().length === 1) {
                    AppCacheShellDialog.setVisible(false);
                }

                if (sap.n && sap.n.Launchpad && sap.n.Apps[this._appGUID] && sap.n.Apps[this._appGUID].beforeDisplay) {
                    $.each(sap.n.Apps[this._appGUID].beforeDisplay, function(i, data) {
                        data(dia._startParams);
                    });
                }
            },

            onAfterRendering: function() {

                sap.m.Dialog.prototype.onAfterRendering.call(this);
                if (!this.getContentIsURL()) { // override CSS after rerender
                    this._setCSS('max-height', '95%');
                    this._setCSS('max-width', '98%');
                    this._setCSS('min-height', 'initial');
                    this._setCSS('min-width', 'initial');
                    this._setCSS('transform', '');
                }
                // const that = this;
                // setTimeout(function(){
                //     that.setDraggable(true);
                // }, 2000);
            },

            minimize: function() {

                var dia = this;

                var _handle = function() {

                    AppCacheShellDialog.setVisible(true);

                    // Add button to Top Shell Bar
                    AppCacheUserDialog.addButton(new sap.m.Button({
                        icon: dia._headerIcon.getSrc(),
                        text: dia._headerTitle.getText(),
                        press: function() {
                            dia.unminimize(this);
                        }
                    }));

                    if (dia.getContentIsURL()) {
                        dia._setCSS('visibility', 'hidden');
                    } else {
                        dia.setVisible(false);
                    }
                };

                if (sap.n && sap.n.Launchpad && sap.n.Application.beforeSuspend(sap.n.Application.event.minimize, {
                    defaultAction: _handle,
                    eventId: dia._appGUID
                })) return;

                _handle();
            },

            restore: function(event) {

                if (this.getContentIsURL()) {

                    this._setCSS('left', this._origLeft);
                    this._setCSS('top', this._origTop);
                    this._setCSS('width', this._origWidth);
                    this._setCSS('height', this._origHeight);

                } else {
                    this.setStretch(false);
                }
                this.$('cont').height('');

                if (this.getContentIsURL()) {
                    var dia = this;
                    this._butMaximize.mEventRegistry.press = [];
                    this._butMaximize.attachPress(function(oEvent) {
                        dia.maximize();
                    });
                } else {
                    this._butMaximize.setVisible(true);
                    this.setHideMaximize(false);
                    this._butRestore.setVisible(false);
                }
            },

            _isPrime: function(num) {
                for (var i = 2; i < num; i++) {
                    if (num % i === 0) {
                        return false;
                    }
                }
                return true;
            },

            _buildPrimesArray: function(max) {
                var arr = [2];
                for (var i = 3; i <= max; i += 2) {
                    if (this._isPrime(i)) {
                        arr.push(i);
                    }
                }
                return arr;
            },

            mosaic: function() {

                var diaArray = [];

                $.each(AppCache.Dialogs, function(i, data) {

                    var dia = sap.ui.getCore().byId(data);

                    if (dia.getVisible() && dia._getCSS('visibility') !== "hidden") {
                        diaArray.push(data);
                    }
                });

                if (diaArray.length <= 1) {
                    return;
                }

                // Calculate sections needed (prime numbers)
                var primesArray = this._buildPrimesArray(diaArray.length);
                var hsecs, vsecs;

                for (i = 0; i < primesArray.length; i++) {
                    var r = diaArray.length % primesArray[i];
                    if (r === 0) {
                        var div = diaArray.length / primesArray[i];

                        if (div >= primesArray[i]) {
                            hsecs = div;
                            vsecs = primesArray[i];
                        } else {
                            hsecs = primesArray[i];
                            vsecs = div;
                        }
                        i = primesArray.length + 1;
                    }
                }

                var eachSecWidth = Math.floor((window.innerWidth - 10) / hsecs);
                var eachSecHeight = Math.floor((window.innerHeight - 10) / vsecs) - 48;
                var eachSecWidthCSS = eachSecWidth + 'px';
                var eachSecHeightCSS = eachSecHeight + 'px';

                var currHsec = 1;
                var currVsec = 1;
                for (i = 0; i < diaArray.length; i++) {

                    var newTop = ((currVsec - 1) * eachSecHeight) + 4;
                    var newLeft = ((currHsec - 1) * eachSecWidth) + 5;

                    if (currVsec > 1)
                        newTop = newTop + 48;

                    var d = sap.ui.getCore().byId(diaArray[i]);

                    //remove the transform translate
                    d._bDisableRepositioning = true;
                    d._$dialog.addClass('sapDialogDisableTransition');
                    d._$dialog.addClass('sapMDialogTouched');

                    d._oManuallySetPosition = {
                        x: newLeft,
                        y: newTop
                    };

                    d._oManuallySetSize = {
                        height: eachSecHeightCSS,
                        width: eachSecWidthCSS
                    };

                    d._setCSS('top', newTop);
                    d._setCSS('left', newLeft);
                    d._setCSS('width', eachSecWidthCSS);
                    d._setCSS('height', eachSecHeightCSS);

                    d._setCSS('max-height', '95%');
                    d._setCSS('max-width', '98%');
                    d._setCSS('min-height', 'initial');
                    d._setCSS('min-width', 'initial');
                    d._setCSS('transform', '');

                    if (currHsec == hsecs) {
                        currVsec++;
                        currHsec = 1;
                    } else {
                        currHsec++;
                    }
                }
            },

            rerender: function() {
                if (!this.getContentIsURL()) {
                    sap.m.Dialog.prototype.rerender.call(this);
                }
            },

            renderer: {}
        });
    },

    RichTextEditor: function(config) {
        if (!sap || !sap.m) return;
        sap.m.FlexBox.extend("nep.integration.RichTextEditor", {
            metadata: {
                properties: {
                    border: {
                        type: "boolean",
                        defaultValue: true
                    },
                    editable: {
                        type: "boolean",
                        defaultValue: true
                    },
                    value: {
                        type: "string",
                        defaultValue: ""
                    },
                    // templates         :{type:"string" ,defaultValue:"[{\"name\":\"Template\",\"html\":\"<h2>Title</h2><p>Text</p>\"}]"},
                    templates: {
                        type: "string",
                        defaultValue: "%5B%7B%22name%22%3A%22Template%22%2C%22html%22%3A%22%3Ch2%3ETitle%3C%2Fh2%3E%3Cp%3EText%3C%2Fp%3E%22%7D%5D"
                    },
                    customFontList: {
                        type: "string",
                        defaultValue: ""
                    },
                    //defaults
                    defaultFont: {
                        type: "string",
                        defaultValue: "Verdana"
                    },
                    defaultFontSize: {
                        type: "string",
                        defaultValue: "14px"
                    },
                    defaultFontColor: {
                        type: "string",
                        defaultValue: "var(--sapTextColor)"
                    },
                    defaultFontWeight: {
                        type: "string",
                        defaultValue: ""
                    },
                    defaultTag: {
                        type: "string",
                        defaultValue: ""
                    },
                    //buttons => not supported (=> )textStyle, fullscreen, preview, print)
                    btnAlign: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnAudio: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnBold: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnCodeView: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnFont: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnFontColor: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnFontSize: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnFormatBlock: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnHiliteColor: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnHorizontalRule: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnImage: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnIndent: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnItalic: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnLineHeight: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnLink: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnList: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnOutdent: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnRedo: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnRemoveFormat: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnShowBlocks: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnTable: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnUnderline: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnUndo: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnVideo: {
                        type: "boolean",
                        defaultValue: true
                    },
                    btnMath: {
                        type: "boolean",
                        defaultValue: false
                    },
                    btnSave: {
                        type: "boolean",
                        defaultValue: false
                    },
                    btnStrike: {
                        type: "boolean",
                        defaultValue: false
                    },
                    btnSubscript: {
                        type: "boolean",
                        defaultValue: false
                    },
                    btnSuperscript: {
                        type: "boolean",
                        defaultValue: false
                    },
                    btnTemplate: {
                        type: "boolean",
                        defaultValue: false
                    },
                    //fonts
                    fontArial: {
                        type: "boolean",
                        defaultValue: true
                    },
                    fontGeorgia: {
                        type: "boolean",
                        defaultValue: true
                    },
                    fontImpact: {
                        type: "boolean",
                        defaultValue: true
                    },
                    fontHelvetica: {
                        type: "boolean",
                        defaultValue: true
                    },
                    fontTahoma: {
                        type: "boolean",
                        defaultValue: true
                    },
                    fontTimesNewRoman: {
                        type: "boolean",
                        defaultValue: true
                    },
                    fontVerdana: {
                        type: "boolean",
                        defaultValue: true
                    },
                },
                events: {
                    "change": {
                        allowPreventDefault: false,
                        parameters: {
                            "value": {
                                type: "string"
                            }
                        }
                    },
                    "callBackSave": {
                        allowPreventDefault: false,
                        parameters: {
                            "value": {
                                type: "string"
                            }
                        }
                    }
                }
            },
            renderer: function(oRm, oControl) {
                sap.m.FlexBoxRenderer.render(oRm, oControl);
            },
            init: function() {
                sap.m.FlexBox.prototype.init.call(this);
                this.attachChange(this.change);
                this.attachCallBackSave(this.callBackSave);
                var obj = this;
                var _handle = function() {
                    var id = obj.getId() + "-editor";
                    obj.addStyleClass("nepRichTextEditor ");

                    sap.ui.Device.resize.attachHandler(function(mParams) {
                        if (obj.editor) obj.editor.setHeight();
                    });

                    //rendering of the flexbox has already been done, adding this object will trigger rendring again => editor is created in the afterRendering event handler
                    obj.addItem(new sap.ui.core.HTML(obj.getId() + "-html", {}).setContent('<textarea id="' + id + '" style="display:none"></textarea>'));

                    var optionhistory = [];
                    var optionfont = [];
                    var optionstyle = [];
                    var optioncolor = [];
                    var optiondent = [];
                    var optionalign = [];
                    var optioncomplex = [];
                    var optiongeek = [];
                    var optionfile = [];

                    if (obj.getBtnAlign()) optionalign.push("align");
                    if (obj.getBtnAudio()) optioncomplex.push("audio");
                    if (obj.getBtnBold()) optionstyle.push("bold");
                    if (obj.getBtnCodeView()) optiongeek.push("codeView");
                    if (obj.getBtnFont()) optionfont.push("font");
                    if (obj.getBtnFontColor()) optioncolor.push("fontColor");
                    if (obj.getBtnFontSize()) optionfont.push("fontSize");
                    if (obj.getBtnFormatBlock()) optionfont.push("formatBlock");
                    if (obj.getBtnHiliteColor()) optioncolor.push("hiliteColor");
                    if (obj.getBtnHorizontalRule()) optionalign.push("horizontalRule");
                    if (obj.getBtnImage()) optioncomplex.push("image");
                    if (obj.getBtnIndent()) optiondent.push("indent");
                    if (obj.getBtnItalic()) optionstyle.push("italic");
                    if (obj.getBtnLineHeight()) optionalign.push("lineHeight");
                    if (obj.getBtnLink()) optioncomplex.push("link");
                    if (obj.getBtnList()) optionalign.push("list");
                    if (obj.getBtnOutdent()) optiondent.push("outdent");
                    if (obj.getBtnRedo()) optionhistory.push("redo");
                    if (obj.getBtnRemoveFormat()) optiongeek.push("removeFormat");
                    if (obj.getBtnShowBlocks()) optiongeek.push("showBlocks");
                    if (obj.getBtnTable()) optioncomplex.push("table");
                    if (obj.getBtnUnderline()) optionstyle.push("underline");
                    if (obj.getBtnUndo()) optionhistory.push("undo");
                    if (obj.getBtnVideo()) optioncomplex.push("video");
                    if (obj.getBtnMath()) optioncomplex.push("math");
                    if (obj.getBtnSave()) optionfile.push("save");
                    if (obj.getBtnStrike()) optionstyle.push("strike");
                    if (obj.getBtnSubscript()) optionstyle.push("subscript");
                    if (obj.getBtnSuperscript()) optionstyle.push("superscript");
                    if (obj.getBtnTemplate()) optionfile.push("template");

                    var buttonList = [];
                    if (optionhistory.length > 0) buttonList.push(optionhistory);
                    if (optionfont.length > 0) buttonList.push(optionfont);
                    if (optionstyle.length > 0) buttonList.push(optionstyle);
                    if (optioncolor.length > 0) buttonList.push(optioncolor);
                    if (optiondent.length > 0) buttonList.push(optiondent);
                    if (optionalign.length > 0) buttonList.push(optionalign);
                    if (optioncomplex.length > 0) buttonList.push(optioncomplex);
                    if (optiongeek.length > 0) buttonList.push(optiongeek);
                    if (optionfile.length > 0) buttonList.push(optionfile);

                    var defaultStyle = "font-family:" + obj.getDefaultFont() + ";font-size:" + obj.getDefaultFontSize() + ";color:" + obj.getDefaultFontColor() + ";";
                    if (!!obj.getDefaultFontWeight()) defaultStyle += "font-weight:" + obj.getDefaultFontWeight() + ";";
                    var font = [];
                    if (obj.getFontArial()) font.push("Arial");
                    if (obj.getFontGeorgia()) font.push("Georgia");
                    if (obj.getFontImpact()) font.push("Impact");
                    if (obj.getFontHelvetica()) font.push("Helvetica");
                    if (obj.getFontTahoma()) font.push("Tahoma");
                    if (obj.getFontTimesNewRoman()) font.push("Times New Roman");
                    if (obj.getFontVerdana()) font.push("Verdana");

                    var customFontList = (!!obj.getCustomFontList()) ? obj.getCustomFontList().split(",") : [];
                    $.each(customFontList, function(i, customFont) {
                        font.push(customFont.trim());
                    });
                    if (font.length === 0) font.push("Comic Sans MS");
                    font.sort();

                    let _obj_delegate = {
                        onAfterRendering: function() {

                            //UI5 is removing the editor when not in focus. The Sun Editor object will be created in DOM on each rerender. This editor object itself will be reused though.
                            var height = obj.getHeight() || "auto"; //getDomRef().offsetHeight - 250;
                            var editor = SUNEDITOR.create((document.getElementById(id) || id), {
                                width: "100%",
                                height: height,
                                resizingBar: false,
                                defaultStyle: defaultStyle,
                                templates: JSON.parse(decodeURIComponent(obj.getTemplates())),
                                defaultTag: obj.getDefaultTag() || "p",
                                value: obj.getValue(),
                                callBackSave: function() {
                                    obj.setValue(editor.getContents());
                                    obj.fireCallBackSave({
                                        value: obj.getValue()
                                    });
                                },
                                buttonList: buttonList,
                                font: font,
                                attributesWhitelist: {
                                    "all": "style",
                                    "img": "style|data-rotatey|data-rotatex|data-index"
                                }
                            });
                            editor.padding = 32;
                            var ix = 0;
                            editor.setHeight = function() {

                                ++ix;
                                var that = this;
                                if (!obj.getDomRef()) return;
                                var objHeight = obj.getDomRef().offsetHeight;
                                if (objHeight === 0) {
                                    if (ix < 50) {
                                        setTimeout(function() {
                                            //when running the Rich Text Editor in dialogs, the onAfterRendering is called several times
                                            that.setHeight();
                                        }, 10);
                                    }
                                }

                                var border = (obj.getBorder()) ? 2 : 0;
                                var toolbarHeight = $("#" + obj.getId() + " .se-toolbar.sun-editor-common").outerHeight();
                                // console.log(obj.getId() + ": " + objHeight +", " + toolbarHeight +", " + editor.padding +", " + border);

                                var height = objHeight - toolbarHeight - editor.padding - border;
                                $("#" + obj.getId() + " .se-wrapper-inner.se-wrapper-wysiwyg.sun-editor-editable").height(height);
                                $("#" + obj.getId() + " .se-wrapper-inner.se-wrapper-code").height(height + 22);
                            };
                            editor.onBlur = function(e, core) {
                                obj.setValue(editor.getContents());
                                obj.fireChange({
                                    value: obj.getValue()
                                });
                            };
                            if (obj.getEditable()) {
                                editor.enabled();
                            } else {
                                editor.disabled();
                            }
                            editor.getContext().defaultColorPickerColor = obj.getDefaultFontColor();

                            if (!obj.getBorder()) {
                                $("#" + obj.getId() + " .sun-editor").css("border", "none");
                            }

                            obj.editor = editor;

                            setTimeout(function() {
                                obj.editor.setHeight();
                            }, 1);
                        }
                    };
                    obj.addEventDelegate(_obj_delegate);
                    obj.exit = function() {
                        obj.removeEventDelegate(_obj_delegate);
                    };
                };

                if (typeof SUNEDITOR === "object") {

                    //SunEditor object has been loaded => create editor
                    _handle();

                } else {

                    //SunEditor object not loaded yet, add handle function to load queue, this allows multiple editors in the same UI area
                    neptune.UI5Objects.queue.RichTextEditor.push(_handle);
                    if (neptune.UI5Objects.queue.RichTextEditor.length > 1) {
                        return;
                    }
                    // var urlBase = "";
                    // try {
                    //     urlBase = cordova.file.applicationDirectory + "www";
                    // } catch (e) {}

                    //Load SunEditor files dynamically. If the main purpose of the application is a text editor, the files can be loaded in the HTML header
                    $.ajax({
                        type: "GET",
                        url: config.prefix + "/server/js/sun/suneditor.min.js?" + config.version,
                        success: function(data) {

                            //fire handle function for all editors in the UI area (normally only one, but those developers are some innovative bastards!)
                            $.each(neptune.UI5Objects.queue.RichTextEditor, function(i, handleFn) {
                                handleFn();
                            });
                            neptune.UI5Objects.queue.RichTextEditor = [];
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.error(errorThrown);
                        },
                        dataType: "script",
                        cache: true
                    });

                    $('<link/>', {
                        rel: 'stylesheet',
                        type: 'text/css',
                        href: config.prefix + '/server/css/sun/suneditor.css?' + config.version
                    }).appendTo('head');
                }
            },
            change: function(oEvent) {},
            callBackSave: function(oEvent) {}
        });
    },
    defineLibrary: function() {
        if (sap.ui.version.substr(0,4) === "1.38") return;
        sap.ui.getCore().initLibrary({
            name: "nep.ui",
            version: "1.0.0",
            dependencies: ["sap.ui.core"],
            noLibraryCSS: true,
            types: [
                    "nep.ui.Boolean",
                    "nep.ui.MessageBoxType",
                    "nep.ui.SortOrder",
                    "nep.ui.VizAlignment",
                    "nep.ui.ToolbarPosition",
                    "nep.ui.BarPosition",
                    "nep.ui.BarContentPosition",
                    "nep.ui.ModelSimpleLoad",
                    "nep.ui.ModelAdvancedLoad",
                    "nep.ui.TransitionName",
                    "nep.ui.SplitPagePosition",
                    "nep.ui.TextFormatters",
                    "nep.ui.FilterOperator",
                    "nep.ui.UnifiedShellItem",
                    "nep.ui.UnifiedShellHeadItem",
                    "nep.ui.GridSpacing",
                    "nep.ui.CacheType",
                    "nep.ui.BulletMicroChartPosition",
                    "nep.ui.StyleClassVisibility",
                    "nep.ui.FileUploaderStyle",
                    "nep.ui.FixFlexContent",
                    "nep.ui.ObjectPageSubSectionPosition",
                    "nep.ui.DynamicSideContentPosition",
                    "nep.ui.VizLegendMarkerShape",
                    "nep.ui.VizLegendGroupLayoutAlignment",
                    "nep.ui.VizPlotAreaDataLabelPosition",
                    "nep.ui.VizPlotAreaDataLabelType",
                    "nep.ui.VizUnitFormatType",
                    "nep.ui.VizAxisLabelAlignment",
                    "nep.ui.VizDataMeasureDefinition",
                    "nep.ui.VizDataDimensionDefinition",
                    "nep.ui.VizChartType",
                    "nep.ui.VizInteractionSelectabilityMode",
                    "nep.ui.VizInteractionZoomEnablement",
                    "nep.ui.NavigationListItemPosition",
                    "nep.ui.PlanningCalendarViewKey",
                    "nep.ui.StyleClassPadding",
                    "nep.ui.NumberFormatters",
                    "nep.ui.StyleClassMargin",
                    "nep.ui.VizDataType",
                    "nep.ui.StatusindicatorLibraryShape",
                    "nep.ui.InfoLabelColorScheme",
                    "nep.ui.TimeFormatters",
                    "nep.ui.DateFormatters",
                    "nep.ui.DateFormatTypes",
                    "nep.ui.MessageBoxType",
                    "nep.ui.AllowedSortDirections",
                    "nep.ui.FormRenderType",
                    "nep.ui.DynamicPageTitleContentPosition",
                    "nep.ui.FlexibleColumnLayoutContentPosition"
                ]
        });

        /**
         * Boolean
         *
         * @enum {boolean}
         * @public
         * @ui5-metamodel Value table 1
         */
        nep.ui.Boolean = {
            true: true,
            false: false
        };

        /**
         * VizAlignment
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 219
         */
        nep.ui.VizAlignment = {
            center: "center",
            left: "left",
            right: "right"
        };

        /**
         * ToolbarPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 255
         */
        nep.ui.ToolbarPosition = {
            HeaderToolbar: "HeaderToolbar",
            InfoToolbar: "InfoToolbar"
        };

        /**
         * BarPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 302
         */
        nep.ui.BarPosition = {
            addContent: "addContent",
            setCustomHeader: "setCustomHeader",
            setFooter: "setFooter",
            setSubHeader: "setSubHeader"
        };
        /**
         * BarContentPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 303
         */
        nep.ui.BarContentPosition = {
            ContentLeft: "ContentLeft",
            ContentMiddle: "ContentMiddle",
            ContentRight: "ContentRight"
        };
        /**
         * ModelSimpleLoad
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 298
         */
        nep.ui.ModelSimpleLoad = {
            online: "online"
        };
        /**
         * ModelAdvancedLoad
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 299
         */
        nep.ui.ModelAdvancedLoad = {
            cache: "cache",
            online: "online",
            onlineOnEmptyCache: "onlineOnEmptyCache"

        };
        /**
         * TransitionName
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 322
         */
        nep.ui.TransitionName = {
            fade: "fade",
            flip: "flip",
            show: "show",
            slide: "slide",
        };
        /**
         * SplitPagePosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 325
         */
        nep.ui.SplitPagePosition = {
            addDetailPage: "addDetailPage",
            addMasterPage: "addMasterPage"
        };
        /**
         * TextFormatters
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 339
         */
        nep.ui.TextFormatters = {
            date_BrowserSetting: "date:BrowserSetting",
            date_GYY_MM_dd_Japanese_Date_hyphen: "date:GYY-MM-dd (Japanese Date)",
            date_GYY_MM_dd_Japanese_Date_dot: "date:GYY.MM.dd (Japanese Date)",
            date_GYY_MM_dd_Japanese_Date_slash: "date:GYY/MM/dd (Japanese Date)",
            date_MM_dd_yyyy_hyphen: "date:MM-dd-yyyy",
            date_MM_dd_yyyy_dot: "date:MM.dd.yyyy",
            date_MM_dd_yyyy_slash: "date:MM/dd/yyyy",
            date_SAPUserDefault: "date:SAPUserDefault",
            date_SAPUserDefault_OData: "date:SAPUserDefault (OData)",
            date_YYYY_MM_dd_Iranian_Date: "date:YYYY/MM/dd (Iranian Date)",
            date_YYYY_MM_dd_Islamic_Date: "date:YYYY/MM/dd (Islamic Date)",
            date_dd_MM_yyyy_hyphen: "date:dd-MM-yyyy",
            date_dd_MM_yyyy_dot: "date:dd.MM.yyyy",
            date_dd_MM_yyyy_slash: "date:dd/MM/yyyy",
            date_yyyy_MM_dd_hyphen: "date:yyyy-MM-dd",
            date_yyyy_MM_dd_dot: "date:yyyy.MM.dd",
            date_yyyy_MM_dd_slash: "date:yyyy/MM/dd",
            number_BrowserSetting: "number:BrowserSetting",
            number_Decimals0: "number:Decimals0",
            number_Decimals1Comma: "number:Decimals1Comma",
            number_Decimals1Point: "number:Decimals1Point",
            number_Decimals2Comma: "number:Decimals2Comma",
            number_Decimals2Point: "number:Decimals2Point",
            number_Decimals3Comma: "number:Decimals3Comma",
            number_Decimals3Point: "number:Decimals3Point",
            number_SAPUserDefault: "number:SAPUserDefault",
            number_SAPUserDefault_Decimals0: "number:SAPUserDefault:Decimals0",
            number_SAPUserDefault_Decimals1: "number:SAPUserDefault:Decimals1",
            number_SAPUserDefault_Decimals2: "number:SAPUserDefault:Decimals2",
            number_SAPUserDefault_Decimals3: "number:SAPUserDefault:Decimals3",
            string_LowerCase: "string:LowerCase",
            string_RemoveLeadingZero: "string:RemoveLeadingZero",
            string_UpperCase: "string:UpperCase",
            time_BrowserSetting: "time:BrowserSetting",
            time_HH: "time:HH",
            time_HH_mm: "time:HH:mm",
            time_HH_mm_ss: "time:HH:mm:ss",
            time_SAPUserDefault_Long: "time:SAPUserDefault:Long",
            time_SAPUserDefault_Medium: "time:SAPUserDefault:Medium",
            time_SAPUserDefault_Short: "time:SAPUserDefault:Short",
            time_hh_a: "time:hh a",
            time_hh_mm_a: "time:hh:mm a",
            time_hh_mm_ss_a: "time:hh:mm:ss a"
        };
        /**
         * FilterOperator
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 342
         */
        nep.ui.FilterOperator = {
            BT: "BT",
            Contains: "Contains",
            EQ: "EQ",
            EndsWith: "EndsWith",
            GE: "GE",
            GT: "GT",
            LE: "LE",
            LT: "LT",
            NE: "NE",
            StartsWith: "StartsWith"
        };
        /**
         * UnifiedShellItem
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 343
         */
        nep.ui.UnifiedShellItem = {
            addContent: "addContent",
            addCurtainContent: "addCurtainContent",
            addCurtainPaneContent: "addCurtainPaneContent",
            addPaneContent: "addPaneContent",
            setSearch: "setSearch"
        };
        /**
         * UnifiedShellHeadItem
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 343
         */
        nep.ui.UnifiedShellHeadItem = {
            addHeadEndItem: "addHeadEndItem",
            addHeadItem: "addHeadItem"
        };
        /**
         * GridSpacing
         *
         * @enum {float}
         * @public
         * @ui5-metamodel Value table 347
         */
        nep.ui.GridSpacing = {
            GridSpacing0: 0,
            GridSpacing05: 0.5,
            GridSpacing1: 1,
            GridSpacing2: 2
        };
        /**
         * CacheType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 349
         */
        nep.ui.CacheType = {
            IndexedDB: "IndexedDB",
            LocalStorage: "LocalStorage",
            WebSQL: "WebSQL"
        };
        /**
         * BulletMicroChartPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 368
         */
        nep.ui.BulletMicroChartPosition = {
            addThreshold: "addThreshold",
            setActual: "setActual"
        };
        /**
         * StyleClassVisibility
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 371
         */
        nep.ui.StyleClassVisibility = {
            sapUiHideOnDesktop: "sapUiHideOnDesktop",
            sapUiHideOnPhone: "sapUiHideOnPhone",
            sapUiHideOnTablet: "sapUiHideOnTablet",
            sapUiVisibleOnlyOnDesktop: "sapUiVisibleOnlyOnDesktop",
            sapUiVisibleOnlyOnPhone: "sapUiVisibleOnlyOnPhone",
            sapUiVisibleOnlyOnTablet: "sapUiVisibleOnlyOnTablet"
        };

        /**
         * FileUploaderStyle
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 371
         */
        nep.ui.FileUploaderStyle = {
            Accept: "Accept",
            Emphasized: "Emphasized",
            Reject: "Reject",
            Transparent: "Transparent"
        };

        /**
         * FixFlexContent
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 376
         */
        nep.ui.FixFlexContent = {
            addFixContent: "addFixContent",
            setFlexContent: "setFlexContent"
        };

        /**
         * SubSectionPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 385
         */
        nep.ui.ObjectPageSubSectionPosition = {
            Action: "Action",
            Block: "Block",
            MoreBlock: "MoreBlock"
        };

        /**
         * SubSectionPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 389
         */
        nep.ui.DynamicSideContentPosition = {
            MainContent: "MainContent",
            SideContent: "SideContent"
        };



        /**
         * VizLegendMarkerShape
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 396
         */
        nep.ui.VizLegendMarkerShape = {
            rectangle: "rectangle",
            square: "square",
            squareWithRadius: "squareWithRadius"
        };
        /**
         * VizLegendGroupLayoutAlignment
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 397
         */
        nep.ui.VizLegendGroupLayoutAlignment = {
            center: "center",
            topLeft: "topLeft"
        };
        /**
         * VizPlotAreaDataLabelPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 398
         */
        nep.ui.VizPlotAreaDataLabelPosition = {
            inside: "inside",
            outside: "outside",
            outsideFirst: "outsideFirst"
        };
        /**
         * VizPlotAreaDataLabelType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 399
         */
        nep.ui.VizPlotAreaDataLabelType = {
            color: "color",
            value: "value",
            valueAndColor: "valueAndColor"
        };
        /**
         * VizUnitFormatType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 400
         */
        nep.ui.VizUnitFormatType = {
            FinancialUnits: "FinancialUnits",
            MetricUnits: "MetricUnits"
        };
        /**
         * VizAxisLabelAlignment
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 401
         */
        nep.ui.VizAxisLabelAlignment = {
            center: "center",
            top: "top"
        };
        /**
         * VizDataMeasureDefinition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 402
         */
        nep.ui.VizDataMeasureDefinition = {
            actualValues: "actualValues",
            additionalValues: "additionalValues",
            bubbleWidth: "bubbleWidth",
            color: "color",
            forecastValues: "forecastValues",
            size: "size",
            targetValues: "targetValues",
            valueAxis: "valueAxis",
            valueAxis2: "valueAxis2"
        };
        /**
         * VizDataDimensionDefinition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 403
         */
        nep.ui.VizDataDimensionDefinition = {
            categoryAxis: "categoryAxis",
            categoryAxis2: "categoryAxis2",
            color: "color",
            shape: "shape",
            timeAxis: "timeAxis"
        };
        /**
         * VizChartType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 404
         */
        nep.ui.VizChartType = {
            dual_stacked_bar_100: "100_dual_stacked_bar",
            dual_stacked_column_100: "100_dual_stacked_column",
            stacked_bar_100: "100_stacked_bar",
            stacked_column_100: "100_stacked_column",
            bar: "bar",
            bubble: "bubble",
            bullet: "bullet",
            column: "column",
            combination: "combination",
            donut: "donut",
            dual_bar: "dual_bar",
            dual_column: "dual_column",
            dual_combination: "dual_combination",
            dual_horizontal_combination: "dual_horizontal_combination",
            dual_horizontal_stacked_combination: "dual_horizontal_stacked_combination",
            dual_line: "dual_line",
            dual_stacked_bar: "dual_stacked_bar",
            dual_stacked_column: "dual_stacked_column",
            dual_stacked_combination: "dual_stacked_combination",
            heatmap: "heatmap",
            horizontal_stacked_combination: "horizontal_stacked_combination",
            horizontal_waterfall: "horizontal_waterfall",
            line: "line",
            pie: "pie",
            scatter: "scatter",
            stacked_bar: "stacked_bar",
            stacked_column: "stacked_column",
            stacked_combination: "stacked_combination",
            time_bubble: "time_bubble",
            time_bullet: "time_bullet",
            timeseries_100_stacked_column: "timeseries_100_stacked_column",
            timeseries_bubble: "timeseries_bubble",
            timeseries_bullet: "timeseries_bullet",
            timeseries_column: "timeseries_column",
            timeseries_line: "timeseries_line",
            timeseries_scatter: "timeseries_scatter",
            timeseries_stacked_column: "timeseries_stacked_column",
            timeseries_waterfall: "timeseries_waterfall",
            vertical_bullet: "vertical_bullet",
            waterfall: "waterfall"
        };

        /**
         * VizInteractionSelectabilityMode
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 405
         */
        nep.ui.VizInteractionSelectabilityMode = {
            EXCLUSIVE: "EXCLUSIVE",
            INCLUSIVE: "INCLUSIVE",
            MULTIPLE: "MULTIPLE",
            NONE: "NONE",
            SINGLE: "SINGLE"
        };

        /**
         * VizInteractionZoomEnablement
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 406
         */
        nep.ui.VizInteractionZoomEnablement = {
            auto: "auto",
            disabled: "disabled",
            enabled: "enabled"
        };

        /**
         * NavigationListItemPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 410
         */
        nep.ui.NavigationListItemPosition = {
            setFixedItem: "setFixedItem",
            setFooter: "setFooter",
            setItem: "setItem"
        };

        /**
         * PlanningCalendarViewKey
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 411
         */
        nep.ui.PlanningCalendarViewKey = {
            Day: "Day",
            Hour: "Hour",
            Month: "Month",
            OneMonth: "One Month",
            Week: "Week"
        };

        /**
         * StyleClassPadding
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 415
         */
        nep.ui.StyleClassPadding = {
            sapUiContentPadding: "sapUiContentPadding",
            sapUiNoContentPadding: "sapUiNoContentPadding",
            sapUiResponsiveContentPadding: "sapUiResponsiveContentPadding"
        };

        /**
         * StyleClassMargin
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 416
         */
        nep.ui.StyleClassMargin = {
            sapUiForceWidthAuto: "sapUiForceWidthAuto",
            sapUiLargeMargin: "sapUiLargeMargin",
            sapUiLargeMarginBegin: "sapUiLargeMarginBegin",
            sapUiLargeMarginBeginEnd: "sapUiLargeMarginBeginEnd",
            sapUiLargeMarginBottom: "sapUiLargeMarginBottom",
            sapUiLargeMarginEnd: "sapUiLargeMarginEnd",
            sapUiLargeMarginTop: "sapUiLargeMarginTop",
            sapUiLargeMarginTopBottom: "sapUiLargeMarginTopBottom",
            sapUiMediumMargin: "sapUiMediumMargin",
            sapUiMediumMarginBegin: "sapUiMediumMarginBegin",
            sapUiMediumMarginBeginEnd: "sapUiMediumMarginBeginEnd",
            sapUiMediumMarginBottom: "sapUiMediumMarginBottom",
            sapUiMediumMarginEnd: "sapUiMediumMarginEnd",
            sapUiMediumMarginTop: "sapUiMediumMarginTop",
            sapUiMediumMarginTopBottom: "sapUiMediumMarginTopBottom",
            sapUiNoMargin: "sapUiNoMargin",
            sapUiNoMarginBegin: "sapUiNoMarginBegin",
            sapUiNoMarginBottom: "sapUiNoMarginBottom",
            sapUiNoMarginEnd: "sapUiNoMarginEnd",
            sapUiNoMarginTop: "sapUiNoMarginTop",
            sapUiResponsiveMargin: "sapUiResponsiveMargin",
            sapUiSmallMargin: "sapUiSmallMargin",
            sapUiSmallMarginBegin: "sapUiSmallMarginBegin",
            sapUiSmallMarginBeginEnd: "sapUiSmallMarginBeginEnd",
            sapUiSmallMarginBottom: "sapUiSmallMarginBottom",
            sapUiSmallMarginEnd: "sapUiSmallMarginEnd",
            sapUiSmallMarginTop: "sapUiSmallMarginTop",
            sapUiSmallMarginTopBottom: "sapUiSmallMarginTopBottom",
            sapUiTinyMargin: "sapUiTinyMargin",
            sapUiTinyMarginBegin: "sapUiTinyMarginBegin",
            sapUiTinyMarginBeginEnd: "sapUiTinyMarginBeginEnd",
            sapUiTinyMarginBottom: "sapUiTinyMarginBottom",
            sapUiTinyMarginEnd: "sapUiTinyMarginEnd",
            sapUiTinyMarginTop: "sapUiTinyMarginTop",
            sapUiTinyMarginTopBottom: "sapUiTinyMarginTopBottom"
        };
        /**
         * NumberFormatters
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 420
         */
        nep.ui.NumberFormatters = {
            BrowserSetting: "number:BrowserSetting",
            Decimals0: "number:Decimals0",
            Decimals1Comma: "number:Decimals1Comma",
            Decimals1Point: "number:Decimals1Point",
            Decimals2Comma: "number:Decimals2Comma",
            Decimals2Point: "number:Decimals2Point",
            Decimals3Comma: "number:Decimals3Comma",
            Decimals3Point: "number:Decimals3Point",
            SAPUserDefault: "number:SAPUserDefault",
            SAPUserDefault_Decimals0: "number:SAPUserDefault:Decimals0",
            SAPUserDefault_Decimals1: "number:SAPUserDefault:Decimals1",
            SAPUserDefault_Decimals2: "number:SAPUserDefault:Decimals2",
            SAPUserDefault_Decimals3: "number:SAPUserDefault:Decimals3"
        };
        /**
         * VizDataType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 424
         */
        nep.ui.VizDataType = {
            date: "date",
            number: "number",
            string: "string"
        };

        /**
         * StatusindicatorLibraryShape
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 469
         */
        nep.ui.StatusindicatorLibraryShape = {
            arrow_down: "arrow_down",
            arrow_left: "arrow_left",
            arrow_right: "arrow_right",
            arrow_up: "arrow_up",
            attention_1: "attention_1",
            attention_2: "attention_2",
            building: "building",
            bulb: "bulb",
            bull: "bull",
            calendar: "calendar",
            car: "car",
            cart: "cart",
            cereals: "cereals",
            circle: "circle",
            clock: "clock",
            cloud: "cloud",
            conveyor: "conveyor",
            desk: "desk",
            document: "document",
            documents: "documents",
            dollar: "dollar",
            donut: "donut",
            drop: "drop",
            envelope: "envelope",
            euro: "euro",
            factory: "factory",
            female: "female",
            fish: "fish",
            flag: "flag",
            folder_1: "folder_1",
            folder_2: "folder_2",
            gear: "gear",
            heart: "heart",
            honey: "honey",
            house: "house",
            information: "information",
            letter: "letter",
            lung: "lung",
            machine: "machine",
            male: "male",
            pen: "pen",
            person: "person",
            pin: "pin",
            plane: "plane",
            printer: "printer",
            progress: "progress",
            question: "question",
            robot: "robot",
            sandclock: "sandclock",
            speed: "speed",
            stomach: "stomach",
            success: "success",
            tank_diesel: "tank_diesel",
            tank_lpg: "tank_lpg",
            thermo: "thermo",
            tool: "tool",
            transfusion: "transfusion",
            travel: "travel",
            turnip: "turnip",
            vehicle_construction: "vehicle_construction",
            vehicle_tank: "vehicle_tank",
            vehicle_tractor: "vehicle_tractor",
            vehicle_truck_1: "vehicle_truck_1",
            vehicle_truck_2: "vehicle_truck_2",
            vehicle_truck_3: "vehicle_truck_3",
            warehouse: "warehouse"
        };

        /**
         * InfoLabelColorScheme
         *
         * @enum {int}
         * @public
         * @ui5-metamodel Value table 471
         */
        nep.ui.InfoLabelColorScheme = {
            colorScheme1: 1,
            colorScheme2: 2,
            colorScheme3: 3,
            colorScheme4: 4,
            colorScheme5: 5,
            colorScheme6: 6,
            colorScheme7: 7,
            colorScheme8: 8,
            colorScheme9: 9,
            colorScheme10: 10
        };
        /**
         * TimeFormatters
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 475
         */
        nep.ui.TimeFormatters = {
            BrowserSetting: "BrowserSetting",
            HH: "HH",
            HH_mm: "HH:mm",
            HH_mm_ss: "HH:mm:ss",
            hh_a: "hh a",
            hh_mm_a: "hh:mm a",
            hh_mm_ss_a: "hh:mm:ss a",
            SAPUserDefault_Long: "time:SAPUserDefault:Long",
            SAPUserDefault_Medium: "time:SAPUserDefault:Medium",
            SAPUserDefault_Short: "time:SAPUserDefault:Short"
        };
        /**
         * DateFormatters
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 476
         */
        nep.ui.DateFormatters = {
            BrowserSetting: "date:BrowserSetting",
            GYY_MM_dd_Japanese_Date_hyphen: "date:GYY-MM-dd (Japanese Date)",
            GYY_MM_dd_Japanese_Date_dot: "date:GYY.MM.dd (Japanese Date)",
            GYY_MM_dd_Japanese_Date_slash: "date:GYY/MM/dd (Japanese Date)",
            MM_dd_yyyy_hyphen: "date:MM-dd-yyyy",
            MM_dd_yyyy_dot: "date:MM.dd.yyyy",
            MM_dd_yyyy_slash: "date:MM/dd/yyyy",
            SAPUserDefault: "date:SAPUserDefault",
            SAPUserDefault_OData: "date:SAPUserDefault (OData)",
            YYYY_MM_dd_Iranian_Date: "date:YYYY/MM/dd (Iranian Date)",
            YYYY_MM_dd_Islamic_Date: "date:YYYY/MM/dd (Islamic Date)",
            dd_MM_yyyy_hyphen: "date:dd-MM-yyyy",
            dd_MM_yyyy_dot: "date:dd.MM.yyyy",
            dd_MM_yyyy_slash: "date:dd/MM/yyyy",
            yyyy_MM_dd_hyphen: "date:yyyy-MM-dd",
            yyyy_MM_dd_dot: "date:yyyy.MM.dd",
            yyyy_MM_dd_slash: "date:yyyy/MM/dd"
        };
        /**
         * DateFormatTypes
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 477
         */
        nep.ui.DateFormatTypes = {
            Buddhist: "Buddhist",
            Gregorian: "Gregorian",
            Islamic: "Islamic",
            Japanese: "Japanese",
            Persian: "Persian",
            SAPUserDefault: "calendar:SAPUserDefault"
        };
        /**
         * MessageBoxType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 480
         */
        nep.ui.MessageBoxType = {
            alert: "alert",
            confirm: "confirm",
            error: "error",
            information: "information",
            show: "show",
            success: "success",
            warning: "warning"
        };

        /**
         * AllowedSortDirections
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 481
         */
        nep.ui.AllowedSortDirections = {
            Ascending: "Ascending",
            Both: "Both",
            Descending: "Descending",
            None: "None"
        };

        /**
         * FormRenderType
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 482
         */
        nep.ui.FormRenderType = {
            Div: "Div",
            Form: "Form"
        };

        /**
         * DynamicPageTitleContentPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 849
         */
        nep.ui.DynamicPageTitleContentPosition = {
            addAction: "addAction",
            addContent: "addContent",
            addExpandedContent: "addExpandedContent",
            addNavigationAction: "addNavigationAction",
            addSnappedContent: "addSnappedContent",
            setBreadcrumbs: "setBreadcrumbs",
            setExpandedHeading: "setExpandedHeading",
            setHeading: "setHeading",
            setSnappedHeading: "setSnappedHeading",
            setSnappedTitleOnMobile: "setSnappedTitleOnMobile"
        };

        /**
         * FlexibleColumnLayoutContentPosition
         *
         * @enum {string}
         * @public
         * @ui5-metamodel Value table 851
         */
        nep.ui.FlexibleColumnLayoutContentPosition = {
            addBeginColumnPage: "addBeginColumnPage",
            addEndColumnPage: "addEndColumnPage",
            addMidColumnPage: "addMidColumnPage"
        };
    }
};
