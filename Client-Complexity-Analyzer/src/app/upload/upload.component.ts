import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AnalyzedDataI } from '../models';
@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  @Output() fileUploaded = new EventEmitter<File>();
  @Output() analyzedResult = new EventEmitter<AnalyzedDataI>();
  constructor(private uploadS: UploadService, private _snack: MatSnackBar) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.fileUploaded.emit(file);
      this.uploadS
        .uploadFile(file)
        .pipe(
          catchError((x) => {
            this._snack.open(
              "The uploaded file couldn't be analyzed. Please try again",
              '',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            console.log(x);
            return of({} as AnalyzedDataI);
          })
        )
        .subscribe((res: AnalyzedDataI) => this.analyzedResult.emit(res));
    }
    input.value = '';
  }
}
