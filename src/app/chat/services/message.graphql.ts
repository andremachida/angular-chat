import { Message } from '../models/message.model';
import gql from 'graphql-tag';

export interface AllMessagesQuery {
  allMessages: Message[];
}

export const GET_CHAT_MESSAGES_QUERY = gql`
  query GetChatMessagesQuery($chatId: ID!) {
    allMessages(
      filter: {
        chat: {
          id: $chatId
        }
      },
      orderBy: createdAt_ASC
    ) {
      id
      text
      createdAt
      sender {
        id
        name
        email
        createdAt
      }
      chat {
        id
      }
    }
  }
`;
