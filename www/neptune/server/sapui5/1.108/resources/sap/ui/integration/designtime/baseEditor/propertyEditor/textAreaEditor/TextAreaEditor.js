/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor","sap/base/util/restricted/_isNil"],function(t,e){"use strict";var a=t.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.textAreaEditor.TextAreaEditor",{xmlFragment:"sap.ui.integration.designtime.baseEditor.propertyEditor.textAreaEditor.TextAreaEditor",metadata:{library:"sap.ui.integration"},renderer:t.getMetadata().getRenderer().render});a.configMetadata=Object.assign({},t.configMetadata,{allowBindings:{defaultValue:true,mergeStrategy:"mostRestrictiveWins"},typeLabel:{defaultValue:"BASE_EDITOR.TYPES.OBJECT"}});a.prototype.getDefaultValidators=function(){var e=this.getConfig();return Object.assign({},t.prototype.getDefaultValidators.call(this),{notABinding:{type:"notABinding",isEnabled:!e.allowBindings},maxLength:{type:"maxLength",isEnabled:typeof e.maxLength==="number",config:{maxLength:e.maxLength}}})};a.prototype.formatValue=function(t){t=JSON.stringify(t,null,"\t");if(typeof t==="object"&&!t.length){t=t.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g,function(t){return t.substring(3,t.length-3)})}return t};a.prototype._onLiveChange=function(){var t=this.getContent();var e=t.getValue();if(!e||e===""){this.setValue(undefined)}else{try{var a=JSON.parse(e);this.setValue(a)}catch(e){t.setValueState("Error");t.setValueStateText(this.getI18nProperty("BASE_EDITOR.VALIDATOR.NOT_A_JSONOBJECT"))}}};return a});
//# sourceMappingURL=TextAreaEditor.js.map