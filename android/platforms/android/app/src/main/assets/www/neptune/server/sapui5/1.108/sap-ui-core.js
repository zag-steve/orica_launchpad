(function() {
  var oCurrentScript = document.currentScript;
  if (!oCurrentScript) {
    for (var i = 0, l = document.scripts.length; i < l; i++) {
      var oScript = document.scripts[i];
      if (/\/resources\/(?:sap-ui-(?:core(?:-nojQuery)?|integration))\.js/.test(oScript.src)) {
        oCurrentScript = oScript;
        break;
      }
    }
    if (!oCurrentScript) {
      document.execCommand("Stop");
      throw new Error("Patch-level independent bootstrap script not found!");
    }
  }
  if (oCurrentScript.getAttribute("data-sap-ui-async") !== "true") {
    document.execCommand("Stop");
    throw new Error("Patch-level independent bootstrap is only supported, if UI5 bootstrap script defines the attribute data-sap-ui-async=\"true\"!");
  }
  var src = oCurrentScript.src;
  var iIdxVer = src.indexOf('/1.108/');
  var sHostname = src.substring(0, iIdxVer);
  window["sap-ui-config"] = window["sap-ui-config"] || {};
  window["sap-ui-config"].resourceRoots = window["sap-ui-config"].resourceRoots || {};
  window["sap-ui-config"].resourceRoots[""] = sHostname + "/1.108/resources/";
  var oScript = document.createElement("script");
  oScript.id = "sap-ui-bootstrap-cachebusted";
  oScript.src = sHostname + "/1.108/resources/sap-ui-core.js";
  document.head.appendChild(oScript);
})();