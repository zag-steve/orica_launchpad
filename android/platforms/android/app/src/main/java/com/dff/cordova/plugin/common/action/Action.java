package com.dff.cordova.plugin.common.action;

import com.dff.cordova.plugin.common.interfaces.Executable;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;

/**
 * Created by anahas on 19.06.2017.
 *
 * @author Anthony Nahas
 * @version 2.0
 * @since 19.06.17
 */

public abstract class Action implements Executable {

    private CallbackContext mCallbackContext;
    private JSONArray mArgs;

    public CallbackContext getCallbackContext() {
        return mCallbackContext;
    }

    public JSONArray getArgs() {
        return mArgs;
    }

    public Action with(CallbackContext callbackContext) {
        this.mCallbackContext = callbackContext;
        return this;
    }

    public Action andHasArguments(JSONArray args) {
        this.mArgs = args;
        return this;
    }
}
