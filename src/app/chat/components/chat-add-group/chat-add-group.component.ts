import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { map, take } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../models/chat.model';
import { MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent implements OnInit, OnDestroy {

  newGroupForm: FormGroup;
  users$: Observable<User[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private chatService: ChatService,
    private dialogRef: MatDialogRef<ChatAddGroupComponent>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.createForm();
    this.listenMemberList();
  }

  private listenMemberList(): void {
    this.subscriptions.push(
      this.members.valueChanges
        .subscribe(() => {
          this.users$ = this.users$
            .pipe(
              map(users => users.filter(user => this.members.controls.every(c => c.value.id !== user.id)))
            );
        })
    );
  }

  onSubmit(): void {
    const formValue = Object.assign({
      title: this.title.value,
      userIds: this.members.value.map(m => m.id)
    });
    this.chatService.createGroup(formValue)
      .pipe(take(1))
      .subscribe((chat: Chat) => {
        this.dialogRef.close();
        this.snackBar.open(`Group: ${chat.title} created.`, 'Dismiss', { duration: 3000 });
      });
  }

  private createForm(): void {
    this.newGroupForm = this.formBuilder.group({
      title: ['', [ Validators.required, Validators.minLength(3) ]],
      members: this.formBuilder.array([], Validators.required)
    });
  }

  addMember(user: User): void {
    this.members.push(this.formBuilder.group(user));
  }

  removeMember(index: number): void {
    this.members.removeAt(index);
  }

  get title(): FormControl {
    return <FormControl>this.newGroupForm.get('title');
  }

  get members(): FormArray {
    return <FormArray>this.newGroupForm.get('members');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
