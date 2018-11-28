import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatToolbarModule, MatListModule } from '@angular/material';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApolloConfigModule } from '../apollo-config.module';

@NgModule({
  exports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    ApolloConfigModule,
    MatListModule,
    MatToolbarModule
  ]
})
export class CoreModule {
  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('Core module is already loaded. Import it in the appModule only.');
    }
  }
}
