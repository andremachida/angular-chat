import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { takeWhile } from 'rxjs/operators';
import { ErrorService } from '../../../core/services/error.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  configs = {
    isLogin: true,
    actionText: 'Sign In',
    buttonActionText: 'Create Account',
    isLoading: false
  };
  private nameControl = new FormControl('', [ Validators.required, Validators.minLength(5) ]);
  private alive = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [ Validators.required, Validators.email ]],
      password: ['', [ Validators.required, Validators.minLength(5) ]]
    });
  }

  onSubmit(): void {
    this.configs.isLoading = true;
    const operation =
      (this.configs.isLogin)
        ? this.authService.signInUser(this.loginForm.value)
        : this.authService.signUpUser(this.loginForm.value);

    operation
      .pipe(
        takeWhile(() => this.alive)
      ).subscribe(res => {
        this.configs.isLoading = false;
      }, err => {
        this.configs.isLoading = false;
        this.snackBar.open(this.errorService.getErrorMessage(err), 'Dismiss', { duration: 5000, verticalPosition: 'top' });
      }, () => console.log('Observable complete'));
  }

  changeAction(): void {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ?  'Sign Up' : 'Sign In';
    this.configs.buttonActionText = !this.configs.isLogin ?  'Already Have Account' : 'Create Account';
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }

  get email(): FormControl {
    return <FormControl>this.loginForm.get('email');
  }

  get password(): FormControl {
    return <FormControl>this.loginForm.get('password');
  }

  get name(): FormControl {
    return <FormControl>this.loginForm.get('name');
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
