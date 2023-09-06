package com.dff.cordova.plugin.common;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public abstract class AbstractPluginListener {
    protected CallbackContext callback;

    public static void sendPluginResult(CallbackContext callback) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK);
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, JSONObject message) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, message);
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, JSONArray message) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, message);
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, String message) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, message);
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, boolean b) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, b);
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, int i) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, i);
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, JSONException je) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, je.getMessage());
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public static void sendPluginResult(CallbackContext callback, Exception e) {
        if (callback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }

    public void setCallBack(CallbackContext callback) {
        this.callback = callback;
    }

    public void onDestroy() {
        if (this.callback != null) {
            this.callback.success();
        }
    }

    protected void sendPluginResult() {
        sendPluginResult(this.callback);
    }

    protected void sendPluginResult(JSONObject message) {
        sendPluginResult(this.callback, message);
    }

    protected void sendPluginResult(JSONArray message) {
        sendPluginResult(this.callback, message);
    }

    protected void sendPluginResult(String message) {
        sendPluginResult(this.callback, message);
    }

    protected void sendPluginResult(boolean b) {
        sendPluginResult(this.callback, b);
    }

    protected void sendPluginResult(int i) {
        sendPluginResult(this.callback, i);
    }

    protected void sendPluginResult(JSONException je) {
        sendPluginResult(this.callback, je);
    }

    protected void sendPluginResult(Exception e) {
        sendPluginResult(this.callback, e);
    }
}
