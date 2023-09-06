neptune.CSRF = {
    token: "",
    salt: "",
    // initialized: false,
    init: function(callback, force) {
        // if (force) this.initialized = false;
        // if (this.initialized) {
        //     callback();
        //     return;
        // }
        this.salt = new Date().getTime();
        this.token = "";
        var that = this;
        if (typeof cookieMaster === "object") {

//22.10.0008 #18914
            // cookieMaster.setCookieValue(AppCache.Url, "CSRF-Session", this.getSession());
            cookieMaster.setCookieValue(AppCache.Url, "CSRF-Session", this.getSession() + "; SameSite=None; Secure;");
//22.10.0008 #18914 End

        } else {
            document.cookie = "CSRF-Session=" + this.getSession() + "; SameSite=Lax; Secure; Path=/;";
        }


        var xhr = new XMLHttpRequest();
        xhr.open("POST", AppCache.Url + "/neptune/native/fetch_csrf?sap-client=" + AppCache.Client, true); // #16848
        xhr.onload = function() {

            if (xhr.status !== 200) return;
            var LoginStatus = xhr.getResponseHeader("SAPLoginStatus");
            if (LoginStatus === "Logon" || LoginStatus === "Password") return;

            // that.initialized = true;
            that.setToken(xhr.response);
            that.setup();
            callback();
        };
        xhr.send();
    },
    setup: function() {
        var that = this;
        var op = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
            var resp = op.apply(this, arguments);
            var method = arguments[0];
            if (method === "GET") {
                return resp;
            }
            var url = arguments[1];
            if (url.indexOf("http") === 0 && url.indexOf(location.host) < 0) {
                return resp;
            }
            this.setRequestHeader(AppCache.CSRFHeader, that.getToken());
            return resp;
        };
    },
    setToken: function(token) {
        this.token = token;
    },
    getToken: function() {
        return this.token;
    },
    getSession: function() {
        var uname = neptune.UserDefault.uname || AppCache.CurrentUname || "SYSTEM";
        var session = neptune.MD5.get(this.salt + uname + AppCache.CurrentConfig + AppCache.CSRFHeader);
        return session;
    }
};
