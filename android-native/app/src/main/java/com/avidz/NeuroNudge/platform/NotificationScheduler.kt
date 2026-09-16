package com.avidz.NeuroNudge.platform

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.avidz.NeuroNudge.R
import java.util.Calendar
import java.util.concurrent.TimeUnit

object NotificationScheduler {
    const val CHANNEL_ID = "daily_nudges"
    private const val WORK_NAME = "daily_8am_notification"
    private const val DEFAULT_TITLE = "NeuroNudge"
    private const val DEFAULT_MESSAGE = "Take a moment to check in with yourself."

    fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            context.getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Daily NeuroNudge reminders"
            setSound(null, null)
            enableVibration(false)
        }
        context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    fun scheduleDaily(
        context: Context,
        title: String = DEFAULT_TITLE,
        message: String = DEFAULT_MESSAGE,
    ) {
        enqueue(context, title, message, ExistingWorkPolicy.REPLACE)
    }

    fun cancel(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
    }

    internal fun scheduleNext(context: Context, title: String, message: String) {
        enqueue(context, title, message, ExistingWorkPolicy.APPEND_OR_REPLACE)
    }

    private fun enqueue(
        context: Context,
        title: String,
        message: String,
        policy: ExistingWorkPolicy,
    ) {
        val request = OneTimeWorkRequestBuilder<DailyNotificationWorker>()
            .setInitialDelay(delayUntilNextEightAm(), TimeUnit.MILLISECONDS)
            .setInputData(
                Data.Builder()
                    .putString(DailyNotificationWorker.KEY_TITLE, title)
                    .putString(DailyNotificationWorker.KEY_MESSAGE, message)
                    .build(),
            )
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(WORK_NAME, policy, request)
    }

    private fun delayUntilNextEightAm(nowMillis: Long = System.currentTimeMillis()): Long {
        val target = Calendar.getInstance().apply {
            timeInMillis = nowMillis
            set(Calendar.HOUR_OF_DAY, 8)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= nowMillis) add(Calendar.DAY_OF_YEAR, 1)
        }
        return target.timeInMillis - nowMillis
    }
}

class DailyNotificationWorker(
    appContext: Context,
    params: WorkerParameters,
) : Worker(appContext, params) {
    override fun doWork(): Result {
        val title = inputData.getString(KEY_TITLE) ?: "NeuroNudge"
        val message = inputData.getString(KEY_MESSAGE)
            ?: "Take a moment to check in with yourself."

        NotificationScheduler.createChannel(applicationContext)
        if (Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(
                applicationContext,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            val launchIntent = applicationContext.packageManager
                .getLaunchIntentForPackage(applicationContext.packageName)
            val pendingIntent = launchIntent?.let {
                PendingIntent.getActivity(
                    applicationContext,
                    0,
                    it.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
            }
            val notification = NotificationCompat.Builder(applicationContext, NotificationScheduler.CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setAutoCancel(true)
                .setSilent(true)
                .setContentIntent(pendingIntent)
                .build()
            NotificationManagerCompat.from(applicationContext)
                .notify(DAILY_NOTIFICATION_ID, notification)
        }

        NotificationScheduler.scheduleNext(applicationContext, title, message)
        return Result.success()
    }

    companion object {
        internal const val KEY_TITLE = "title"
        internal const val KEY_MESSAGE = "message"
        private const val DAILY_NOTIFICATION_ID = 800
    }
}
