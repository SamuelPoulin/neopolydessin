package com.projet.clientleger

import com.projet.clientleger.data.api.http.ApiAvatarInterface
import okhttp3.ResponseBody
import retrofit2.Call

class FakeApiAvatarInterface: ApiAvatarInterface {
    override fun getAvatar(id: String): Call<ResponseBody> {
        TODO("Not yet implemented")
    }

}