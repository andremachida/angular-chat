import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-tab',
  template: `
    <nav mat-tab-nav-bar backgroundColor="primary">
      <a mat-tab-link>Chats</a>
      <a mat-tab-link>Users</a>
    </nav>
  `,
  styles: []
})
export class ChatTabComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
