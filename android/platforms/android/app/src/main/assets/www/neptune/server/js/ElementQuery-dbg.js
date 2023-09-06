neptune.ElementQuery = {

    register: function(element, config) {

        var elementQuery = new this._ElementQueryClass(config);

        sap.ui.core.ResizeHandler.register(element, function(e) {
            elementQuery.resize(element, e.size.width);
        });
    },

    _ElementQueryClass: function(config) {

        config = config || {};

        this.isolate = config.isolate || false;
        this.debug = config.debug || false;
        this.debugCallback = config.debugCallback || function(e){};
        this.callback = config.callback || function(e){};
        this.prefix = config.prefix || "nepCanvas";

        this.canvas = {
            XXXXL: 8,
            XXXL: 7,
            XXL: 6,
            XL: 5,
            L: 4,
            M: 3,
            S: 2,
            XS: 1
        };
        this.width = {
            xxxlarge: 2360,
            xxlarge: 1880,
            xlarge: 1580,
            large: 1280,
            medium: 980,
            small: 680,
            xsmall: 350
        };

        this.size = 9;

        if (config.width) {
            this.width.xxxlarge = config.width.xxxlarge || this.width.xxxlarge;
            this.width.xxlarge = config.width.xxlarge || this.width.xxlarge;
            this.width.xlarge = config.width.xlarge || this.width.xlarge;
            this.width.large = config.width.large || this.width.large;
            this.width.medium = config.width.medium || this.width.medium;
            this.width.small = config.width.small || this.width.small;
            this.width.xsmall = config.width.xsmall || this.width.xsmall;
        }

        this.resize = function(element, width) {

            // when element goes off screen, width is set = 0. Do not resize elements that goes off screen => resizing when visible again
            if (width === 0) return;
            var size, s;

            if (this.size > this.canvas.XXXXL && width > this.width.xxxlarge) {
                size = this.canvas.XXXXL;
            } else if (width > this.width.xxxlarge && this.size !== this.canvas.XXXXL) {
                size = this.canvas.XXXXL;
            } else if (width <= this.width.xxxlarge && width > this.width.xxlarge && this.size !== this.canvas.XXXL) {
                size = this.canvas.XXXL;
            } else if (width <= this.width.xxlarge && width > this.width.xlarge && this.size !== this.canvas.XXL) {
                size = this.canvas.XXL;
            } else if (width <= this.width.xlarge && width > this.width.large && this.size !== this.canvas.XL) {
                size = this.canvas.XL;
            } else if (width <= this.width.large && width > this.width.medium && this.size !== this.canvas.L) {
                size = this.canvas.L;
            } else if (width <= this.width.medium && width > this.width.small && this.size !== this.canvas.M) {
                size = this.canvas.M;
            } else if (width <= this.width.small && width > this.width.xsmall && this.size !== this.canvas.S) {
                size = this.canvas.S;
            } else if (width <= this.width.xsmall && this.size !== this.canvas.XS) {
                size = this.canvas.XS;
            }

            if (size) {
                this.size = size;
                if (this.debug) console.log("Resizing: " + element.getId() + " to -> " + this.size);

                element.removeStyleClass(this.prefix + "Full");
                element.removeStyleClass(this.prefix + "XXXLarge");
                element.removeStyleClass(this.prefix + "XXLarge");
                element.removeStyleClass(this.prefix + "XLarge");
                element.removeStyleClass(this.prefix + "Large");
                element.removeStyleClass(this.prefix + "Medium");
                element.removeStyleClass(this.prefix + "Small");
                element.removeStyleClass(this.prefix + "XSmall");

                if (this.isolate) {
                    s = this.getWidth(this.size);
                    if (this.size < this.canvas.XXXXL) {
                        element.addStyleClass(this.prefix + s);
                    } else {
                        element.addStyleClass(this.prefix + "Full");
                    }
                } else {
                    s = this.addAllClasses(this.size, element);
                }

                this.callback({
                    width: width,
                    size: s
                });
            }

            if (this.debug) {
                console.log("Width of " + element.getId() + " -> " + width);
                this.debugCallback({
                    width: width,
                    size: this.getWidth(this.size)
                });
            }
        },

        this.addAllClasses = function(size, element) {

            var s = "XXXXLarge";

            if (size <= this.canvas.XXXL) {
                s = "XXXLarge";
                element.addStyleClass(this.prefix + s);
            }
            if (size <= this.canvas.XXL) {
                s = "XXLarge";
                element.addStyleClass(this.prefix + s);
            }
            if (size <= this.canvas.XL) {
                s = "XLarge";
                element.addStyleClass(this.prefix + s);
            }
            if (size <= this.canvas.L) {
                s = "Large";
                element.addStyleClass(this.prefix + s);
            }
            if (size <= this.canvas.M) {
                s = "Medium";
                element.addStyleClass(this.prefix + s);
            }
            if (size <= this.canvas.S) {
                s = "Small";
                element.addStyleClass(this.prefix + s);
            }
            if (size <= this.canvas.XS) {
                s = "XSmall";
                element.addStyleClass(this.prefix + s);
            }
            return s;
        },

        this.getWidth = function(s) {
            if (s===1) return "XSmall";
            if (s===2) return "Small";
            if (s===3) return "Medium";
            if (s===4) return "Large";
            if (s===5) return "XLarge";
            if (s===6) return "XXLarge";
            if (s===7) return "XXXLarge";
            return "XXXXLarge";
        };
    }
};
