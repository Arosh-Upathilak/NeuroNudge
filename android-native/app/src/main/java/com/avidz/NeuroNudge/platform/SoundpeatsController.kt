package com.avidz.NeuroNudge.platform

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.Closeable
import java.util.UUID

class SoundpeatsController(context: Context) : Closeable {
    data class Device(val name: String, val address: String)

    sealed interface ConnectionState {
        data object Disconnected : ConnectionState
        data object Connecting : ConnectionState
        data class Connected(val device: Device) : ConnectionState
        data class Error(val message: String) : ConnectionState
    }

    private val appContext = context.applicationContext
    private val adapter = appContext.getSystemService(BluetoothManager::class.java).adapter
    private val mutex = Mutex()
    private var socket: BluetoothSocket? = null
    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    @SuppressLint("MissingPermission")
    fun bondedSoundpeatsDevices(): List<Device> {
        requireConnectPermission()
        return adapter?.bondedDevices.orEmpty().mapNotNull { bluetoothDevice ->
            val name = bluetoothDevice.name ?: return@mapNotNull null
            if (isSupportedName(name)) Device(name, bluetoothDevice.address) else null
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun connect(address: String? = null): Device = withContext(Dispatchers.IO) {
        mutex.withLock {
            requireConnectPermission()
            val bluetoothAdapter = checkNotNull(adapter) { "Bluetooth is not supported" }
            check(bluetoothAdapter.isEnabled) { "Bluetooth is disabled" }
            val bonded = bluetoothAdapter.bondedDevices.firstOrNull { device ->
                isSupportedName(device.name) && (address == null || device.address == address)
            } ?: error("No bonded SOUNDPEATS Mini Pro HS device found")

            _connectionState.value = ConnectionState.Connecting
            socket?.close()
            var newSocket: BluetoothSocket? = null
            try {
                newSocket = bonded.createRfcommSocketToServiceRecord(SPP_UUID)
                newSocket.connect()
                socket = newSocket
                val result = Device(bonded.name ?: "SOUNDPEATS", bonded.address)
                _connectionState.value = ConnectionState.Connected(result)
                result
            } catch (error: Exception) {
                newSocket?.runCatching { close() }
                socket = null
                _connectionState.value = ConnectionState.Error(error.message ?: "Bluetooth connection failed")
                throw error
            }
        }
    }

    suspend fun setMode(mode: Int) = withContext(Dispatchers.IO) {
        require(mode in 0..255) { "Mode must fit in one byte" }
        mutex.withLock {
            val connectedSocket = socket?.takeIf { it.isConnected }
                ?: error("SOUNDPEATS device is not connected")
            val payload = byteArrayOf(
                0xFF.toByte(), 0x04, 0x00, 0x01, 0x00, 0x0A, 0x03, 0x11, mode.toByte(),
            )
            connectedSocket.outputStream.write(payload)
            connectedSocket.outputStream.flush()
        }
    }

    suspend fun disconnect() = withContext(Dispatchers.IO) {
        mutex.withLock {
            socket?.close()
            socket = null
            _connectionState.value = ConnectionState.Disconnected
        }
    }

    override fun close() {
        socket?.runCatching { close() }
        socket = null
        _connectionState.value = ConnectionState.Disconnected
    }

    private fun requireConnectPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            check(ContextCompat.checkSelfPermission(appContext, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) {
                "BLUETOOTH_CONNECT permission is required"
            }
        }
    }

    private fun isSupportedName(name: String?): Boolean {
        return name?.contains("Mini Pro HS", ignoreCase = true) == true ||
            name?.contains("SOUNDPEATS", ignoreCase = true) == true
    }

    companion object {
        private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
    }
}
