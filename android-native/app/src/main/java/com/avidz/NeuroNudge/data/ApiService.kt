package com.avidz.NeuroNudge.data

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface ApiService {
    @POST("api/user/sync")
    suspend fun syncUser(@Header("Authorization") authorization: String): UserEnvelope

    @POST("api/user/send-verification")
    suspend fun sendVerification(@Header("Authorization") authorization: String): ApiEnvelope<Any>

    @POST("api/user/forgot-password")
    suspend fun forgotPassword(@Body request: ResetRequest): ApiEnvelope<Any>

    @DELETE("api/user/data")
    suspend fun clearData(@Header("Authorization") authorization: String): ApiEnvelope<Any>

    @GET("api/memories")
    suspend fun memories(@Header("Authorization") authorization: String): ApiEnvelope<List<ApiMemory>>

    @GET("api/messages")
    suspend fun messages(@Header("Authorization") authorization: String): ApiEnvelope<List<ApiMessage>>

    @Multipart
    @POST("api/nlp/chat")
    suspend fun chat(
        @Header("Authorization") authorization: String,
        @Part("userText") text: RequestBody,
        @Part("latitude") latitude: RequestBody?,
        @Part("longitude") longitude: RequestBody?,
        @Part image: MultipartBody.Part?,
    ): ApiEnvelope<NlpChatResponse>
}
