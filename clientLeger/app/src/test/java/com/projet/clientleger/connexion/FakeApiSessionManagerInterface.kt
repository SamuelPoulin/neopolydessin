package com.projet.clientleger.connexion

import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.ApiSessionManagerInterface
import com.projet.clientleger.data.api.model.AccessTokenModel
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RefreshTokenModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import retrofit2.Response
import javax.inject.Inject

class FakeApiSessionManagerInterface @Inject constructor():ApiSessionManagerInterface {
    override suspend fun refreshToken(refreshToken: RefreshTokenModel): Response<AccessTokenModel>{
        return Response.success(AccessTokenModel(""))
    }
}