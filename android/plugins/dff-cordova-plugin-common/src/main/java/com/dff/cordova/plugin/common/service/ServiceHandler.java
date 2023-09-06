package com.dff.cordova.plugin.common.service;

import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;
import com.dff.cordova.plugin.common.AbstractPluginListener;
import com.dff.cordova.plugin.common.log.CordovaPluginLog;
import org.apache.cordova.CordovaInterface;

import java.util.ArrayList;

public class ServiceHandler extends AbstractPluginListener implements ServiceConnection {
    private static final String TAG = "ServiceHandler";
    protected ArrayList<Message> mMessages = new ArrayList<>();
    private boolean isBound = false;
    private CordovaInterface cordova;
    private Class<? extends Service> serviceClass;
    private Messenger service;

    public ServiceHandler(CordovaInterface cordova, Class<? extends Service> serviceClass) {
        this.cordova = cordova;
        this.serviceClass = serviceClass;
    }

    public boolean bindService() {
        Intent bindIntent = new Intent(this.cordova.getActivity(), this.serviceClass);
        Log.d(TAG, "bind service " + bindIntent.toString());
        return this.cordova.getActivity().bindService(bindIntent, this, Context.BIND_AUTO_CREATE);
    }

    public void unbindService() {
        Log.d(TAG, "unbind service " + this.serviceClass.toString());
        if (isBound) {
            this.cordova.getActivity().unbindService(this);
        }
        this.isBound = false;
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        Log.d(TAG, "onServiceConnected: " + name.toString());
        this.setService(new Messenger(service));
        this.isBound = true;
        super.sendPluginResult(true);

        // send queued messages to service
        for (Message msg : mMessages) {
            try {
                this.service.send(msg);
            } catch (RemoteException e) {
                CordovaPluginLog.e(TAG, e.getMessage(), e);
            }
        }
        mMessages.clear();
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        Log.d(TAG, "onServiceDisconnected: " + name.toString());
        setService(null);
        this.isBound = false;
        super.sendPluginResult(false);
    }

    public Messenger getService() {
        return this.service;
    }

    public void setService(Messenger service) {
        this.service = service;
    }

    public boolean isBound() {
        return isBound;
    }

    public boolean queueMessage(Message msg) {
        return this.mMessages.add(msg);
    }
}
