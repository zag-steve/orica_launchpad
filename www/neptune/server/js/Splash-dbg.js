neptune.Splash = {

    init: false,
    default : {
        themeBrightness: "Light",
        spinnerColor: {
            Light: "#003E52", // Neptune Dark Blue
            Dark: "#fff"
        },
        logoColor: {
            Light: "#F6B221", // Neptune Yellow
            Dark: "#fff"
        },
        spinnerMessageColor: {
            Light: "#003E52", // Neptune Dark Blue
            Dark: "#fff"
        },
        spinnerType: "Chase",
        spinnerSize: "big",
        backgroundColor: "#fff",
        fontSize: "3rem",
        fontWeight: "bold"
    },

    id: "",
    timestamp: "",
    active: false,
    spinnerType: "",
    spinnerSize: "",
    spinnerColor: "",
    logoColor: "",
    backgroundColor: "",
    spinnerMessage: "",
    spinnerMessageColor: "",
    translatedSpinnerMessage: "",
    fontSize: "",
    fontWeight: "",
    key: "",
    val: "",
    logo: "",
    lazyLoad: false,
    themeBrightness: "",
    translation: null,
    language: "",
    spinnerDiv: {
        big: "<div class='nepSpinnerBig nepSpinner",
        small: "<div class='nepSpinner",
    },
    spinnerHtml: {
        Wave: "nepSpinnerWave'><div class='nepSpinnerWaveRect1'></div><div class='nepSpinnerWaveRect2'></div><div class='nepSpinnerWaveRect3'>" +
            "</div><div class='nepSpinnerWaveRect4'></div><div class='nepSpinnerWaveRect5'></div>",
        Bounce: "nepSpinnerBounce'><div class='nepSpinnerBounce1'></div><div class='nepSpinnerBounce2'></div></div>",
        Chase: "nepSpinnerChase'><div class='nepSpinnerDot1'></div><div class='nepSpinnerDot2'></div></div>",
        Three: "nepSpinnerThree'><div class='nepSpinnerThreeBounce1'></div><div class='nepSpinnerThreeBounce2'></div><div class='nepSpinnerThreeBounce3'></div></div>",
        Circle: "nepSpinnerCircle'><div class='nepSpinnerCircleDot1 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot2 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot3 nepSpinnerCircleDot'></div><div class=" +
            "'nepSpinnerCircleDot4 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot5 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot6 nepSpinnerCircleDot'></div> <div class=" +
            "'nepSpinnerCircleDot7 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot8 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot9 nepSpinnerCircleDot'></div> <div class=" +
            "'nepSpinnerCircleDot10 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot11 nepSpinnerCircleDot'></div><div class='nepSpinnerCircleDot12 nepSpinnerCircleDot'></div></div>"
    },
    isActive: function() {
        return this.active;
    },
    setActive: function(active) {
        this.active = active;
    },
    splashScreen: {
        finish: function() {}
    },
    show: function(config) {
        if (!this.init) this.setLayout({});
        config = config || {};
        this.lazyLoad = config.lazyLoad || false;
        if (this.isActive()) {
            return;
        }

        if (config.key) this.key = config.key;
        if (config.val) this.val = config.val;

        try {
            this.splashScreen = pleaseWait({
                logo: this.getLogoUrl(),
                backgroundColor: this.backgroundColor,
                loadingHtml: "<p class='loading-message'>" + this.translatedSpinnerMessage + "</p>" + this.spinnerDiv[this.spinnerSize] + " " + this.spinnerHtml[this.spinnerType]
            });
            this.setActive(true);
        } catch (e) {
            this.setActive(false);
            console.error("neptune.Splash.show: " + e);
        }
    },

    hide: function(config) {
        config = config || {};

        if (!!config.key && (config.key !== this.key || config.val !== this.val)) {
            return;
        }
        this.setActive(false);

        this.key = "";
        this.val = "";

        var nepSplashBackground = document.querySelector('#nepSplashBackground');
        nepSplashBackground.style.display = "none";
        this.splashScreen.finish(true);

        var that = this;

        if (this.delayedLayout) {
            setTimeout(function() {  
                if (that.delayedLayout) that.setLayout(that.delayedLayout);
                that.delayedLayout = null;
            }, 1500);
        }
    },

    getMediaUrl: function() {
        return AppCache.mediaUrl || neptune.Utils.urlHelper.getUrlPrefix() + "/public/media/";
    },

    getImageUrl: function() {
        return AppCache.imageUrl || neptune.Utils.urlHelper.getUrlPrefix() + "/server/images/";
    },

    getLogoUrl: function() {

        var imageurl = "";
        var launchpad = (!!neptune.launchpad) ? "launchpad=" + neptune.launchpad + "&" : "";

        if (!this.logo) {

            var logoClr = this.logoColor;
            var xmlStr = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="212" height="212" viewBox="0 0 60.62 60.69">'+
            '<defs>'+
            '<style>'+
            '.nepSVGLogoRing{fill:transparent;}'+
            '.nepSVGLogoPlanet{fill:' + logoClr + ';}'+
            '</style>'+
            '</defs>'+
            '<circle class="nepSVGLogoRing" cx="32.71" cy="33.94" r="21.27"/>'+
            '<path class="nepSVGLogoPlanet" d="M59.24,68.3A12.2,12.2,0,1,1,71.42,56.1,12.2,12.2,0,0,1,59.24,68.3M51.47,25a30.35,30.35,0,1,0,30.3,30.35A30.33,30.33,0,0,0,51.47,25" transform="translate(-21.16 -24.98)"/>'+
            '<path class="nepSVGLogoPlanet" d="M59.24,46.05A10.06,10.06,0,1,0,69.29,56.1,10.06,10.06,0,0,0,59.24,46.05" transform="translate(-21.16 -24.98)"/>'+
            '</svg>';
            var xmlDecoded = unescape(encodeURIComponent(xmlStr));
            var xmlEncoded = window.btoa(xmlDecoded);
            imageurl = 'data:image/svg+xml;base64,' + xmlEncoded;

        } else if (this.logo.indexOf("data") === 0) {
            imageurl = this.logo;

        } else if (this.logo.indexOf("/") === 0 || this.logo.indexOf("http") === 0) {
            imageurl = this.logo + "?" + launchpad + neptune.cachebuster;

        } else {
            imageurl = this.getMediaUrl() + this.logo + "?" + launchpad + neptune.cachebuster;
            if (AppCache.isMobile || AppCache.isHCP) {
                imageurl = AppCache.imageData[this.logo] || imageurl;
            }
        }
        return imageurl;
    },
    
    setLayout: function(systemTheme, layouts, show) {

        let that = this;

        if (neptune.debug.layout) console.log("Splash.setLayout: " + systemTheme);

        neptune.Style.themeDetection(function(darkMode){

            let splashLayout;

            // In some circomstances both light & dark theme must be available when creating call to setLayout, like loading a Mobile Client or reloading a PWA
            if (typeof systemTheme === "object") {
                splashLayout = systemTheme;

            } else {
                splashLayout = layouts[0];
                if (+systemTheme === 0) {
                    if (darkMode && layouts.length > 1) {
                        splashLayout = layouts[1];
                    }
                } else if (systemTheme === 1 && layouts.length > 1) {
                    splashLayout = layouts[1];
                } 
            }
            if (neptune.debug.layout) console.log("Splash.id: " + splashLayout.id);

            that.init = true;

            if (that.isActive()) {
                that.delayedLayout = splashLayout;
                return;
            }
            if (splashLayout.timestamp === that.timestamp && splashLayout.id === that.id && splashLayout.language === that.language) {
                return;
            }
            that.id = splashLayout.id;
            that.timestamp = splashLayout.timestamp;
            that.logo = splashLayout.logo;
            that.spinnerType = splashLayout.spinnerType || that.default.spinnerType;
            that.spinnerSize = splashLayout.spinnerSize || that.default.spinnerSize;
            that.spinnerMessage = splashLayout.spinnerMessage || "";
            that.translatedSpinnerMessage = splashLayout.spinnerMessage || "";
            that.backgroundColor = splashLayout.backgroundColor || that.default.backgroundColor;
            that.backgroundImage = splashLayout.backgroundImage || "";
            that.themeBrightness = splashLayout.themeBrightness || that.default.themeBrightness;
            that.fontSize = splashLayout.fontSize || that.default.fontSize;
            that.fontWeight = splashLayout.fontWeight || that.default.fontWeight;
            that.spinnerColor = splashLayout.spinnerColor || that.default.spinnerColor[that.themeBrightness];
            that.spinnerMessageColor = splashLayout.spinnerMessageColor || that.default.spinnerMessageColor[that.themeBrightness];
            that.logoColor = splashLayout.logoColor || that.default.logoColor[that.themeBrightness];
            that.translation = (!!splashLayout.translation) ? JSON.parse(splashLayout.translation) : null;
            if (!!splashLayout.language) that.language = splashLayout.language;

            if (that.language && that.translation) {

                var currentTranslation = that.translation.find(data => {
                    return (data.SPRAS === that.language);
                });
                if (currentTranslation) {
                    that.translatedSpinnerMessage = currentTranslation.SPINNER_MESSAGE || "";
                }
            }

            var style = "";

            if (that.spinnerType === "Circle") {
                style += ".nepSpinnerCircle .nepSpinnerCircleDot:before";
            } else {
                style += ".nepSpinner div";
            }

            logoElem = document.getElementsByClassName("pg-loading-logo")[0];
            if (logoElem) {
                logoElem.src = that.getLogoUrl();
            }

            var backgroundStyle = "";
            var bacgroundImageUrl = "";

            if (!!that.backgroundImage) {

                var backgroundImage;
                if (that.backgroundImage.indexOf("NEPTUNE") === 0) {
                    backgroundImage = that.getImageUrl() + that.backgroundImage+ ".jpg";
    
                } else {
                    backgroundImage = that.getMediaUrl() + that.backgroundImage;            
                }
                if (AppCache.isMobile || AppCache.isHCP) backgroundImage = AppCache.imageData[that.backgroundImage] || backgroundImage;  
                bacgroundImageUrl = "url('" + backgroundImage + "')";
            
                backgroundStyle =
                    '.pg-loading-screen.pg-loading{' +
                        'background-image: ' + bacgroundImageUrl + ';' +
                        'background-repeat: no-repeat;' +
                        'background-size: cover;' +
                        'background-position: center;' +
                    '}';
            }
            if (!!that.backgroundColor) {
                backgroundStyle += ".pg-loading-screen{background-color:" + that.backgroundColor + "}";
            }
            document.getElementById("NeptuneSplashDiv").innerHTML = backgroundStyle +
                style + '{background-color:' + that.spinnerColor + ';}' +
                '.loading-message{color:' + that.spinnerMessageColor + ';font-size:' + that.fontSize + ';font-weight: ' + that.fontWeight + ';}';

            if (show) {
                that.show(show);
            }
        });
    }
};