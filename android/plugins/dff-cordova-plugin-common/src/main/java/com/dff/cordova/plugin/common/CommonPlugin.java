package com.dff.cordova.plugin.common;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import com.dff.cordova.plugin.common.action.CordovaAction;
import com.dff.cordova.plugin.common.log.CordovaPluginLog;
import com.dff.cordova.plugin.common.log.LogListener;
import com.dff.cordova.plugin.common.system.action.SetSystemProperty;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;

public class CommonPlugin extends CordovaPlugin {

    private static final String LOG_TAG = "CommonPlugin";

    protected static ArrayList<String> sPermissionsList = new ArrayList<>();
    private static final int PERMISSION_REQUEST_CODE = 100;
    // log service
    protected static LogListener logListener;
    protected HashMap<String, Class<? extends CordovaAction>> actions;
    private String childLogTag = "";

    public CommonPlugin() {
        super();
        this.actions = new HashMap<>();

        this.actions.put(SetSystemProperty.ACTION, SetSystemProperty.class);
    }

    public CommonPlugin(String childLogTag) {
        this();
        this.childLogTag = childLogTag;
    }

    /**
     * Called after plugin construction and fields have been initialized.
     */
    @Override
    public void pluginInitialize() {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "pluginInitialize");
        super.pluginInitialize();

        if (logListener == null) {
            logListener = new LogListener();
            CordovaPluginLog.addLogListner(logListener);
        }
    }

    /**
     * allow subclass to add their permission to the local permissions list
     *
     * @param permission - the permission to add
     */
    public static synchronized void addPermission(String permission) {
        if (!sPermissionsList.contains(permission)) {
            sPermissionsList.add(permission);
        }
    }

    /**
     * request permissions if they are not granted
     */
    private void requestPermissions() {
        for (String permission : sPermissionsList) {
            if (!cordova.hasPermission(permission)) {
                cordova.requestPermissions(this, PERMISSION_REQUEST_CODE,
                    sPermissionsList.toArray(new String[sPermissionsList.size()]));
                break;
            }
        }
    }

    /**
     * If permissions are denied log and error and leave method
     *
     * @param requestCode
     * @param permissions
     * @param grantResults
     * @throws JSONException
     */
    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException {
        for (int r : grantResults) {
            if (r == PackageManager.PERMISSION_DENIED) {
                CordovaPluginLog.e(LOG_TAG, "PERMISSION DENIED");
                return;
            }
        }
    }

    /**
     * Called when the system is about to start resuming a previous activity.
     *
     * @param multitasking Flag indicating if multitasking is turned on for app
     */
    @Override
    public void onPause(boolean multitasking) {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onPause - multitasking: " + multitasking);
        super.onPause(multitasking);
    }

    /**
     * Called when the activity will start interacting with the user.
     *
     * @param multitasking Flag indicating if multitasking is turned on for app
     */
    @Override
    public void onResume(boolean multitasking) {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onResume - multitasking: " + multitasking);
        super.onResume(multitasking);
    }

    /**
     * Called when the activity is becoming visible to the user.
     */
    @Override
    public void onStart() {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onStart");
        super.onStart();
        requestPermissions();
    }

    /**
     * Called when the activity is no longer visible to the user.
     */
    @Override
    public void onStop() {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onStop");
        super.onStop();
    }

    /**
     * Called when the activity receives a new intent.
     */
    @Override
    public void onNewIntent(Intent intent) {
        Log.d(
            LOG_TAG + "(" + this.childLogTag + ")",
            "onNewIntent: " + intent.getAction() + " " + intent.getType() + " " + intent.getScheme());
        super.onNewIntent(intent);
    }

    /**
     * The final call you receive before your activity is destroyed.
     */
    @Override
    public void onDestroy() {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onDestroy");
        super.onDestroy();
    }

    /**
     * Called when the Activity is being destroyed (e.g. if a plugin calls out
     * to an external Activity and the OS kills the CordovaActivity in the
     * background). The plugin should save its state in this method only if it
     * is awaiting the result of an external Activity and needs to preserve some
     * information so as to handle that result;
     * onRestoreStateForActivityResult() will only be called if the plugin is
     * the recipient of an Activity result
     *
     * @return Bundle containing the state of the plugin or null if state does
     * not need to be saved
     */
    @Override
    public Bundle onSaveInstanceState() {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onSaveInstanceState");
        return super.onSaveInstanceState();
    }

    /**
     * Called when a plugin is the recipient of an Activity result after the
     * CordovaActivity has been destroyed. The Bundle will be the same as the
     * one the plugin returned in onSaveInstanceState()
     *
     * @param state           Bundle containing the state of the plugin
     * @param callbackContext Replacement Context to return the plugin result to
     */
    @Override
    public void onRestoreStateForActivityResult(Bundle state, CallbackContext callbackContext) {
        Log.d(
            LOG_TAG + "(" + this.childLogTag + ")",
            "onRestoreStateForActivityResult -" + " bundle: " + state.toString() + "; callbackContext: "
                + callbackContext.toString());

        super.onRestoreStateForActivityResult(state, callbackContext);
    }

    /**
     * Called when a message is sent to plugin.
     *
     * @param id   The message id
     * @param data The message data
     * @return Object to stop propagation or null
     */
    @Override
    public Object onMessage(String id, Object data) {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")",
            "onMessage - " + " id: " + id + "; data: " + data);

        return super.onMessage(id, data);
    }

    /**
     * Called when the WebView does a top-level navigation or refreshes.
     * <p>
     * Plugins should stop any long-running processes and clean up internal
     * state.
     * <p>
     * Does nothing by default.
     */
    @Override
    public void onReset() {
        Log.d(LOG_TAG + "(" + this.childLogTag + ")", "onReset");
        super.onReset();
    }

    /**
     * Executes the request.
     * <p>
     * This method is called from the WebView thread. To do a non-trivial amount
     * of work, use: cordova.getThreadPool().execute(runnable);
     * <p>
     * To run on the UI thread, use:
     * cordova.getActivity().runOnUiThread(runnable);
     *
     * @param action          The action to execute.
     * @param args            The exec() arguments.
     * @param callbackContext The callback context used when calling back into JavaScript.
     * @return Whether the action was valid.
     */
    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext)
        throws JSONException {

        Log.v(LOG_TAG + "(" + this.childLogTag + ")", "call for action: " + action + "; args: " + args);

        CordovaAction cordovaAction;

        if (action.equals("onLog")) {
            if (logListener != null) {
                logListener.setCallBack(callbackContext);
            } else {
                Log.e(LOG_TAG, "log listener not initialized");
            }

            return true;
        } else if (this.actions.containsKey(action)) {
            Class<? extends CordovaAction> actionClass = this.actions.get(action);

            Log.d(LOG_TAG, "found action: " + actionClass.getName());

            try {
                cordovaAction = actionClass
                    .getConstructor(
                        String.class,
                        JSONArray.class,
                        CallbackContext.class,
                        CordovaInterface.class)
                    .newInstance(
                        action,
                        args,
                        callbackContext,
                        this.cordova);
                if (cordovaAction != null) {
                    this.cordova.getThreadPool().execute(cordovaAction);
                    return true;
                }
            } catch (
                InstantiationException |
                    IllegalAccessException |
                    InvocationTargetException |
                    IllegalArgumentException |
                    NoSuchMethodException |
                    SecurityException e) {
                CordovaPluginLog.e(LOG_TAG, "Error: ", e);
                return false;
            }
        }
        return false;
    }
}
