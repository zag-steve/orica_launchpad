/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/base/Object","sap/ui/Device"],function(e,t,i){"use strict";var n=t.extend("sap.ui.core.AccessKeysEnablement",{});n.controlRegistry=new Set;n.CSS_CLASS="sapUiAccKeysHighlighDom";n.bListenersAttached=false;var s=function(){var e=function(e){var t=e.getEnabled&&!e.getEnabled();if(t){return}if(e){e.setProperty("highlightAccKeysRef",true);e.onAccKeysHighlightStart&&e.onAccKeysHighlightStart()}};n.controlRegistry.forEach(function(t){e(t)})};var r=function(){var e=function(e){if(e){e.setProperty("highlightAccKeysRef",false);e.onAccKeysHighlightStart&&e.onAccKeysHighlightEnd()}};n.controlRegistry.forEach(function(t){e(t)})};n.attachKeydownListeners=function(){document.addEventListener("keydown",function(e){if(this.hasHighlightedElements()){e.preventDefault()}this.handleHighlightStart(e);document.addEventListener("keydown",function(e){if(this.hasHighlightedElements()){e.preventDefault()}}.bind(this),{once:true})}.bind(this));document.addEventListener("keyup",function(e){this.handleHighlightEnd(e)}.bind(this));window.addEventListener("blur",function(){this.handleHighlightEnd(true)}.bind(this))};n.handleHighlightStart=function(e){var t=e.altKey;var i=e.key;if(t){s();if(this.hasHighlightedElements()){var n=this.getElementToBeFocused(i);if(!n.length){return}var r=document.activeElement;var c=e.shiftKey;var o=n.indexOf(r);if(c){var a=n[o-1];if(a){a.focus()}else if(o===0){n[n.length-1].focus()}}else{var h=n[o+1];if(h){h.focus()}else if(o===n.length-1){n[0].focus()}}}}};n.hasHighlightedElements=function(){return document.getElementsByClassName(n.CSS_CLASS).length};n.handleHighlightEnd=function(e,t){if(!e.altKey||t){r()}};n.getElementToBeFocused=function(e){return[].filter.call(document.querySelectorAll("[data-ui5-accesskey='"+e.toLowerCase()+"']"),function(e){var t=sap.ui.getCore().byId(e.getAttribute("id"));var i=t.getEnabled?t.getEnabled():true;var n=t.getVisible();return i&&n}).map(function(e){e=sap.ui.getCore().byId(e.getAttribute("id"));return e.getAccessKeysFocusTarget?e.getAccessKeysFocusTarget():e.getFocusDomRef()})};n.registerControl=function(t){var s=e.getConfiguration().getAccKeys();if(i.os.macintosh){return}this.controlRegistry.add(t);if(s&&!this.bListenersAttached){this.attachKeydownListeners();n.bListenersAttached=true}var r=t.exit;t.exit=function(){n.controlRegistry.delete(t);r&&r.call(t)}};n.deregisterControl=function(e){n.registerControl.delete()};return n});
//# sourceMappingURL=AccessKeysEnablement.js.map