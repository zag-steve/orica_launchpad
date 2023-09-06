package com.dff.cordova.plugin.common.service.action;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;

import com.dff.cordova.plugin.common.service.ServiceHandler;

public class BindService extends ServiceAction {
	public static final String ACTION_NAME = "bindService";
	
	public BindService(String action, JSONArray args,
			CallbackContext callbackContext, CordovaInterface cordova,
			ServiceHandler serviceHandler) {
		super(action, args, callbackContext, cordova, serviceHandler);
	}
	
	@Override
	public void run() {
		super.run();
		boolean hasBound = this.serviceHandler.bindService();
		
		if (hasBound) {
			this.callbackContext.success();			
		}
		else {
			this.callbackContext.error("could not bind service");
		}
	}
}
