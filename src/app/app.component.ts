import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private apollo: Apollo
  ) {
    // this.createUser();
    this.allUsers();
  }

  allUsers(): void {

    this.apollo.query({
      query: gql`
        query {
          allUsers {
            id
            name
            email
          }
        }
      `
    }).subscribe(res => console.log('Query: ', res));
  }

  createUser(): void {
    const body = {
      query: `
        mutation CreateNewUser($name: String!, $email: String!, $password: String!) {
          createUser (
            name: $name,
            email: $email,
            password: $password
          ) {
            id
            name
            email
          }
        }
      `,
      variables: {
        name: 'Annelise',
        email: 'anne@gmail.com',
        password: '123'
      }
    };
    this.apollo.mutate({
      mutation: gql`
        mutation CreateNewUser($name: String!, $email: String!, $password: String!) {
          createUser (
            name: $name,
            email: $email,
            password: $password
          ) {
            id
            name
            email
          }
        }
      `,
      variables: {
        name: 'Teste',
        email: 'teste@gmail.com',
        password: '123'
      }
    }).subscribe(res => console.log('Mutation: ', res));
  }
}
