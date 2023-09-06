neptune.Style = {

    emptyGuid: "00000000000000000000000000000000",

    getLogonBackground: function(config) {

        var css = this.getBackground(config, {
            backColor: config.layout.BACK_LOGON_CLR,
            backOpacity: config.layout.BACK_LOGON_OPA,
            backImage: config.layout.BACK_LOGON_IMG,
            backPlacement: config.layout.BACK_LOGON_PLA,
            backRepeat: config.layout.BACK_LOGON_REP,
            backSize: config.layout.BACK_LOGON_SIZ,
            backImage2: config.layout.BACK_LOGON_IMG2,
            backPlacement2: config.layout.BACK_LOGON_PLA2,
            backRepeat2: config.layout.BACK_LOGON_REP2,
            backSize2: config.layout.BACK_LOGON_SIZ2,
            backImage3: config.layout.BACK_LOGON_IMG3,
            backPlacement3: config.layout.BACK_LOGON_PLA3,
            backRepeat3: config.layout.BACK_LOGON_REP3,
            backSize3: config.layout.BACK_LOGON_SIZ3
        }, ".nepLogon .nepLaunchpadShell");

        // Logon Area Background Color
        if (config.layout.MOB_BACK_COLOR) {
            css += ".nepLogonLayout{background:" + config.layout.MOB_BACK_COLOR + ";}";
            css += ".nepLogonLayout .nepNavBarContainer{border-color:" + config.layout.MOB_BACK_COLOR + ";}";
        }
        if (config.layout.MOB_BACK_BLUR) {
            css += ".nepLogonLayout{backdrop-filter:blur(" + config.layout.MOB_BACK_BLUR + ");}";
            css += ".nepLogonLayout{-webkit-backdrop-filter:blur(" + config.layout.MOB_BACK_BLUR + ");}";
        }

        return css;
    },

    getLaunchpadBackground: function(config) {

        var css = this.getBackground(config, {
            backColor: config.layout.SHELL_BACK_COLOR,
            backOpacity: config.layout.BACK_OPA,
            backImage: config.layout.PAGE_BACK_IMAGE,
            backPlacement: config.layout.BACK_IMG_PLACE,
            backRepeat: config.layout.BACK_IMG_REPEA,
            backSize: config.layout.BACK_IMG_SIZE,
            backImage2: config.layout.BACK_IMG2,
            backPlacement2: config.layout.BACK_IMG_PLACE2,
            backRepeat2: config.layout.BACK_IMG_REPEA2,
            backSize2: config.layout.BACK_IMG_SIZE2,
            backImage3: config.layout.BACK_IMG3,
            backPlacement3: config.layout.BACK_IMG_PLACE3,
            backRepeat3: config.layout.BACK_IMG_REPEA3,
            backSize3: config.layout.BACK_IMG_SIZE3,
            pageBackColor: config.layout.PAGE_BACK_COLOR,
            pageBackBlur: config.layout.PAGE_BACK_BLUR
        }, ".nepLaunchpadShell");


        // Launchpad Background Color
        if (config.layout.PAGE_BACK_COLOR) {
            css += ".nepNavBarPage.sapMPageBgStandard{background:" + config.layout.PAGE_BACK_COLOR + ";}";
            css += ".nepNavBarPage.sapMPageBgSolid{background:" + config.layout.PAGE_BACK_COLOR + ";}";
            css += ".nepPage.sapMPageBgStandard{background:" + config.layout.PAGE_BACK_COLOR + ";}";
            css += ".nepPage.sapMPageBgSolid{background:" + config.layout.PAGE_BACK_COLOR + ";}";
        }
        if (config.layout.PAGE_BACK_BLUR) {
            css += ".sapMPageBgStandard.nepPage{backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgStandard.nepPage{-webkit-backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgSolid.nepPage{backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgSolid.nepPage{-webkit-backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgStandard.nepNavBarPage{backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgStandard.nepNavBarPage{-webkit-backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgSolid.nepNavBarPage{backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
            css += ".sapMPageBgSolid.nepNavBarPage{-webkit-backdrop-filter:blur(" + config.layout.PAGE_BACK_BLUR + ");}";
        }
        return css;
    },

    getBackground: function(config, backgroundLayout, shellClass) {
        var css = "";
        var mediaUrl = config.mediaUrl || "";
        var imageUrl = config.imageUrl || "";
        var isMobile = config.isMobile;
        var imageData = config.imageData;
		var isHCP = config.isHCP;
		var tileLayoutData = config.tileLayoutData;

        if (!!backgroundLayout.backColor) css += shellClass + " > .sapUiGlobalBackgroundImage{background:" + backgroundLayout.backColor + ";}";

        if (backgroundLayout.backImage === "None") {
            css += shellClass + " > .sapUiGlobalBackgroundImage {";
            css += "background-image:none;";
            css += "}";

        } else if (!!backgroundLayout.backImage) {
            
            var backgroundImage;
            if (backgroundLayout.backImage.indexOf("NEPTUNE") === 0) {                
                backgroundImage = imageUrl + backgroundLayout.backImage + ".jpg";

            } else {
                backgroundImage = mediaUrl + backgroundLayout.backImage;                
            }
            if (isMobile || isHCP) backgroundImage = imageData[backgroundLayout.backImage] || backgroundImage;

            var backgroundImageUrl = "url('" + backgroundImage + "')";
            var imageRepeat = backgroundLayout.backRepeat || "no-repeat";
            var imageSize = backgroundLayout.backSize || "cover";
            var imagePosition = backgroundLayout.backPlacement || "center";
            var backgroundOpacity = backgroundLayout.backOpacity || "1";

            if (backgroundLayout.backImage2) {
                var backgroundImageUrl2 = mediaUrl + backgroundLayout.backImage2;
                if (isMobile || isHCP) {
                    backgroundImageUrl2 = imageData[backgroundLayout.backImage2] || backgroundImageUrl2;
                }
                var imageRepeat2 = backgroundLayout.backRepeat2 || "no-repeat";
                var imageSize2 = backgroundLayout.backSize2 || "cover";
                var imagePosition2 = backgroundLayout.backPlacement2 || "center";

                backgroundImageUrl += ",url('" + backgroundImageUrl2 + "')";
                imageRepeat += ", " + imageRepeat2;
                imageSize += ", " + imageSize2;
                imagePosition += ", " + imagePosition2;

                if (backgroundLayout.backImage3) {
                    var backgroundImageUrl3 = mediaUrl + backgroundLayout.backImage3;
                    if (isMobile || isHCP) {
                        backgroundImageUrl3 = imageData[backgroundLayout.backImage3] || backgroundImageUrl3;
                    }
                    var imageRepeat3 = backgroundLayout.backRepeat3 || "no-repeat";
                    var imageSize3 = backgroundLayout.backSize3 || "cover";
                    var imagePosition3 = backgroundLayout.backPlacement3 || "center";

                    backgroundImageUrl += ",url('" + backgroundImageUrl3 + "')";
                    imageRepeat += ", " + imageRepeat3;
                    imageSize += ", " + imageSize3;
                    imagePosition += ", " + imagePosition3;
                }
            }

            css += shellClass + " > .sapUiGlobalBackgroundImage {";
            css += "background-image:" + backgroundImageUrl + ";";
            css += "opacity:" + backgroundOpacity + ";";
            css += "background-repeat:" + imageRepeat + ";";
            css += "background-size:" + imageSize + ";";
            css += "background-position:" + imagePosition + ";";
            css += "}";
        }
        return css;
    },

    getLayoutCss: function(config) {

        var layout = config.layout;
        var mediaUrl = config.mediaUrl || "";
        var isMobile = config.isMobile;
        var imageData = config.imageData;
		var isHCP = config.isHCP;
		var tileLayoutData = config.tileLayoutData;
        var launchpadFavicon = config.favicon || "";
		
        var css = "";
        var root = "";
        var logonRoot = "";

        // Shell Header
        if (layout.TOP_BACK_COLOR) root += "--sapShellColor: " + layout.TOP_BACK_COLOR + ";";
        if (layout.TOP_BOR_COLOR) root += "--nepShell_BorderColor: " + layout.TOP_BOR_COLOR + ";";
        if (layout.TOP_TXT_COLOR) root += "--sapShell_TextColor: " + layout.TOP_TXT_COLOR + ";";
        if (layout.TOP_HOV_COLOR) root += "--sapShell_InteractiveTextColor: " + layout.TOP_HOV_COLOR + ";";
        if (layout.TOP_ACT_COLOR) root += "--sapShell_InteractiveBorderColor: " + layout.TOP_ACT_COLOR + ";";
        if (layout.TOP_NOTIF_BACK) root += "--sapContent_BadgeBackground: " + layout.TOP_NOTIF_BACK + ";";

        // Shell Navigation
        if (layout.NAV_BACK_COLOR) root += "--sapShell_Navigation_Background: " + layout.NAV_BACK_COLOR + ";";
        if (layout.NAV_BOR_COLOR) root += "--sapShell_BorderColor: " + layout.NAV_BOR_COLOR + ";";
        if (layout.NAV_TXT_COLOR) root += "--sapShell_Navigation_TextColor: " + layout.NAV_TXT_COLOR + ";";
        if (layout.NAV_HOV_COLOR) root += "--sapShell_Navigation_SelectedColor: " + layout.NAV_HOV_COLOR + ";";

        // Shell
        css += this.getLaunchpadBackground(config);
        css += this.getLogonBackground(config);

        // Application Background Color
        if (layout.APP_BACK_COLOR) {
            root += "--sapBackgroundColor: " + layout.APP_BACK_COLOR + ";";
        }
        if (layout.APP_BACK_BLUR) {
            css += ".sapMPageBgStandard:not(.nepPage):not(.nepNavBarPage){backdrop-filter:blur(" + layout.APP_BACK_BLUR + ");}";
            css += ".sapMPageBgStandard:not(.nepPage):not(.nepNavBarPage){-webkit-backdrop-filter:blur(" + layout.APP_BACK_BLUR + ");}";
            css += ".sapMPageBgSolid{backdrop-filter:blur(" + layout.APP_BACK_BLUR + ");}";
            css += ".sapMPageBgSolid{-webkit-backdrop-filter:blur(" + layout.APP_BACK_BLUR + ");}";
        }

        // Scrollbar
        if (layout.SCROLL_COLOR) {
            root += "--sapScrollBar_FaceColor: " + layout.SCROLL_COLOR + ";";
        }
        if (layout.SCROLL_TRACK) {
            root += "--sapScrollBar_TrackColor: " + layout.SCROLL_TRACK + ";";
        }
        if (layout.SCROLL_WIDTH === "thin") {
            root += "--sapScrollBar_Dimension: 6px;";
            css += "html.sap-desktop ::-webkit-scrollbar {width:6px !important; height:6px !important;}";
            css += ".nepPage > .sapMPageEnableScrolling {scrollbar-width: thin;}";
        }

        // Tile Group
        if (layout.HEAD_COLOR) css += ".nepCatPanel{background:" + layout.HEAD_COLOR + ";}";
        if (layout.HEAD_BORDER_CLR) {
            var borderWidth = layout.HEAD_BORDER_WDT || "3px";
            css += ".nepCatPanel{border-bottom: " + borderWidth + " solid " + layout.HEAD_BORDER_CLR + ";}";
        }
        if (layout.TITLE_COLOR) root += "--sapShell_GroupTitleTextColor: " + layout.TITLE_COLOR + ";";
        if (layout.SUBTITLE_COLOR) root += "--nepShell_GroupSubTitleTextColor: " + layout.SUBTITLE_COLOR + ";";

        var faviconUrl = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAm1QTFRFAAAA9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9awc9a0f9bAm9a8k9a0e9awb9rQy+cx0++Cr/Oa7/OW5+9ud+MNb975O/Oa8/OnC+tSK+Mls+cxz/e3P+9qa9rQw97pD/erG+tqZ9rU19a0g/Oi/+9ye9rAo9a4j+92i+9+o9rEq97xI/ezM+Mho/e3O979R9awd+tWM++Kv+Mdl/Oe+9rIt+MFW/OrG+ctx/OO09a8l97tG/evJ97g9+MVg9rMw+MRc/OrE9rg9+tmX+96m9a4h+tiU/OS29rQz+MJY/e7P9rY39rAn+tSL+9+m/e3N+9+n+tWL+teS+tGB+taP+96l+dB+97tE////XUwUjQAAAH90Uk5TAAAEHUh5maWjk248FQIJOYfE5/X8/vvy4rh0KQUDMJb51XweAV7T+LxADHjr2VR38N5QXOo2LdD9rAiS82I14L4YgfEawQZD5cMb9OOX70mkVphKduQ3RsUcB4XCZzHUsRft2DsLflcPgO5bZvqe6NuEI0GOzPa/JFJ/naindfyaMoUAAAABYktHRM702fL/AAAACXBIWXMAAABIAAAASABGyWs+AAACGElEQVQ4y3WT+V9MYRTGz73ZopmoudPITJFRiVIxDCaRxKRQlmHs2dfsO88Yb1GTrKWhwmAqe7KTiOz+Jz/MXL33uj0/nc/7fN/zns97ziGSJYgR/foPGDgocvCQKJ1Aagn66KHDYmINkmSMMw2PH2FWIZaERJMB/zRyVNJoq+L6mGTOBoCU1LFir582bjzUktIzzDKgn5AJDWVlW8LvT5wETSXbrEREwuQp2j7sU6OIiKZNN/QBwJGjIxJm5KqOPae9Z1gonDmLSMwzKuyKyrPnqqp9XgDA7Gwr5c9R+DXnay9cvFR9+cpVAJAiC2juPM5mdfXXGsCYv+b6jUYAcBZS/HwOaGq+eYsBALsduAMARTYqNvAJ7t4LlxdsafUCWLCQFkkc0Hb/gRw+fNQAwFGiBB4/eSrH7c86GOAooVL+iee1L+Tw5asKAJmLaQlf5OuAL1yD583bdwCWLiNXDAf433d+CBFdH30MwPIIWuHk/+lTVWu7n7HutsDnJgBSopvElYpedXzp+frte2fPj0YAcGRYSYg2Kf66u+vnr+bffzwAgFX5RKQvVrabIRhEqJDY1ToiEtas7WMcpHXrBSIiS06ZNrBhY3j0N22O0/KLtsiDL2zdtv3//Fk7CrjF2JluV/q7nC4zv3qibXc5hxj37N2nUy1v2v4DB8tSJMB+qPxwUoJbY7/dR44eO37iZOkpV6HYa/8F2xF7sSKfXdsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDUtMTZUMTM6Mzc6MjgrMDA6MDDfLPdIAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA1LTE2VDEzOjM3OjI4KzAwOjAwrnFP9AAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAASUVORK5CYII=";
        if (!!launchpadFavicon) faviconUrl = mediaUrl + launchpadFavicon;
        if (layout.FAVICON && layout.FAVICON !== this.emptyGuid) faviconUrl = mediaUrl + layout.FAVICON;

        var topLogoDesktop;
        if (isHCP) {
            topLogoDesktop = "webapp/images/logo.png";
        } else {
            topLogoDesktop = "/neptune/server/images/nsball.png";
        }

        var topLogoMobile = topLogoDesktop;
        if (isMobile) {
            topLogoDesktop = imageData.NEPTUNESHELLLOGO || topLogoDesktop;
            topLogoMobile = topLogoDesktop;
        }

        if (layout.TOP_LOGO && layout.TOP_LOGO !== this.emptyGuid) {
            topLogoDesktop = mediaUrl + layout.TOP_LOGO;
            if (isMobile || isHCP) {
                topLogoDesktop = imageData[layout.TOP_LOGO] || topLogoDesktop;
            }
        }

        if (layout.TOP_LOGO_MOBILE && layout.TOP_LOGO_MOBILE !== this.emptyGuid) {
            topLogoMobile = mediaUrl + layout.TOP_LOGO_MOBILE;
            if (isMobile || isHCP) {
                topLogoMobile = imageData[layout.TOP_LOGO_MOBILE] || topLogoMobile;
            }
        }

        var brandImg;
        if (layout.THEME_BRIGHTNESS === "Light") {
            brandImg = "/neptune/server/images/powered-by-neptune-light.png";
            if (isMobile) brandImg = imageData.NEPTUNEPOWEREDBYLIGHT;
        } else {
            brandImg = "/neptune/server/images/powered-by-neptune-dark.png";
            if (isMobile) brandImg = imageData.NEPTUNEPOWEREDBYDARK;
        }
        if (layout.MOB_BRAND_IMG && layout.MOB_BRAND_IMG !== this.emptyGuid) {
            brandImg = mediaUrl + layout.MOB_BRAND_IMG;
            if (isMobile || isHCP) {
                brandImg = imageData[layout.MOB_BRAND_IMG] || brandImg;
            }
        }
        var brandImgDisplay;
        if (layout.MOB_BRAND_HIDE) {
            brandImgDisplay = "None";
        } else if (layout.MOB_BRAND_PLACE === "T") {
            brandImgDisplay = "Top";
        } else if (layout.MOB_BRAND_PLACE === "M") {
            brandImgDisplay = "Middle";
        } else {
            brandImgDisplay = "Bottom";
        }

        // Tiles
        if (!!layout.TILE_LAYOUT) {

            var tileLayout = $.grep(tileLayoutData, function(data, i) {
                return (data.GUID === layout.TILE_LAYOUT);
            })[0];
            if (tileLayout) {
                if (tileLayout.TILE_BACK) root += "--sapTile_Background: " + tileLayout.TILE_BACK + ";";
                if (tileLayout.TILE_BORDER) root += "--sapTile_BorderColor: " + tileLayout.TILE_BORDER + ";";
                if (tileLayout.TILE_HOVER) root += "--sapTile_Hover_Background: " + tileLayout.TILE_HOVER + ";";
                if (tileLayout.TILE_ICON) root += "--sapTile_IconColor: " + tileLayout.TILE_ICON + ";";
                if (tileLayout.TILE_BORDER_ACT) root += "--sapTile_Interactive_BorderColor: " + tileLayout.TILE_BORDER_ACT + ";";
                if (tileLayout.TILE_SEPARATOR) root += "--sapTile_SeparatorColor: " + tileLayout.TILE_SEPARATOR + ";";
                if (tileLayout.TILE_TEXT) root += "--sapTile_TextColor: " + tileLayout.TILE_TEXT + ";";
                if (tileLayout.TILE_TITLE) root += "--sapTile_TitleTextColor: " + tileLayout.TILE_TITLE + ";";
            }
        }

        if (layout.MOB_TOP_BACK) {
            logonRoot += "--sapShellColor: " + layout.MOB_TOP_BACK + ";";
            logonRoot += "--sapShell_BorderColor: " + layout.MOB_TOP_BACK + ";";
            logonRoot += "--nepShell_BorderColor: " + layout.MOB_TOP_BACK + ";";
            logonRoot += "--sapShell_Navigation_Background: " + layout.MOB_TOP_BACK + ";";
            logonRoot += "--nepShell_TopSideMenu: " + layout.MOB_TOP_BACK + ";";
        }
        if (!!layout.MOB_TOP_COL) {
            logonRoot += "--sapShell_TextColor: " + layout.MOB_TOP_COL + ";";
            logonRoot += "--sapShell_InteractiveTextColor: " + layout.MOB_TOP_COL + ";";
            logonRoot += "--sapShell_Navigation_TextColor: " + layout.MOB_TOP_COL + ";";
            logonRoot += "--sapShell_Navigation_SelectedColor: " + layout.MOB_TOP_COL + ";";
        }
        if (!!layout.MOB_TITLE_COL) logonRoot += "--sapTextColor: " + layout.MOB_TITLE_COL + ";";
        if (!!layout.MOB_LABEL_COL) logonRoot += "--sapContent_LabelColor: " + layout.MOB_LABEL_COL + ";";
        if (!!layout.MOB_LINK_COLOR) logonRoot += "--sapLinkColor: " + layout.MOB_LINK_COLOR + ";";
        if (!!layout.MOB_LINK_HOVER) logonRoot += "--sapLink_Hover_Color: " + layout.MOB_LINK_HOVER + ";";
        if (!!layout.MOB_FIELD_BACK) logonRoot += "--sapField_Background: " + layout.MOB_FIELD_BACK + ";";
        if (!!layout.MOB_FIELD_BORD) logonRoot += "--sapField_BorderColor: " + layout.MOB_FIELD_BORD + ";";
        if (!!layout.MOB_FIELD_COL) logonRoot += "--sapField_TextColor: " + layout.MOB_FIELD_COL + ";";

        if (!!layout.MOB_BUT_BACK) {
            logonRoot += "--sapButton_Background: " + layout.MOB_BUT_BACK + ";";
            logonRoot += "--sapButton_Active_Background: " + layout.MOB_BUT_BACK + ";";
        }
        if (!!layout.MOB_BUT_BORD) {
            logonRoot += "--sapButton_BorderColor: " + layout.MOB_BUT_BORD + ";";
            logonRoot += "--sapButton_Active_BorderColor: " + layout.MOB_BUT_BORD + ";";
        }
        if (!!layout.MOB_BUT_COL) {
            logonRoot += "--sapButton_TextColor: " + layout.MOB_BUT_COL + ";";
            logonRoot += "--sapButton_Active_TextColor: " + layout.MOB_BUT_COL + ";";
        }
        if (!!layout.MOB_BUT_HOV_BACK) logonRoot += "--sapButton_Hover_Background: " + layout.MOB_BUT_HOV_BACK + ";";
        if (!!layout.MOB_BUT_HOV_BORD) logonRoot += "--sapButton_Hover_BorderColor: " + layout.MOB_BUT_HOV_BORD + ";";
        if (!!layout.MOB_BUT_HOV_COL) logonRoot += "--sapButton_Hover_TextColor: " + layout.MOB_BUT_HOV_COL + ";";

        // Custom CSS
        if (layout.CUSTOM_CSS) css += layout.CUSTOM_CSS.replace(/\n|\r\n|\r/g, '');

        return {
            css: ":root {" + root + "} .nepLogon:root {" + logonRoot + "}" + css,
            logoDesktop: topLogoDesktop,
            logoMobile: topLogoMobile,
            brandImg: brandImg,
            brandImgDisplay: brandImgDisplay,
            faviconUrl: faviconUrl
        };
    },

    getTileLayoutCss: function(config) {

        var tileLayoutGuid = null;
        var themeBrightness = (AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") ? "Dark" : "Light";
        if (themeBrightness === "Light" && !!config.layout.TILE_LAYOUT) {
            tileLayoutGuid = config.layout.TILE_LAYOUT;

        } else if (themeBrightness === "Dark" && !!config.layout.TILE_LAYOUT_DARK) {
            tileLayoutGuid = config.layout.TILE_LAYOUT_DARK;
        }
        if (!tileLayoutGuid) return "";

        var tileLayout = $.grep(config.tileLayoutData, function(data, i) {
            return (data.GUID === tileLayoutGuid);
        })[0];

        if (!tileLayout) return "";

        var rowId = config.rowId || "";
        var tileId = config.tileId || "";
        var css = "";
        var buttonPrefix = config.tileId || config.rowId;
        buttonPrefix = "." + buttonPrefix;

        var cardPrefix = "." + config.tileId;
        if (config.rowId) {
            cardPrefix = "." + config.rowId + " ";
        }

        if (!!tileLayout.TILE_BACK) {
            css += cardPrefix + ".nepFCard.sapFCard{background:" + tileLayout.TILE_BACK + ";}";
            // css += cardPrefix + ".nepFCard.sapFCard:not(.sapFCardPreview):not(.sapFCardTransparent):hover .sapFCardHeader:hover{background:" + tileLayout.TILE_BACK + ";}";
            
        }
        if (!!tileLayout.TILE_BORDER) {
            if (tileLayout.TILE_BORDER === "transparent") {
                css += cardPrefix + ".nepFCard.sapFCard{box-shadow:none}";
            } else {
                var clr = (themeBrightness === "Dark") ? "rgb(0 0 0 / 30%)": "rgb(0 0 0 / 10%)";
                css += cardPrefix + ".nepFioriStyle .nepTile{box-shadow: 0 0 0 0.0625rem " + tileLayout.TILE_BORDER + ", 0 0.125rem 0.5rem 0 " + clr + ";}";
                css += cardPrefix + ".nepFCard.sapFCard{box-shadow: 0 0 0 0.0625rem " + tileLayout.TILE_BORDER + ", 0 0.125rem 0.5rem 0 " + clr + ";}";
            }
        }
        if (!!tileLayout.TILE_HOVER) {
            css += cardPrefix + ".nepFCard.sapFCard.nepTileClickable:not(.nepBlocked):hover{background:" + tileLayout.TILE_HOVER + ";}";
        }
        if (!!tileLayout.TILE_ICON) {
            css += cardPrefix + ".nepPanChart .sapMNCIconImage{color:" + tileLayout.TILE_ICON + ";}";
            css += cardPrefix + ".nepTileIcon .sapUiIcon{color:" + tileLayout.TILE_ICON + ";}";
            css += cardPrefix + ".sapFCard .nepFCardHeader.sapFCardHeader .sapFCardIcon.sapFAvatar .sapUiIcon{color:" + tileLayout.TILE_ICON + ";}";
            css += cardPrefix + ".sapFCard .nepFCardBody.sapFCardHeader .sapFCardIcon.sapFAvatar .sapUiIcon{color:" + tileLayout.TILE_ICON + ";}";

        }
        if (!!tileLayout.TILE_BORDER_ACT) {
            if (tileLayout.TILE_BORDER_ACT === "transparent") {
                css += cardPrefix + ".nepFCard.sapFCard{box-shadow:none}";
            } else {
                var clrAct = (themeBrightness === "Dark") ? "rgb(0 0 0 / 30%)": "rgb(0 0 0 / 10%)";
                css += cardPrefix + ".nepFioriStyle .nepTile:hover{box-shadow: 0 0 0 0.0625rem " + tileLayout.TILE_BORDER_ACT + ", 0 0.125rem 0.5rem 0 " + clrAct + ";}";
                css += cardPrefix + ".nepFCard.sapFCard.nepTileClickable:not(.nepBlocked):hover{box-shadow: 0 0 0 0.0625rem " + tileLayout.TILE_BORDER_ACT + ", 0 0.125rem 0.5rem 0 " + clrAct + ";}";
            }
        }
        if (!!tileLayout.TILE_SEPARATOR) {
            css += cardPrefix + ".nepFCard.sapFCard .sapFCardHeader{border-bottom-color:" + tileLayout.TILE_SEPARATOR + ";}";
        }
        if (!!tileLayout.TILE_TEXT) {
            css += cardPrefix + ".nepFCard.sapFCard{color:" + tileLayout.TILE_TEXT + ";text-shadow: none;}";
            css += cardPrefix + ".nepFCard.sapFCard .sapFCardSubtitle{color:" + tileLayout.TILE_TEXT + ";text-shadow: none;}";
            css += cardPrefix + ".nepFCard.sapFCard .sapFCardStatus{color:" + tileLayout.TILE_TEXT + ";text-shadow: none;}";
        }
        if (!!tileLayout.TILE_TITLE) {
            css += cardPrefix + ".nepFCard.sapFCard .sapFCardHeader .sapFCardHeaderText .sapFCardTitle{color:" + tileLayout.TILE_TITLE + ";text-shadow: none;}";
        }
        if (!!tileLayout.TILE_BUT_BACK) {
            css += buttonPrefix + " .nepActionContainer .sapMBtnInner{background-color:" + tileLayout.TILE_BACK + ";}";
        }
        if (!!tileLayout.TILE_BUT_BORD) {
            css += buttonPrefix + " .nepActionContainer .sapMBtnInner{border-color:" + tileLayout.TILE_BUT_BORD + ";}";
        }
        if (!!tileLayout.TILE_BUT_TEXT) {
            css += buttonPrefix + " .nepActionContainer .sapMBtnInner{color:" + tileLayout.TILE_BUT_TEXT + ";text-shadow: none;}";
            css += buttonPrefix + " .nepActionContainer .sapMBtnIcon{color:" + tileLayout.TILE_BUT_TEXT + ";text-shadow: none;}";
        }
        if (!!tileLayout.TILE_BUT_BACKHOV) {
            css += buttonPrefix + " .nepActionContainer .sapMBtn:hover>.sapMBtnHoverable{background-color:" + tileLayout.TILE_BUT_BACKHOV + ";}";
        }
        if (!!tileLayout.TILE_BUT_BORDHOV) {
            css += buttonPrefix + " .nepActionContainer .sapMBtn:hover>.sapMBtnHoverable{border-color:" + tileLayout.TILE_BUT_BORDHOV + ";}";
        }
        if (!!tileLayout.TILE_BUT_TEXTHOV) {
            css += buttonPrefix + " .nepActionContainer .sapMBtn:hover .sapMBtnContent{color:" + tileLayout.TILE_BUT_TEXTHOV + ";}";
            css += buttonPrefix + " .nepActionContainer .sapMBtn:hover .sapMBtnIcon:before{color:" + tileLayout.TILE_BUT_TEXTHOV + ";}";
        }
        if (!!tileLayout.TILE_BUT_BACKACT) {
        }
        if (!!tileLayout.TILE_BUT_BORDACT) {
        }
        if (!!tileLayout.TILE_BUT_TEXTACT) {
        }
        return css;
    },

    defaultColor: {
        light: "#fff",
        dark: "#444"
    },

    themeDetection: function(fn) {
        if (typeof cordova !== "undefined" && cordova.plugins && cordova.plugins.ThemeDetection) {
            cordova.plugins.ThemeDetection.isAvailable(function(e) {
                if (e.value) {
                    cordova.plugins.ThemeDetection.isDarkModeEnabled(function(dark) {
                        fn(dark.value);    
                    }, function() {
                        fn(false);
                    });
                } else {
                    fn(false);
                }
            }, function() {
                fn(false);
            });    
        } else if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                fn(true);    
            } else {
                fn(false);
            }
        } else {
            fn(false);
        }
    },

    getTileButtonCss: function() {
        return ""; // Legacy DXP6 Support
    }
};
