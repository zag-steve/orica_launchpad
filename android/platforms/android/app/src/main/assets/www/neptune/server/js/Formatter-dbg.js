neptune.Formatter = {
    currencyDigits: {},
    init: function() {
        $.sap.loadResource("sap/ui/core/cldr/en.json", {
            dataType: "json",
            failOnError: true,
            async: true
        }).then(function(cldr) {
            neptune.Formatter.currencyDigits = cldr.currencyDigits;
        }.bind(this));
    },
    getCurrencyAmount: function(currency, amount) {
        if (!amount) return 0;
        if (!currency) currency = "";
        var decimals = 2;
        if (neptune.Formatter.currencyDigits.hasOwnProperty(currency)) {
            decimals = neptune.Formatter.currencyDigits[currency];
        }
        return neptune.Formatter.getNumber(amount, decimals);
    },
    getDate: function(sapDate, sapDateFormat, noYear, shortYear) {
        if (typeof(sapDate) === "undefined" || sapDate === null || sapDate === "" || +sapDate === 0) {
            return "";
        }
        sapDateFormat = sapDateFormat || neptune.UserDefault.date;
        var formattedText = '';
        var sapFormat = sap.ui.core.format.DateFormat.getDateInstance({
            format: "yyyyMMdd"
        });
        var pattern = this.getDatePattern(sapDateFormat, noYear, shortYear);
        if (pattern === "japanese") {
            formattedText = this.getJapaneseDate(sapDate, sapDateFormat);
        } else if (pattern === "arabic") {
            formattedText = this.getArabicDate(sapDate);
        } else if (pattern === "persian") {
            formattedText = this.getPersianDate(sapDate);
        } else {
            var outFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: pattern
            });
            var oDate = sapFormat.parse(sapDate);
            if (sapDate !== '00000000') {
                formattedText = outFormat.format(oDate);
            }
        }
        return formattedText;
    },
    getDateOData: function(unixDate, sapDateFormat) {
        if (typeof(unixDate) === "undefined" || unixDate === null || unixDate === "" || +unixDate === 0) {
            return "";
        }
        var sapDate = neptune.Formatter.getSapDate(unixDate);
        return neptune.Formatter.getDate(sapDate, sapDateFormat);
    },
    getSapDate: function(unixDate) {
        var date = new Date(+unixDate);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        month = (month < 10) ? "0" + month : month;
        day = (day < 10) ? "0" + day : day;
        return "" + year + month + day;
    },
    getSapTime: function(unixDate) {
        var date = new Date(+unixDate);
        var hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
        var minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = (date.getSeconds() < 10) ? "0" + date.getSeconds() : date.getSeconds();
        return "" + hours + minutes + seconds;
    },
    getUnixDate: function(sapDate) {
        if (sapDate.toString().length !== 8) return sapDate;
        return new Date(+sapDate.substr(0,4), +sapDate.substr(4,2)-1, +sapDate.substr(6,8));
    },
    getNumberFormat: function(decimals, style) {
        if (!style || (style !== "short" && style !== 'long' && style !== 'standard')) {
            style = "standard";
        }
        var maxFractionDigits = 6;
        var minFractionDigits = 2;
        if (decimals === 0) {
            maxFractionDigits = 0;
            minFractionDigits = 0;
        }
        if (decimals === 1) {
            maxFractionDigits = 1;
            minFractionDigits = 1;
        }
        if (decimals === 2) {
            maxFractionDigits = 2;
            minFractionDigits = 2;
        }
        if (decimals === 3) {
            maxFractionDigits = 3;
            minFractionDigits = 3;
        }
        var numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
            maxFractionDigits: maxFractionDigits,
            minFractionDigits: minFractionDigits,
            groupingEnabled: true,
            groupingSeparator: neptune.UserDefault.numberGrouping,
            decimalSeparator: neptune.UserDefault.numberDecimal,
            style: style
        });
        return numberFormat;
    },
    getNumber: function(sapNumber, decimals, style) {
        if (typeof sapNumber === "undefined" || sapNumber === null || sapNumber === "") {
            return "";
        }
        var numberFormat = this.getNumberFormat(decimals, style);
        return numberFormat.format(+sapNumber);
    },
    getNumberType: function(decimals) {
        var maxFractionDigits = 6;
        var minFractionDigits = 2;
        if (decimals === 0) {
            maxFractionDigits = 0;
            minFractionDigits = 0;
        }
        if (decimals === 1) {
            maxFractionDigits = 1;
            minFractionDigits = 1;
        }
        if (decimals === 2) {
            maxFractionDigits = 2;
            minFractionDigits = 2;
        }
        if (decimals === 3) {
            maxFractionDigits = 3;
            minFractionDigits = 3;
        }
        var numberType = new sap.ui.model.type.Float({
            minFractionDigits: minFractionDigits,
            maxFractionDigits: maxFractionDigits,
            groupingEnabled: true,
            groupingSeparator: neptune.UserDefault.numberGrouping,
            decimalSeparator: neptune.UserDefault.numberDecimal
        });
        return numberType;
    },
    getDynamicShort: function(number, decimals) {

        // 3 digit negative numbers would result in decimal notation, but no decimal => -123. => so no digits
        if (number < -100 && number > -1000) {
            return neptune.Formatter.getNumber(number, 0);
        }
        // 3 digit positive number => just show number. One digit if not an integer => 123.4
        if (number < 1000) {
            return number;
        }
        // try first with two decimals => 1234567 => 1.23M
        if (typeof decimals === "undefined") {
            decimals = 2;
        }
        var formattedNumber = neptune.Formatter.getNumber(number, decimals, "short");
        if (formattedNumber.length > 5 && decimals > 0) {
            // too long => try with one less decimal until we get to 5 or below. 12345 => 12.3K. 123456 => 123K
            formattedNumber = neptune.Formatter.getDynamicShort(number, decimals - 1);
        }
        return formattedNumber;
    },
    getTimePattern: function(formatLength, sapTimeFormat) {
        var pattern = "HH:mm";
        sapTimeFormat = sapTimeFormat || neptune.UserDefault.time;
        if (sapTimeFormat === "0") {
            if (formatLength === "Long") {
                pattern = "HH:mm:ss";
            } else if (formatLength === "Short") {
                pattern = "HH";
            } else { //Medium
                pattern = "HH:mm";
            }
        } else if (sapTimeFormat === "1" || sapTimeFormat === "2") {
            if (formatLength === "Long") {
                pattern = "hh:mm:ss a";
            } else if (formatLength === "Short") {
                pattern = "hh a";
            } else { //Medium
                pattern = "hh:mm a";
            }
        } else if (sapTimeFormat === "3" || sapTimeFormat === "4") {
            if (formatLength === "Long") {
                pattern = "KK:mm:ss a";
            } else if (formatLength === "Short") {
                pattern = "KK a";
            } else { //Medium
                pattern = "KK:mm a";
            }
        }
        return pattern;
    },
    getTime: function(sapTime, timeFormat, sapTimeFormat) {
        if (typeof(sapTime) === "undefined" || sapTime === null || sapTime === "" || +sapTime === 0) {
            return "";
        }
        timeFormat = timeFormat || "Medium";
        var pattern = neptune.Formatter.getTimePattern(timeFormat, sapTimeFormat);
        var sapFormat = sap.ui.core.format.DateFormat.getTimeInstance({
            format: "HHmmss"
        });
        var outFormat = sap.ui.core.format.DateFormat.getTimeInstance({
            pattern: pattern
        });
        var time = sapFormat.parse(sapTime);
        if (!time) return "";
        var formattedText = outFormat.format(time);
        if (sapTimeFormat === "2" || sapTimeFormat === "4") {
            formattedText.toLowerCase();
        }
        return formattedText;
    },
    getDateFormatBrowserDefault: function() {
        try {
            var locale = new sap.ui.core.Locale(navigator.language);
            var dateInstance = sap.ui.core.format.DateFormat.getDateInstance(locale);
            return dateInstance.oFormatOptions.pattern;
        } catch (e) {
            return "dd.MM.yyyy";
        }
    },
    getDateFormat: function(sapDateFormat) {
        sapDateFormat = sapDateFormat || neptune.UserDefault.date;
        if (sapDateFormat === "1") return "dd.MM.yyyy";
        else if (sapDateFormat === "2") return "MM/dd/yyyy";
        else if (sapDateFormat === "3") return "MM-dd-yyyy";
        else if (sapDateFormat === "4") return "yyyy.MM.dd";
        else if (sapDateFormat === "5") return "yyyy/MM/dd";
        else if (sapDateFormat === "6") return "yyyy-MM-dd";
        else if (sapDateFormat === "7") return "Gy/MM/dd";
        else if (sapDateFormat === "8") return "Gy-MM-dd";
        else if (sapDateFormat === "9") return "Gy.MM.dd";
        else if (sapDateFormat === "A") return "yyyy/MM/dd";
        else if (sapDateFormat === "B") return "yyyy/MM/dd";
        else if (sapDateFormat === "C") return "yyyy/MM/dd";
        else return "dd.MM.yyyy";
    },
    getDisplayFormatType: function(sapDateFormat) {
        sapDateFormat = sapDateFormat || neptune.UserDefault.date;
        if (sapDateFormat === "7" || sapDateFormat === "8" || sapDateFormat === "9") return sap.ui.core.CalendarType.Japanese;
        else if (sapDateFormat === "A" || sapDateFormat === "B") return sap.ui.core.CalendarType.Islamic;
        else if (sapDateFormat === "C") return sap.ui.core.CalendarType.Persian;
		return sap.ui.core.CalendarType.Gregorian;
    },
    getDatePattern: function(sapDateFormat, noYear, shortYear) {
        sapDateFormat = "" + sapDateFormat;
        if (noYear) {
            if (sapDateFormat === "1") return "dd.MM";
            else if (sapDateFormat === "2") return "MM/dd";
            else if (sapDateFormat === "3") return "MM-dd";
            else if (sapDateFormat === "4") return "MM.dd";
            else if (sapDateFormat === "5") return "MM/dd";
            else if (sapDateFormat === "6") return "MM-dd";
            else if (sapDateFormat === "7" || sapDateFormat === "8" || sapDateFormat === "9") return "japanese";
            else if (sapDateFormat === "A" || sapDateFormat === "B") return "arabic";
            else if (sapDateFormat === "C") return "persian";

        } else if (shortYear) {
            if (sapDateFormat === "1") return "dd.MM.yy";
            else if (sapDateFormat === "2") return "MM/dd/yy";
            else if (sapDateFormat === "3") return "MM-dd-yy";
            else if (sapDateFormat === "4") return "yy.MM.dd";
            else if (sapDateFormat === "5") return "yy/MM/dd";
            else if (sapDateFormat === "6") return "yy-MM-dd";
            else if (sapDateFormat === "7" || sapDateFormat === "8" || sapDateFormat === "9") return "japanese";
            else if (sapDateFormat === "A" || sapDateFormat === "B") return "arabic";
            else if (sapDateFormat === "C") return "persian";
        } else {
            if (sapDateFormat === "1") return "dd.MM.yyyy";
            else if (sapDateFormat === "2") return "MM/dd/yyyy";
            else if (sapDateFormat === "3") return "MM-dd-yyyy";
            else if (sapDateFormat === "4") return "yyyy.MM.dd";
            else if (sapDateFormat === "5") return "yyyy/MM/dd";
            else if (sapDateFormat === "6") return "yyyy-MM-dd";
            else if (sapDateFormat === "7" || sapDateFormat === "8" || sapDateFormat === "9") return "japanese";
            else if (sapDateFormat === "A" || sapDateFormat === "B") return "arabic";
            else if (sapDateFormat === "C") return "persian";
            else return "dd.MM.yyyy";
        }
    },
    getJapaneseDate: function(sapDate, sapDateFormat) {
        var del = ".";
        if (sapDateFormat === "8") del = "/";
        else if (sapDateFormat === "9") del = "-";
        var year = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
            era: "short",
            year: "numeric"
        }).format(new Date(sapDate.slice(0, 4), +sapDate.slice(4, 6) - 1, sapDate.slice(6, 8))).slice(0, -1);
        return year + del + sapDate.slice(4, 6) + del + sapDate.slice(6, 8);
    },
    getPersianDate: function(sapDate) {
        var date = new Date(sapDate.slice(0, 4), +sapDate.slice(4, 6) - 1, sapDate.slice(6, 8));
        var year = new Intl.DateTimeFormat("en-GB-u-ca-persian", {
            year: "numeric"
        }).format(date).slice(0, 4);
        var month = new Intl.DateTimeFormat("en-GB-u-ca-persian", {
            month: "2-digit"
        }).format(date);
        var day = new Intl.DateTimeFormat("en-GB-u-ca-persian", {
            day: "2-digit"
        }).format(date);
        return year + "/" + month + "/" + day;
    },
    getArabicDate: function(sapDate) {
        var date = new Date(sapDate.slice(0, 4), +sapDate.slice(4, 6) - 1, sapDate.slice(6, 8));
        var islamicDate = sap.ui.core.date.UniversalDate.getInstance(date, sap.ui.core.CalendarType.Islamic);
        var d = parseInt(islamicDate.getDate());
        var m = parseInt(islamicDate.getMonth() + 1);
        var y = parseInt(islamicDate.getFullYear());
        return y + "/" + ('0' + m).slice(-2) + "/" + ('0' + d).slice(-2);
    }
};
