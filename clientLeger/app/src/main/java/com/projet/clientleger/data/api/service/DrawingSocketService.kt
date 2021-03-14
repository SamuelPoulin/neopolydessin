package com.projet.clientleger.data.api.service

import android.graphics.Path
import com.projet.clientleger.data.enum.DrawingSocketEndpoints
import com.projet.clientleger.data.model.PenPath
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class DrawingSocketService @Inject constructor(val socketService: SocketService){

    fun receiveStartPath(): Observable<PenPath>{
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_START_PATH.endpoint){
            received ->  PenPath(0, 1f, Path())
        }
    }
}