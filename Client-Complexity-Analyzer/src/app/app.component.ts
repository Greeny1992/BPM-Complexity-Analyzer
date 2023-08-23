import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload/upload.component';
import { BpmnViewerComponent } from './bpmn-viewer/bpmn-viewer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
export interface AnalyzedDataI {
  elementCount: number;
  cfc: number;
  ccm: number;
  fifo: number;
  hal: {
    processLengthN: number;
    processVolumeV: number;
    processDifficultyD: number;
  };
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    UploadComponent,
    BpmnViewerComponent,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatBadgeModule,
    MatIconModule,
    MatButtonModule,
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

  resetCurrentBPMN() {
    this.analyzedData = {} as AnalyzedDataI;
    this.uploadedBpmn = '';
  }
}
