package com.avidz.NeuroNudge

import android.app.Application
import com.avidz.NeuroNudge.data.ApiRepository
import com.avidz.NeuroNudge.data.AuthRepository
import com.avidz.NeuroNudge.data.PreferencesRepository
import com.avidz.NeuroNudge.platform.NotificationScheduler

class NeuroNudgeApplication : Application() {
    val preferences by lazy { PreferencesRepository(this) }
    val api by lazy { ApiRepository(this) }
    val auth by lazy { AuthRepository(api) }

    override fun onCreate() {
        super.onCreate()
        NotificationScheduler.createChannel(this)
    }
}
