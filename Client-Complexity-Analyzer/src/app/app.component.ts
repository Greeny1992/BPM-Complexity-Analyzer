import { Component } from '@angular/core';
import { UploadComponent } from './upload/upload.component';
import { BpmnViewerComponent } from './bpmn-viewer/bpmn-viewer.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [UploadComponent, BpmnViewerComponent],
})
export class AppComponent {
  title = 'Client-Complexity-Analyzer';
  uploadedBpmn: string = '';

  onFileUploaded(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedBpmn = e.target?.result as string;
    };
    reader.readAsText(file);
  }
}
