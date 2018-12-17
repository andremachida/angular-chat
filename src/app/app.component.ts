import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { take } from 'rxjs/operators';
import { ErrorService } from './core/services/error.service';
import { MatSnackBar } from '@angular/material';
import { AppConfigService } from './core/services/app-config.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar,
    private appConfig: AppConfigService
  ) {

  }

  ngOnInit(): void {
    this.authService.autoLogin()
      .pipe(take(1))
      .subscribe(
        null,
        error => {
          const message = this.errorService.getErrorMessage(error);
          this.snackBar.open(
            `Unexpected error: ${message}`,
            'Dismiss',
            { duration: 5000, verticalPosition: 'top' }
          );
        }
      );
  }
}
