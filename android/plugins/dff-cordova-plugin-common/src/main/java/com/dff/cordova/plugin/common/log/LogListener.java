package com.dff.cordova.plugin.common.log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

public class LogListener extends AbstractLogListener {

	public void onLog(int type, String tag, String msg) {
		JSONObject logEvent = new JSONObject();
		
		try {
			logEvent.put("type", this.getLogType(type));
			logEvent.put("tag", tag);
			logEvent.put("msg", msg);
			
			this.sendPluginResult(logEvent);
		}
		catch (JSONException e) {
			Log.e(this.getClass().getName(), e.getMessage(), e);
			this.sendPluginResult(e);
		}
	}

	public void onLog(int type, String tag, Throwable tr) {
		JSONObject logEvent = new JSONObject();
		JSONArray jsonStackTrace = new JSONArray();
		StackTraceElement stackTrace[];
		
		try {
			logEvent.put("type", this.getLogType(type));
			logEvent.put("tag", tag);
			logEvent.put("tr", tr.toString());
			
			stackTrace = tr.getStackTrace();
			for (int i = 0; i < stackTrace.length; i++) {
				jsonStackTrace.put(stackTrace[i].toString());
			}
			
			logEvent.put("stackTrace", jsonStackTrace);
			
			this.sendPluginResult(logEvent);
		}
		catch (JSONException e) {
			Log.e(this.getClass().getName(), e.getMessage(), e);
			this.sendPluginResult(e);
		}
	}

	public void onLog(int type, String tag, String msg, Throwable tr) {
		JSONObject logEvent = new JSONObject();
		JSONArray jsonStackTrace = new JSONArray();
		StackTraceElement stackTrace[];
		
		try {
			logEvent.put("type", this.getLogType(type));
			logEvent.put("tag", tag);
			logEvent.put("msg", msg);
			logEvent.put("tr", tr.toString());
			
			stackTrace = tr.getStackTrace();
			for (int i = 0; i < stackTrace.length; i++) {
				jsonStackTrace.put(stackTrace[i].toString());
			}
			
			logEvent.put("stackTrace", jsonStackTrace);
			
			this.sendPluginResult(logEvent);
		}
		catch (JSONException e) {
			Log.e(this.getClass().getName(), e.getMessage(), e);
			this.sendPluginResult(e);
		}
	}
}
