export enum SocketMessages {
    SEND_MESSAGE = 'SendMsg',
    RECEIVE_MESSAGE = 'ReceiveMsg',

    GET_CHAT_ROOMS = 'getChatRoooms',               // callback (rooms: string[])
    GET_CHAT_ROOMS_IM_IN = 'getChatRoomsIn',        // callback (rooms: string[])
    SEND_MESSAGE_TO_ROOM = 'SendMsgToRoom',         // roomName: string, message: Message
    RECEIVE_MESSAGE_OF_ROOM = 'ReceiveMsgFromRoom', // RoomChatMessage | RoomSystemMessage
    JOIN_CHAT_ROOM = 'joinChatRoom',                // roomName: string, callback (successfullyJoined: boolean)
    LEAVE_CHAT_ROOM = 'leaveChatRoom',              // roomName: string, callback (successfullyLeft: boolean)
    CREATE_CHAT_ROOM = 'createChatRoom',            // roomName: string, callback (successfullyCreated: boolean)
    DELETE_CHAT_ROOM = 'deleteChatRoom',            // roomName: string, callback (successfullyDeleted: boolean)

    SEND_PRIVATE_MESSAGE = 'SendPrivateMsg',
    RECEIVE_PRIVATE_MESSAGE = 'ReceivePrivateMsg',

    PLAYER_CONNECTION = 'PlayerConnected',
    PLAYER_DISCONNECTION = 'PlayerDisconnected',
}
