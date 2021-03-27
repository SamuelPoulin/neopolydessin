package com.projet.clientleger.data.api.service

import com.projet.clientleger.data.endpoint.DrawingSocketEndpoints
import com.projet.clientleger.data.model.*
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject
import javax.inject.Inject

class DrawingSocketService @Inject constructor(val socketService: SocketService){

    fun sendStartPath(coords: Coordinate, brushInfo: BrushInfo){
        val coordToSend = JSONObject()
        coordToSend.put("x", coords.x)
        coordToSend.put("y", coords.y)

        val brushInfoJsonObject = JSONObject()
        brushInfoJsonObject.put("color", brushInfo.color)
        brushInfoJsonObject.put("strokeWidth", brushInfo.strokeWidth)

        socketService.socket.emit(DrawingSocketEndpoints.START_PATH.endpoint,
                coordToSend,
                brushInfoJsonObject)
    }

    fun sendUpdatePath(coords: Coordinate){
        val coordJsonObject = JSONObject()
        coordJsonObject.put("x", coords.x)
        coordJsonObject.put("y", coords.y)

        socketService.socket.emit(DrawingSocketEndpoints.UPDATE_PATH.endpoint, coordJsonObject)
    }

    fun sendEndPath(endCoords: Coordinate){
        val coordJsonObject = JSONObject()
        coordJsonObject.put("x", endCoords.x)
        coordJsonObject.put("y", endCoords.y)

        socketService.socket.emit(DrawingSocketEndpoints.END_PATH.endpoint, coordJsonObject)
    }

    fun sendPath(pathId: Int){
        socketService.socket.emit(DrawingSocketEndpoints.SEND_PATH.endpoint, pathId)
    }

    fun sendErasePath(pathId: Int){
        socketService.socket.emit(DrawingSocketEndpoints.SEND_ERASE.endpoint, pathId)
    }

    fun receivePath(): Observable<PathData> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_PATH.endpoint){ (id, resCoords, resBrushInfo) ->
            val coords: ArrayList<Coordinate> = ArrayList()
            val JSONcoords = resCoords as JSONArray
            for(i in 0 until JSONcoords.length()){
                coords.add(Json.decodeFromString(Coordinate.serializer(),JSONcoords.get(i).toString()))
            }
            val brushInfo = Json.decodeFromString(BrushInfo.serializer(), resBrushInfo.toString())
            PathData(id as Int, brushInfo, coords)
        }
    }

    fun receiveErasePath(): Observable<Int> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_ERASE.endpoint){ (pathId) ->
            pathId as Int
        }
    }

    fun receiveStartPath() : Observable<PathData> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_START_PATH.endpoint){ (id, coordReceive, info) ->
            val coord = ArrayList<Coordinate>()
            coord.add(Json.decodeFromString(Coordinate.serializer(),coordReceive.toString()))
            val brushInfo = Json.decodeFromString(BrushInfo.serializer(), info.toString())
            PathData(id as Int,brushInfo, coord)
        }
    }

    fun receiveUpdatePath() : Observable<Coordinate>{
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_UPDATE_PATH.endpoint){ res->
            Json.decodeFromString(Coordinate.serializer(), res[0].toString())
        }
    }

    fun receiveEndPath() : Observable<Coordinate>{
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_END_PATH.endpoint){ res ->
            Json.decodeFromString(Coordinate.serializer(), res[0].toString())
        }
    }
}