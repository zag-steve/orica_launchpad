package com.dff.cordova.plugin.common.service;

import android.os.Build;
import androidx.annotation.RequiresApi;
import android.util.Log;
import com.dff.cordova.plugin.common.CommonPlugin;
import com.dff.cordova.plugin.common.action.CordovaAction;
import com.dff.cordova.plugin.common.log.CordovaPluginLog;
import com.dff.cordova.plugin.common.service.action.BindService;
import com.dff.cordova.plugin.common.service.action.ServiceAction;
import com.dff.cordova.plugin.common.service.action.UnbindService;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;

public abstract class CommonServicePlugin extends CommonPlugin {
    private static final String TAG = "CommonServicePlugin";
    protected ServiceHandler serviceHandler;
    private HashMap<String, Class<? extends ServiceAction>> actions =
        new HashMap<String, Class<? extends ServiceAction>>();

    public CommonServicePlugin(String TAG) {
        super(TAG);

        this.actions.put(BindService.ACTION_NAME, BindService.class);
        this.actions.put(UnbindService.ACTION_NAME, UnbindService.class);
    }

    public void pluginInitialize(ServiceHandler serviceHandler) {
        super.pluginInitialize();
        this.serviceHandler = serviceHandler;
    }

    @Override
    public void onDestroy() {
        if (this.serviceHandler != null) {
            this.serviceHandler.unbindService();
        }
        super.onDestroy();
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
    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext)
        throws JSONException {
        Log.v(TAG, "call for action: " + action + "; args: " + args);

        CordovaAction cordovaAction = null;

        if (action.equals("onServiceConnectionChange")) {
            this.serviceHandler.setCallBack(callbackContext);
            return true;
        } else if (this.actions.containsKey(action)) {
            Class<? extends ServiceAction> actionClass = this.actions.get(action);

            Log.d(TAG, "found action: " + actionClass.getName());

            try {
                cordovaAction = actionClass.getConstructor(
                    String.class,
                    JSONArray.class,
                    CallbackContext.class,
                    CordovaInterface.class,
                    ServiceHandler.class)
                    .newInstance(action, args, callbackContext, this.cordova, this.serviceHandler);
            } catch
                (InstantiationException
                    | IllegalAccessException
                    | IllegalArgumentException
                    | InvocationTargetException
                    | NoSuchMethodException
                    | SecurityException e) {
                CordovaPluginLog.e(TAG, e.getMessage(), e);
            }
        }

        if (cordovaAction != null) {
            this.cordova.getThreadPool().execute(cordovaAction);
            return true;
        }

        return super.execute(action, args, callbackContext);
    }
}
