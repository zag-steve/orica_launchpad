package com.dff.cordova.plugin.common.system.action;

import java.util.Iterator;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.dff.cordova.plugin.common.action.CordovaAction;
import com.dff.cordova.plugin.common.log.CordovaPluginLog;

public class SetSystemProperty extends CordovaAction {
	private static final String TAG = "com.dff.cordova.plugin.common.system.action.SetSystemProperty";
	
	public static final String ACTION = "setSystemProperty";

	public SetSystemProperty(String action, JSONArray args, CallbackContext callbackContext, CordovaInterface cordova) {
		super(action, args, callbackContext, cordova);
	}

	@Override
	public void run() {
		try {
			String propKey;
			String propValue;
			JSONObject jsonArgs = args.getJSONObject(0);
			
			@SuppressWarnings("unchecked")
			Iterator<String> propKeys = jsonArgs.keys();
			
			while (propKeys.hasNext()) {
				propKey = propKeys.next();
				propValue = jsonArgs.getString(propKey);
//				CordovaPluginLog.d(TAG, "set system property: " + propKey + " " + propValue);
				System.setProperty(propKey, propValue);
			}
			
			this.callbackContext.success();
		}
		catch(JSONException e) {
			CordovaPluginLog.e(TAG, e.getMessage(), e);
			this.callbackContext.error(e.getMessage());
		}
	}
}
