package com.avidz.NeuroNudge.platform

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.tasks.await

class CurrentLocationProvider(context: Context) {
    private val appContext = context.applicationContext
    private val client = LocationServices.getFusedLocationProviderClient(appContext)

    suspend fun getCurrentLocation(highAccuracy: Boolean = true): Location? {
        val fineGranted = ContextCompat.checkSelfPermission(
            appContext,
            Manifest.permission.ACCESS_FINE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED
        val coarseGranted = ContextCompat.checkSelfPermission(
            appContext,
            Manifest.permission.ACCESS_COARSE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED
        check(fineGranted || coarseGranted) { "Location permission is required" }

        val priority = if (highAccuracy && fineGranted) {
            Priority.PRIORITY_HIGH_ACCURACY
        } else {
            Priority.PRIORITY_BALANCED_POWER_ACCURACY
        }
        val cancellation = CancellationTokenSource()
        return try {
            client.getCurrentLocation(priority, cancellation.token).await()
                ?: client.lastLocation.await()
        } finally {
            cancellation.cancel()
        }
    }
}
