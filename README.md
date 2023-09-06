# pd_cdv_planet8_ps1_std
Cordova build files for PS1 Planet8 Mobile Client

Mobile Client: MOBILE_STANDARD
Launchpad: NEPTUNE_LAUNCHPAD_STANDARD

## Neptune
- Version 22.10.0009

## Changes
### 22.10.09.00
- Split Android and iOS into separate projects sharing the same www folder by linking
- Removed plugin definitions from config.xml (deprecated)
- Removed android plugins from ios and vice-versa
- Removed android preferences from ios and vice-versa
- Updated android SQL plugin to 0.18.0
- Android to APK 33 support with cordova-android@12.0.0
- Android uses GT Tohu vector image
- iOS updated to cordova-ios@7.0.0

### 21.10.17.2

- Update to Neptune 21.10.0017
- Add new splash screens for Android and ios

### 6.0.19.3

Added new plugins:
- cordova-plguin-chooser: github:soltius/cordova-plugin-chooser,
- cordova-sqlite-evcore-extbuild-free: ^0.14.0,
- es6-promise-plugin: ^4.2.2,
- cordova-plugin-add-swift-support: ^2.0.2

### 6.0.19.2 

- Set cordova-sqlite-evcore-extbuild-free@0.14.0 (blueworx.freshdesk.com/support/discussions/topics/19000031280)

### 6.0.19.1
- Add library usage descriptions

### 6.0.19.0
- Update to Neptune 6.0.19

### 5.5.6.12
- Incorporated some config.xml updates from Planet 8 v6.0.7

### 5.5.6.11
- Updated URLs to use zag.solutions as aws.soltius.co.nz has been discontinued
- Removed (D) from description.  Separate app will be used for the debug version
### 5.5.6.10
- Extra logout for windows

### 5.5.6.9
- New updated from Neptune Cockpit
- Updated UI5 version
- Re-applied compatibility.js fix
- Re-applied Neptune app namespace fix
- Testing fix on tile container resize (Dave alert!)

### 5.5.6.7
- Align with PhoneGap Build Version Number
- fix deviceready event 
- Add iOS initial connectivity fix
- Add Neptune app namespace fix
- New Leaflet content for map edit

### 5.5.6.3
- compatibility.js fixes for iOS map panning

### 5.5.6.2
- Recomended Neptune Version for both system default and mobile client

### 5.5.6.1
- Setting UI5 version to 1.54

### 5.5.6.0
- Updated base code to Neptune 5.5.6.0
- Updated leaflet code
- Failed due to UI5 verison conflict (see to 1.60, but system default was 1.44)

## Highlights
- Includes Client Endpoint Certificate.
