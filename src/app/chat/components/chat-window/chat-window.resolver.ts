import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Chat } from '../../models/chat.model';
import { Observable } from 'rxjs';
import { ChatService } from '../../services/chat.service';

@Injectable()
export class ChatWindowResolver implements Resolve<Chat> {

  constructor(
    private chatService: ChatService
  ) {

  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Chat> {
    const chatOrUserId: string = route.paramMap.get('id');
    return this.chatService.getChatByIdOrByUsers(chatOrUserId);
  }
}
