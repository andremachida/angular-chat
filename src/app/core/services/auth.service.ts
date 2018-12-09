import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION } from './auth.graphql';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;
  private _isAuthenticated = new ReplaySubject<boolean>(1);

  constructor(
    private apollo: Apollo
  ) {
    this.isAuthenticated.subscribe(res => console.log('AuthState: ', res));
  }

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  signInUser(variables: { email: string, password: string }): Observable<{ id: string, token: string}> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.authenticateUser),
      tap(res => this.setAuthState(res !== null)),
      catchError(error => {
        this.setAuthState(false);
        return throwError(error);
      })
    );
  }

  signUpUser(variables: { name: string, email: string, password: string }): Observable<{ id: string, token: string}> {
    return this.apollo.mutate({
      mutation: SIGNUP_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.signupUser),
      tap(res => this.setAuthState(res !== null)),
      catchError(error => {
        this.setAuthState(false);
        return throwError(error);
      })
    );
  }

  private setAuthState(isAuthenticated: boolean): void {
    this._isAuthenticated.next(isAuthenticated);
  }
}
