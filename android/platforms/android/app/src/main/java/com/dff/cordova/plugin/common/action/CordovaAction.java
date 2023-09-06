package com.dff.cordova.plugin.common.action;

import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public abstract class CordovaAction implements Runnable {
    private static final String LOG_TAG = "CordovaAction";
    protected String action;
    protected JSONArray args;
    protected CallbackContext callbackContext;
    protected CordovaInterface cordova;
    public CordovaAction(String action, JSONArray args, CallbackContext callbackContext, CordovaInterface cordova) {
        this.action = action;
        this.args = args;
        this.callbackContext = callbackContext;
        this.cordova = cordova;
    }

    public String getAction() {
        return action;
    }

    /**
     * Tests if args are available and all required parameters exist.
     *
     * @param args    JSONArray where at index 0 a JSONObect is expected
     * @param reqArgs String[] which lists all required args
     * @return JSONObject jsonArgs if args exist and all required parameters are
     * available
     * @throws JSONException
     * @throws Exception
     */
    protected JSONObject checkJsonArgs(JSONArray args, String[] reqArgs) throws JSONException, Exception {
        if (args.isNull(0)) {
            throw new Exception("args missing");
        } else {
            JSONObject jsonArgs = args.getJSONObject(0);

            for (String arg : reqArgs) {
                if (jsonArgs.isNull(arg)) {
                    throw new Exception("missing arg " + arg);
                }
            }

            return jsonArgs;
        }
    }

    /**
     * Log a message which action is running
     */
    @Override
    public void run() {
        Log.v(LOG_TAG, "running action: " + this.action);
    }

}
