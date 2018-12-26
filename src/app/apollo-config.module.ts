import { NgModule, Inject } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';

import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { StorageKeys } from './storage-keys';
import { GRAPHCOOL_CONFIG, GraphcollConfig } from './core/providers/graphcool-config.provider';
import { persistCache } from 'apollo-cache-persist';

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class ApolloConfigModule {

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    @Inject(GRAPHCOOL_CONFIG) private graphcoolConfig: GraphcollConfig
  ) {
    const uri = this.graphcoolConfig.simpleAPI;
    const http = httpLink.create({ uri });

    const authMiddleware: ApolloLink = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: new HttpHeaders({
          'Authorization': `Bearer ${ this.getAuthToken() }`
        })
      });
      return forward(operation);
    });

    const linkError = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    });

    const cache = new InMemoryCache();

    persistCache({
      cache,
      storage: window.localStorage
    }).catch(err => {
      console.log('Error while persisting cache', err);
    });

    apollo.create({
      link: ApolloLink.from([
        linkError,
        authMiddleware.concat(http)
      ]),
      cache
    });
  }

  private getAuthToken(): string {
    return window.localStorage.getItem(StorageKeys.AUTH_TOKEN);
  }
}
