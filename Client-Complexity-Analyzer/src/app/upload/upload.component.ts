import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
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
    const files = Array.from(input.files || []);

    if (files.length > 0) {
      // Create an observable for each file
      const fileObservables = files.map((file) =>
        this.uploadS.uploadFile(file).pipe(
          catchError((error) => {
            this._snack.open(
              `File '${file.name}' couldn't be analyzed. Please try again`,
              '',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            console.error(error);
            return of({} as AnalyzedDataI);
          })
        )
      );

      // Combine observables and subscribe to them
      forkJoin(fileObservables).subscribe((results: AnalyzedDataI[]) => {
        // Emit the results for each file separately
        results.forEach((res, index) => {
          const file = files[index];
          this.fileUploaded.emit(file);
          this.analyzedResult.emit(res);
        });

        // Clear the input value
        input.value = '';
      });
    }
  }
}
