import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <div class="avatar-container" [ngStyle]="conatainerStyles">
      <img [src]="src" [title]="title || 'Avatar'" [ngStyle]="imageStyles"/>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  @Input() src: string;
  @Input() title: string;
  @Input() imageStyles: { [key: string]: string | number } = {};
  @Input() conatainerStyles: { [key: string]: string | number } = {};

  constructor() { }

  ngOnInit() {
  }

}
