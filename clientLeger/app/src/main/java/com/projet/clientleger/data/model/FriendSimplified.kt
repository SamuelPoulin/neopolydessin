package com.projet.clientleger.data.model

import android.os.Parcel
import android.os.Parcelable
import com.projet.clientleger.data.enum.FriendStatus

class FriendSimplified() : Parcelable{
    lateinit var friendId: String
    lateinit var username: String
    lateinit var status: FriendStatus

    constructor(parcel: Parcel) : this() {
        friendId = parcel.readString().toString()
        username = parcel.readString().toString()
        status = FriendStatus.values()[parcel.readInt()]
    }

    constructor(friendId: String, username: String, status: FriendStatus): this(){
        this.friendId = friendId
        this.username = username
        this.status = status
    }

    constructor(friend: Friend): this(){
        val buffStatus = when{
            friend.received && friend.status == "pending" -> FriendStatus.PENDING_RECEIVED
            !friend.received && friend.status == "pending" -> FriendStatus.PENDING_SENT
            else -> FriendStatus.ACCEPTED
        }
        friendId = friend.friendId
        username = friend.username
        status = buffStatus
    }

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(friendId)
        parcel.writeString(username)
        parcel.writeInt(status.ordinal)
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<FriendSimplified> {
        override fun createFromParcel(parcel: Parcel): FriendSimplified {
            return FriendSimplified(parcel)
        }

        override fun newArray(size: Int): Array<FriendSimplified?> {
            return arrayOfNulls(size)
        }
    }
}
