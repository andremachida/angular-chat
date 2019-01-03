import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent implements OnInit {

  newGroupForm: FormGroup;
  users$: Observable<User[]>;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.createForm();
  }

  onSubmit(): void {
    console.log(this.newGroupForm.value);
  }

  private createForm(): void {
    this.newGroupForm = this.formBuilder.group({
      title: ['', [ Validators.required, Validators.minLength(3) ]],
      members: this.formBuilder.array([], Validators.required)
    });
  }

  addMember(user: User): void {
    this.members.push(this.formBuilder.group(user));
    console.log(this.newGroupForm.value);
  }

  get title(): FormControl {
    return <FormControl>this.newGroupForm.get('title');
  }

  get members(): FormArray {
    return <FormArray>this.newGroupForm.get('members');
  }
}
