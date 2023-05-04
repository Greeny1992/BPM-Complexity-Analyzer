import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  constructor(private uploadS: UploadService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.uploadS.uploadFile(file).subscribe((res) => console.log(res));
  }
}
