import { Component } from '@angular/core';
import { UploadComponent } from './upload/upload.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [UploadComponent],
})
export class AppComponent {
  title = 'Client-Complexity-Analyzer';
}
