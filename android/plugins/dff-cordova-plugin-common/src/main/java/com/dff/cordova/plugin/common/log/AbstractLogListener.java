package com.dff.cordova.plugin.common.log;

import com.dff.cordova.plugin.common.AbstractPluginListener;

import android.util.Log;

public abstract class AbstractLogListener
	extends AbstractPluginListener
	implements LogListenerInterface {
	
	protected String getLogType(int type) {
		String logType;
		
		switch (type) {
		case Log.DEBUG:
			logType = "DEBUG";
			break;
		case Log.ERROR:
			logType = "ERROR";
			break;
		case Log.INFO:
			logType = "INFO";
			break;
		case Log.VERBOSE:
			logType = "VERBOSE";
			break;
		case Log.WARN:
			logType = "WARN";
			break;

		default:
			logType = "UNKNOWN";
			break;
		}
		
		return logType;
	}

	@Override
	public void onLog(int type, String tag, String msg) {}

	@Override
	public void onLog(int type, String tag, Throwable tr) {}

	@Override
	public void onLog(int type, String tag, String msg, Throwable tr) {}

}
