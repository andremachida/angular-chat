import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatToolbarModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatListModule,
  MatIconModule,
  MatLineModule,
  MatSidenavModule,
  MatTabsModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoRecordComponent } from './components/no-record/no-record.component';

@NgModule({
  exports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatListModule,
    MatIconModule,
    MatLineModule,
    MatSidenavModule,
    MatTabsModule,
    NoRecordComponent,
    FormsModule
  ],
  declarations: [NoRecordComponent],
  imports: [
    MatIconModule
  ]
})
export class SharedModule { }
