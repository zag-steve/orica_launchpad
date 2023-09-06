# dff.CordovaPlugin.Common

## Supported Platforms
  * Android
  
  ## Plugin@latest
  
  - Android: 2.0.12-0

## Installation

```sh
$ cordova plugin add https://github.com/dff-solutions/dff.CordovaPlugin.Common.git
```
## Usage

### Actions

#### onLog
```js
/**
 * Listen to logs from any plugin.
 *
 * @name onLog
 * @param {function} success Success callback
 * @param {function} error Error callback
 */
CommonPlugin
    .onLog(function (log) {
        console.log(log.type, log.tag, log.msg);
    }, function(reason) {
        console.log(reason);
    });
```

#### setSystemProperty
```js
/**
 * Set a Java system property.
 * Args key value pairs are interpreted as system properties.
 *
 * @name setSystemProperty
 * @param {function} success Success callback
 * @param {function} error Error callback
 * @param {Object} args Named argument
 */
CommonPlugin
    .setSystemProperty(function () {
        console.log('success');
    }, function(reason) {
        console.log(reason);
    }, {
        "http.keepAlive": "false"
    });
```

## Documentation
- <a href="https://dff-solutions.github.io/dff.CordovaPlugin.Common/" target="_blank" >JAVA DOC</a>
