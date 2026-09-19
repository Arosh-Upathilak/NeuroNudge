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
        if (h264Data.isEmpty()) return null
        Log.d(TAG, "Decoding H264 stream (${h264Data.size} bytes)")

        var decoder: MediaCodec? = null
        try {
            val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height)
            format.setInteger(MediaFormat.KEY_COLOR_FORMAT, android.media.MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible)
            
            decoder = MediaCodec.createDecoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            decoder.configure(format, null, null, 0)
            decoder.start()

            val bufferInfo = MediaCodec.BufferInfo()
            var bestBitmap: Bitmap? = null
            var maxBrightness = 0.0
            var offset = 0
            val totalSize = h264Data.size
            var pts = 0L
            var tries = 0
            var decodedFrameCount = 0

            while (tries < 80) {
                // 1. Feed input chunks into available decoder input buffers without truncation
                if (offset < totalSize) {
                    val inIndex = decoder.dequeueInputBuffer(10000)
                    if (inIndex >= 0) {
                        val inputBuffer = decoder.getInputBuffer(inIndex)
                        if (inputBuffer != null) {
                            inputBuffer.clear()
                            val remainingBytes = totalSize - offset
                            val chunk = Math.min(inputBuffer.remaining(), remainingBytes)
                            inputBuffer.put(h264Data, offset, chunk)
                            offset += chunk
                            val isLast = (offset >= totalSize)
                            val flags = if (isLast) MediaCodec.BUFFER_FLAG_END_OF_STREAM else 0
                            decoder.queueInputBuffer(inIndex, 0, chunk, pts, flags)
                            pts += 33333L
                        }
                    }
                }

                // 2. Dequeue decoded output frames
                val outIndex = decoder.dequeueOutputBuffer(bufferInfo, 25000)
                if (outIndex >= 0) {
                    if (bufferInfo.size > 0) {
                        val outputImage = decoder.getOutputImage(outIndex)
                        if (outputImage != null) {
                            val nv21Bytes = YUV_420_888toNV21(outputImage)
                            val yuvImage = YuvImage(nv21Bytes, ImageFormat.NV21, outputImage.width, outputImage.height, null)
                            val outStream = ByteArrayOutputStream()
                            yuvImage.compressToJpeg(Rect(0, 0, outputImage.width, outputImage.height), 90, outStream)
                            val jpegBytes = outStream.toByteArray()
                            val bitmap = BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.size)
                            outputImage.close()

                            if (bitmap != null) {
                                decodedFrameCount++
                                val brightness = calculateBrightness(bitmap)
                                Log.d(TAG, "Decoded frame #$decodedFrameCount with brightness: $brightness")

                                if (brightness > maxBrightness || bestBitmap == null) {
                                    maxBrightness = brightness
                                    bestBitmap = bitmap
                                }

                                // If we've found an illuminated frame (brightness >= 25.0),
                                // and we're past the first warmup frame, we can finish early
                                if (brightness >= 25.0 && decodedFrameCount >= 2) {
                                    decoder.releaseOutputBuffer(outIndex, false)
                                    break
                                }
                            }
                        }
                    }
                    decoder.releaseOutputBuffer(outIndex, false)

                    if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                        Log.d(TAG, "Decoder signaled EOS")
                        break
                    }
                } else if (outIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    Log.d(TAG, "Output format changed: ${decoder.outputFormat}")
                } else if (outIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                    if (offset >= totalSize) {
                        tries++
                    }
                }
            }

            Log.i(TAG, "H264 decoding complete. Decoded $decodedFrameCount frames. Best brightness: $maxBrightness")
            return bestBitmap
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

    private fun extractFrames(data: ByteArray): List<ByteArray> {
        val n = data.size
        val startIndices = mutableListOf<Pair<Int, Int>>() // Pair(offset, startCodeLength)
        var i = 0
        while (i < n - 3) {
            if (data[i] == 0.toByte() && data[i + 1] == 0.toByte()) {
                if (data[i + 2] == 1.toByte()) {
                    startIndices.add(Pair(i, 3))
                    i += 3
                    continue
                } else if (data[i + 2] == 0.toByte() && data[i + 3] == 1.toByte()) {
                    startIndices.add(Pair(i, 4))
                    i += 4
                    continue
                }
            }
            i++
        }
        if (startIndices.isEmpty()) {
            return listOf(data)
        }

        val units = mutableListOf<Triple<Int, Int, Int>>() // Triple(start, length, nalType)
        for (k in 0 until startIndices.size) {
            val (start, scLen) = startIndices[k]
            val end = if (k + 1 < startIndices.size) startIndices[k + 1].first else n
            val headerIndex = start + scLen
            val nalType = if (headerIndex < n) (data[headerIndex].toInt() and 0x1F) else 0
            units.add(Triple(start, end - start, nalType))
        }

        val frames = mutableListOf<ByteArray>()
        var current = ByteArrayOutputStream()
        var hasVcl = false

        for ((start, length, nalType) in units) {
            val isVcl = (nalType == 1 || nalType == 5)
            if (isVcl && hasVcl) {
                frames.add(current.toByteArray())
                current = ByteArrayOutputStream()
                hasVcl = false
            }

            current.write(data, start, length)
            if (isVcl) {
                hasVcl = true
            }
        }

        if (current.size() > 0) {
            frames.add(current.toByteArray())
        }

        return frames
    }

    private fun calculateBrightness(bitmap: Bitmap): Double {
        var sumLuma = 0L
        var count = 0
        val step = 4
        for (y in 0 until bitmap.height step step) {
            for (x in 0 until bitmap.width step step) {
                val pixel = bitmap.getPixel(x, y)
                val r = (pixel shr 16) and 0xFF
                val g = (pixel shr 8) and 0xFF
                val b = pixel and 0xFF
                sumLuma += (0.299 * r + 0.587 * g + 0.114 * b).toLong()
                count++
            }
        }
        return if (count > 0) sumLuma.toDouble() / count else 0.0
    }
}
