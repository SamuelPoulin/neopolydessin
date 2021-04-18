import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatComponent } from './chat/chat.component';
import { SystemMessageComponent } from './system-message/system-message.component';
import { ChatTabsComponent } from './chat-tabs/chat-tabs.component';
import { ChatTabComponent } from './chat-tab/chat-tab.component';
import { ChatFriendslistComponent } from './chat-friendslist/chat-friendslist.component';
import { ChatFriendComponent } from './chat-friend/chat-friend.component';
import { ChatAddFriendComponent } from './chat-add-friend/chat-add-friend.component';
import { ChatRoomsComponent } from './chat-rooms/chat-rooms.component';
import { ChatCreateChatRoomComponent } from './chat-create-chat-room/chat-create-chat-room.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

@NgModule({
  imports: [SharedModule, PickerModule, MatTooltipModule],
  declarations: [
    ChatComponent,
    ChatMessageComponent,
    SystemMessageComponent,
    ChatTabsComponent,
    ChatTabComponent,
    ChatFriendslistComponent,
    ChatFriendComponent,
    ChatAddFriendComponent,
    ChatRoomsComponent,
    ChatCreateChatRoomComponent,
    ChatRoomComponent,
  ],
  exports: [ChatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatModule {}
