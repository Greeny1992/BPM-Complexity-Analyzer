import { Component } from '@angular/core';
import { UploadComponent } from './upload/upload.component';
import { BpmnViewerComponent } from './bpmn-viewer/bpmn-viewer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
export interface AnalyzedDataI {
  activityCount: number;
  cfc: number;
  ccm: number;
  fifo: number;
  hal: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    UploadComponent,
    BpmnViewerComponent,
    MatToolbarModule,
    MatTabsModule,
  ],
})
export class AppComponent {
  title = 'Client-Complexity-Analyzer';
  uploadedBpmn: string = '';
  analyzedData: AnalyzedDataI = {} as AnalyzedDataI;

  onFileUploaded(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedBpmn = e.target?.result as string;
    };
    reader.readAsText(file);
  }
}
