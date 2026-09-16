package com.aisee.glasses.core

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.Image
import android.media.MediaCodec
import android.media.MediaFormat
import android.util.Log
import java.io.ByteArrayOutputStream

object H264Decoder {
    private const val TAG = "H264Decoder"

    /**
     * Decodes a raw H.264 byte array into a Bitmap.
     * @param h264Data The raw H.264 stream (e.g., concatenated NAL units).
     * @param width The width of the video.
     * @param height The height of the video.
     * @return A decoded Bitmap, or null if decoding fails.
     */
    fun decodeFrame(h264Data: ByteArray, width: Int = 1280, height: Int = 720): Bitmap? {
        var decoder: MediaCodec? = null
        try {
            val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height)
            // Ensure the decoder outputs YUV_420_888 so we can read it easily
            format.setInteger(MediaFormat.KEY_COLOR_FORMAT, android.media.MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible)
            
            decoder = MediaCodec.createDecoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            decoder.configure(format, null, null, 0)
            decoder.start()

            // 1. Queue the H.264 data
            val inIndex = decoder.dequeueInputBuffer(10000)
            if (inIndex >= 0) {
                val inputBuffer = decoder.getInputBuffer(inIndex)
                inputBuffer?.clear()
                inputBuffer?.put(h264Data)
                decoder.queueInputBuffer(inIndex, 0, h264Data.size, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
            }

            // 2. Dequeue the decoded image
            val bufferInfo = MediaCodec.BufferInfo()
            var outIndex = decoder.dequeueOutputBuffer(bufferInfo, 100000)
            
            var tries = 0
            while (outIndex < 0 && tries < 50) {
                outIndex = decoder.dequeueOutputBuffer(bufferInfo, 10000)
                tries++
            }

            if (outIndex >= 0) {
                val outputImage = decoder.getOutputImage(outIndex)
                if (outputImage != null) {
                    val nv21Bytes = YUV_420_888toNV21(outputImage)
                    val yuvImage = YuvImage(nv21Bytes, ImageFormat.NV21, outputImage.width, outputImage.height, null)
                    
                    val outStream = ByteArrayOutputStream()
                    yuvImage.compressToJpeg(Rect(0, 0, outputImage.width, outputImage.height), 100, outStream)
                    val jpegBytes = outStream.toByteArray()
                    
                    val bitmap = BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.size)
                    
                    outputImage.close()
                    decoder.releaseOutputBuffer(outIndex, false)
                    return bitmap
                }
                decoder.releaseOutputBuffer(outIndex, false)
            } else {
                Log.e(TAG, "Failed to get output buffer. outIndex=$outIndex")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error decoding H264 frame", e)
        } finally {
            try {
                decoder?.stop()
                decoder?.release()
            } catch (e: Exception) {
                Log.e(TAG, "Error releasing decoder", e)
            }
        }
        return null
    }

    private fun YUV_420_888toNV21(image: Image): ByteArray {
        val nv21 = ByteArray(image.width * image.height * 3 / 2)
        val yPlane = image.planes[0]
        val uPlane = image.planes[1]
        val vPlane = image.planes[2]

        val yBuffer = yPlane.buffer
        val uBuffer = uPlane.buffer
        val vBuffer = vPlane.buffer

        var pos = 0

        // Copy Y
        val yRowStride = yPlane.rowStride
        val yPixelStride = yPlane.pixelStride
        if (yPixelStride == 1 && yRowStride == image.width) {
            val ySize = image.width * image.height
            yBuffer.get(nv21, 0, ySize)
            pos += ySize
        } else {
            val row = ByteArray(yRowStride)
            for (i in 0 until image.height) {
                yBuffer.position(i * yRowStride)
                yBuffer.get(row, 0, image.width)
                System.arraycopy(row, 0, nv21, pos, image.width)
                pos += image.width
            }
        }

        // Copy VU (NV21 requires V, U interleaving)
        val uRowStride = uPlane.rowStride
        val uPixelStride = uPlane.pixelStride
        val vRowStride = vPlane.rowStride
        val vPixelStride = vPlane.pixelStride

        val uRow = ByteArray(uRowStride)
        val vRow = ByteArray(vRowStride)

        for (i in 0 until image.height / 2) {
            uBuffer.position(i * uRowStride)
            vBuffer.position(i * vRowStride)

            uBuffer.get(uRow, 0, Math.min(uRowStride, uBuffer.remaining()))
            vBuffer.get(vRow, 0, Math.min(vRowStride, vBuffer.remaining()))

            for (j in 0 until image.width / 2) {
                nv21[pos++] = vRow[j * vPixelStride]
                nv21[pos++] = uRow[j * uPixelStride]
            }
        }

        return nv21
    }
}
