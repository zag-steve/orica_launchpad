/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards","sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"],function(e,t){"use strict";function r(){e.TextInput.apply(this,arguments)}r.prototype=Object.create(e.TextInput.prototype);r.prototype.overrideInternalRender=function(){var r=e.TextInput.prototype.overrideInternalRender.call(this,arguments);t.overwriteLabel(this);t.overwriteRequired(this);return r};r.prototype.internalRender=function(){if(this.isMultiline){var e=document.createElement("ui5-textarea");e.id=this.id;e.placeholder=this.placeholder||"";e.value=this.defaultValue||"";e.maxlength=this.maxLength||null;t.createValueStateElement(this,e);e.addEventListener("input",function(){this.valueChanged()}.bind(this));return e}var r=document.createElement("ui5-input");switch(this.style){case 1:r.type="Tel";break;case 2:r.type="URL";break;case 3:r.type="Email";break;default:r.type="Text"}r.id=this.id;r.placeholder=this.placeholder||"";r.value=this.defaultValue||"";r.maxlength=this.maxLength||null;t.createValueStateElement(this,r);r.addEventListener("input",function(){this.valueChanged()}.bind(this));return r};r.prototype.updateInputControlAriaLabelledBy=function(){t.overwriteAriaLabelling(this,"accessible-name-ref")};r.prototype.showValidationErrorMessage=function(){if(this.renderedInputControlElement){this.renderedInputControlElement.valueState="Error"}};r.prototype.resetValidationFailureCue=function(){e.TextInput.prototype.resetValidationFailureCue.call(this,arguments);if(this.renderedInputControlElement){this.renderedInputControlElement.valueState="None"}};return r});
//# sourceMappingURL=UI5InputText.js.map