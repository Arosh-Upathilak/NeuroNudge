package com.aisee.glasses.core

enum class ConnectionState {
    IDLE,
    SCANNING,
    CONNECTING,
    CONNECTED,
    INITIALIZING,
    READY,
    DISCONNECTED,
    ERROR
}

enum class AiseeError {
    NOT_INITIALIZED,
    BLUETOOTH_DISABLED,
    DEVICE_NOT_FOUND,
    CONNECTION_FAILED,
    INIT_FAILED,
    VOICE_NOT_STARTED,
    PHOTO_FAILED,
    STT_FAILED,
    UNKNOWN
}