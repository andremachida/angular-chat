import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Chat } from '../models/chat.model';
import { Apollo, QueryRef } from 'apollo-angular';
import { AuthService } from '../../core/services/auth.service';
import {
  AllChatsQuery,
  USER_CHATS_QUERY,
  ChatQuery,
  CHAT_BY_ID_OR_BY_USERS_QUERY,
  CREATE_PRIVATE_CHAT_MUTATION,
  CREATE_GROUP_MUTATION
} from './chat.graphql';
import { map } from 'rxjs/operators';
import { DataProxy } from 'apollo-cache';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { USER_MESSAGES_SUBSCRIPTIONS, AllMessagesQuery, GET_CHAT_MESSAGES_QUERY } from './message.graphql';
import { Message } from '../models/message.model';
import { UserService } from '../../core/services/user.service';
import { BaseService } from '../../core/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends BaseService {

  chats$: Observable<Chat[]>;
  private subscriptions: Subscription[] = [];
  private queryRef: QueryRef<AllChatsQuery>;

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    super();
  }

  private stopChatsMonitoring(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    this.chats$ = null;
  }

  startChatsMonitoring(): void {
    if (!this.chats$) {
      this.chats$ = this.getUserChats();
      this.subscriptions.push(this.chats$.subscribe());
      this.subscriptions.push(
        this.router.events.subscribe((event: RouterEvent) => {
          if (event instanceof NavigationEnd && !this.router.url.includes('chat')) {
            this.stopChatsMonitoring();
            this.userService.stopUsersMonitoring();
          }
        })
      );
    }
  }

  getUserChats(): Observable<Chat[]> {
    this.queryRef = this.apollo.watchQuery<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        loggedUserId: this.authService.authUser.id
      },
      fetchPolicy: 'network-only'
    });

    this.queryRef.subscribeToMore({
      document: USER_MESSAGES_SUBSCRIPTIONS,
      variables: { loggedUserId: this.authService.authUser.id },
      updateQuery: (previous: AllChatsQuery, { subscriptionData }): AllChatsQuery => {
        const newChat: Chat = subscriptionData.data.Chat.node;
        if (previous.allChats.every(chat => chat.id !== newChat.id)) {
          return {
            ...previous,
            allChats: [newChat, ...previous.allChats]
          };
        }
        return previous;
      }
    });

    this.queryRef.subscribeToMore({
      document: USER_MESSAGES_SUBSCRIPTIONS,
      variables: { loggedUserId: this.authService.authUser.id },
      updateQuery: (previous: AllChatsQuery, { subscriptionData }): AllChatsQuery => {
        const newMessage: Message = subscriptionData.data.Message.node;

        try {
          if (newMessage.sender.id !== this.authService.authUser.id) {
            const apolloClient = this.apollo.getClient();
            const chatMessagesVariables = { chatId: newMessage.chat.id };
            const chatMessagesData = apolloClient.readQuery<AllMessagesQuery>({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessagesVariables
            });
            chatMessagesData.allMessages = [...chatMessagesData.allMessages, newMessage];
            apolloClient.writeQuery({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessagesVariables,
              data: chatMessagesData
            });
          }
        } catch (e) {
          console.log('AllMessagesQuery not found.');
        }
        const chatToUpdateIndex: number = (previous.allChats)
          ? previous.allChats.findIndex(chat => chat.id === newMessage.chat.id)
          : -1;

        if (chatToUpdateIndex > -1) {
          const newAllChats = [...previous.allChats];
          const chatToUpdate: Chat = Object.assign({}, newAllChats[chatToUpdateIndex]);
          chatToUpdate.messages = [newMessage];
          newAllChats[chatToUpdateIndex] = chatToUpdate;
          return {
            ...previous,
            allChats: newAllChats
          };
        }
        return previous;
      }
    });

    return this.queryRef.valueChanges
      .pipe(
        map(res => res.data.allChats),
        map((chats: Chat[]) => {
          const chatsToSort = chats.slice();
          return chatsToSort.sort((a, b) => {
            const valueA = (a.messages) ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
            const valueB = (b.messages) ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
            return valueB - valueA;
          });
        })
      );
  }

  getChatByIdOrByUsers(chatOrUserId: string): Observable<Chat> {
    return this.apollo.query<ChatQuery | AllChatsQuery>({
      query: CHAT_BY_ID_OR_BY_USERS_QUERY,
      variables: {
        chatId: chatOrUserId,
        targetUserId: chatOrUserId,
        loggedUserId: this.authService.authUser.id
      }
    }).pipe(
      map(res => (res.data['Chat']) ? (res.data['Chat']) : res.data['allChats'][0])
    );
  }

  createPrivateChat(targetUserId: string): Observable<Chat> {
    return this.apollo.mutate({
      mutation: CREATE_PRIVATE_CHAT_MUTATION,
      variables: {
        loggedUserId: this.authService.authUser.id,
        targetUserId
      },
      update: (store: DataProxy, { data: { createChat } }) => {
        this.readAndWriteQuery<Chat>({
          store,
          newRecord: createChat,
          query: USER_CHATS_QUERY,
          queryName: 'allChats',
          arrayOperation: 'unshift',
          variables: { loggedUserId: this.authService.authUser.id }
        });

        this.readAndWriteQuery<Chat>({
          store,
          newRecord: createChat,
          query: CHAT_BY_ID_OR_BY_USERS_QUERY,
          queryName: 'allChats',
          arrayOperation: 'singleRecord',
          variables: {
            chatId: '',
            loggedUserId: this.authService.authUser.id,
            targetUserId
          }
        });
      }
    }).pipe(
      map(res => res.data.createChat)
    );
  }

  createGroup(variables: { title: string, userIds: string[] }): Observable<Chat> {
    variables.userIds.push(this.authService.authUser.id);
    return this.apollo.mutate({
      mutation: CREATE_GROUP_MUTATION,
      variables: {
        ...variables,
        loggedUserId: this.authService.authUser.id
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createChat: {
          __typename: 'Chat',
          id: '',
          title: variables.title,
          createdAt: new Date().toISOString(),
          isGroup: true,
          users: [{
            __typename: 'User',
            id: '',
            name: '',
            email: '',
            createdAt: new Date().toISOString()
          }],
          messages: []
        }
      },
      update: (store: DataProxy, { data: { createChat } }) => {
        this.readAndWriteQuery<Chat>({
          store,
          newRecord: createChat,
          query: USER_CHATS_QUERY,
          queryName: 'allChats',
          arrayOperation: 'unshift',
          variables: { loggedUserId: this.authService.authUser.id }
        });
      }
    }).pipe(
      map(res => res.data.createChat)
    );
  }
}
