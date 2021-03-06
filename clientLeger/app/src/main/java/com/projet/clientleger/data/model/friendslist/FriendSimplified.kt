package com.projet.clientleger.data.model.friendslist

import android.graphics.Bitmap
import android.os.Parcel
import android.os.Parcelable
import com.projet.clientleger.data.enumData.FriendStatus

class FriendSimplified() : Parcelable {
    lateinit var friendId: String
    lateinit var username: String
    lateinit var status: FriendStatus
    var isOnline: Boolean = false
    var avatar: Bitmap? = null

    constructor(parcel: Parcel) : this() {
        friendId = parcel.readString().toString()
        username = parcel.readString().toString()
        status = FriendStatus.values()[parcel.readInt()]
    }

    constructor(friendId: String, username: String, status: FriendStatus) : this() {
        this.friendId = friendId
        this.username = username
        this.status = status
    }

    constructor(headerName: String) : this() {
        friendId = ""
        username = headerName
        status = FriendStatus.HEADER
    }

    constructor(friend: Friend, avatar: Bitmap?) : this() {
        val buffStatus = when {
            friend.received && friend.status == "pending" -> FriendStatus.PENDING_RECEIVED
            !friend.received && friend.status == "pending" -> FriendStatus.PENDING_SENT
            else -> FriendStatus.ACCEPTED
        }
        if (friend.friendId!!._id == null)
            friend.friendId!!._id = "0"
        friendId = friend.friendId!!._id!!
        username = friend.friendId!!.username
        status = buffStatus
        isOnline = friend.isOnline
        this.avatar = avatar
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
