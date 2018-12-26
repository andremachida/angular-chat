import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { AllMessagesQuery, GET_CHAT_MESSAGES_QUERY, CREATE_MESSAGE_MUTATION } from './message.graphql';
import { map } from 'rxjs/operators';
import { DataProxy } from 'apollo-cache';
import { AllChatsQuery, USER_CHATS_QUERY } from './chat.graphql';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) { }

  getChatMessages(chatId: string): Observable<Message[]> {
    return this.apollo.watchQuery<AllMessagesQuery>({
      query: GET_CHAT_MESSAGES_QUERY,
      variables: {
        chatId
      }
    }).valueChanges
      .pipe(
        map(res => res.data.allMessages)
      );
  }

  createMessage(message: { text: string, chatId: string, senderId: string }): Observable<Message> {
    return this.apollo.mutate({
      mutation: CREATE_MESSAGE_MUTATION,
      variables: message,
      optimisticResponse: {
        __typename: 'Mutation',
        createMessage: {
          __typename: 'Message',
          id: '',
          text: message.text,
          createdAt: new Date().toISOString(),
          sender: {
            __typename: 'User',
            id: message.senderId,
            name: '',
            email: '',
            createdAt: ''
          },
          chat: {
            __typename: 'Chat',
            id: message.chatId
          }
        }
      },
      update: (store: DataProxy, { data: { createMessage } }) => {
        try {
          const data = store.readQuery<AllMessagesQuery>({
            query: GET_CHAT_MESSAGES_QUERY,
            variables: {
              chatId: message.chatId
            }
          });
          data.allMessages = [...data.allMessages, createMessage];
          store.writeQuery({
            query: GET_CHAT_MESSAGES_QUERY,
            variables: {
              chatId: message.chatId
            },
            data
          });
        } catch (e) {
          console.log('AllMessageQuery not found!');
        }
        try {
          const userChatsVariables = { loggedUserId: this.authService.authUser.id };
          const userChatsData = store.readQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables
          });
          const newUserChatsList = [...userChatsData.allChats];
          newUserChatsList.map( c => {
            if (c.id === createMessage.chat.id) {
              c.messages = [createMessage];
            }
            return c;
          });
          userChatsData.allChats = newUserChatsList;
          store.writeQuery({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables,
            data: userChatsData
          });
        } catch (e) {
          console.log('AllChatsQuery not found!');
        }
      }
    }).pipe(
      map(res => res.data.createMessage)
    );
  }
}
