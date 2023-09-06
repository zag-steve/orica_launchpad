package com.dff.cordova.plugin.common.service.action;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;

import com.dff.cordova.plugin.common.service.ServiceHandler;

public class UnbindService extends ServiceAction {
	public static final String ACTION_NAME = "unbindService";
	
	public UnbindService(String action, JSONArray args,
			CallbackContext callbackContext, CordovaInterface cordova,
			ServiceHandler serviceHandler) {
		super(action, args, callbackContext, cordova, serviceHandler);
	}
	
	@Override
	public void run() {
		super.run();
		this.serviceHandler.unbindService();
		this.callbackContext.success();
	}
}
