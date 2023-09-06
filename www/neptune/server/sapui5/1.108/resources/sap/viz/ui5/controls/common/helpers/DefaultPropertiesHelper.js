/*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/viz/ui5/format/ChartFormatter","sap/ui/Device","sap/ui/thirdparty/jquery"],function(e,t,jQuery){"use strict";var a={};var i={plotArea:{scrollbar:{spacing:2}},legend:{scrollbar:{spacing:2}}};var r=t.system.tablet||t.system.phone;var l={tooltip:{visible:false},general:{groupData:true},plotArea:{window:{start:"firstDataPoint"},dataLabel:{hideWhenOverlap:true,respectShapeWidth:true,style:{color:null}},dataPointSize:{min:r?40:24,max:96}},interaction:{behaviorType:"noHoverBehavior",selectability:{mode:"multiple"},zoom:{enablement:"enabled",direction:"categoryAxis"},enableKeyboard:true,enableInternalEvents:true},timeAxis:{label:{forceToShowFirstLastData:true}},categoryAxis:{label:{angle:45,rotation:"auto"}},legendGroup:{layout:{position:"auto",respectPlotPosition:false},forceToShow:true},legend:{isScrollable:true,selectionFeedback:true}};var u={plotArea:{primaryValuesColorPalette:["sapUiChartPaletteSequentialHue1","sapUiChartPaletteSequentialHue1Light2","sapUiChartPaletteSequentialHue1Dark1"],secondaryValuesColorPalette:["sapUiChartPaletteSequentialHue2","sapUiChartPaletteSequentialHue2Light2","sapUiChartPaletteSequentialHue2Dark1"]},valueAxis:{title:{style:{color:"sapUiChartPaletteSequentialHue1Dark1"}},axisLine:{visible:false},color:"sapUiChartPaletteSequentialHue1Dark1"},valueAxis2:{title:{style:{color:"sapUiChartPaletteSequentialHue2Dark1"}},axisLine:{visible:false},color:"sapUiChartPaletteSequentialHue2Dark1"}};a.getExtraProp=function(e){if(e==="fiori"&&r){return jQuery.extend(true,{},i)}else{return{}}};a._getFiori=function(e,t){var i=e.mergeProperties(t,{},a._general,a._specified[t.replace("info/","")]||{});var r=jQuery.extend(true,{},l);i=e.mergeProperties(t,r,i);if(/dual/.test(t)){i=e.mergeProperties(t,i,u)}return i};a.DEFAULT_FIORI_PROPS=l;a.FIORI_DUAL_PROPS=u;a.get=function(e,t,i){if(i==="fiori"){return a._getFiori(e,t)}else{return e.mergeProperties(t,{},a._general,a._specified[t.replace("info/","")]||{},h({},t))}};function s(e,t){if(e==null||t.legnth===0){return e}var a=e[t[0]];if(a&&a.children){return s(a.children,t.slice(1))}return a}function n(e,t,a){if(t.length===0){return a}e=e||{};var i=e[t[0]];e[t[0]]=n(i,t.slice(1),a);return e}var o="u";var p=[["valueAxis","label","formatString"],["valueAxis2","label","formatString"]];function h(e,t){var a=sap.viz.api.metadata.Viz.get(t);if(a){var i=a.properties;p.forEach(function(t){var a=s(i,t);if(a&&a.hasOwnProperty("defaultValue")){n(e,t,o)}})}return e}a.applyDefaultFormatString=h;a._general={title:{visible:true},legend:{visible:true},plotArea:{animation:{dataLoading:false,dataUpdating:false,resizing:false},colorPalette:["sapUiChartPaletteQualitativeHue1","sapUiChartPaletteQualitativeHue2","sapUiChartPaletteQualitativeHue3","sapUiChartPaletteQualitativeHue4","sapUiChartPaletteQualitativeHue5","sapUiChartPaletteQualitativeHue6","sapUiChartPaletteQualitativeHue7","sapUiChartPaletteQualitativeHue8","sapUiChartPaletteQualitativeHue9","sapUiChartPaletteQualitativeHue10","sapUiChartPaletteQualitativeHue11","sapUiChartPaletteQualitativeHue12","sapUiChartPaletteQualitativeHue13","sapUiChartPaletteQualitativeHue14","sapUiChartPaletteQualitativeHue15","sapUiChartPaletteQualitativeHue16","sapUiChartPaletteQualitativeHue17","sapUiChartPaletteQualitativeHue18","sapUiChartPaletteQualitativeHue19","sapUiChartPaletteQualitativeHue20","sapUiChartPaletteQualitativeHue21","sapUiChartPaletteQualitativeHue22"],primaryValuesColorPalette:["sapUiChartPaletteSequentialHue1Light1","sapUiChartPaletteSequentialHue1","sapUiChartPaletteSequentialHue1Dark1"],secondaryValuesColorPalette:["sapUiChartPaletteSequentialHue2Light1","sapUiChartPaletteSequentialHue2","sapUiChartPaletteSequentialHue2Dark1"]}};var P={plotArea:{nullColor:"sapUiChoroplethRegionBG",colorPalette:["sapUiChartPaletteSequentialHue1Light2","sapUiChartPaletteSequentialHue1Light1","sapUiChartPaletteSequentialHue1","sapUiChartPaletteSequentialHue1Dark1","sapUiChartPaletteSequentialHue1Dark2"]}};a._specified={heatmap:P,treemap:P};return a});
//# sourceMappingURL=DefaultPropertiesHelper.js.map