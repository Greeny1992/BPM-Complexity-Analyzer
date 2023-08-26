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
import { AnalyzedDataI, WeightsDataI } from './models';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { AnalyzerService } from './analyzer.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const DEFAULT_WEIGHTS = {
  sequences: 1,
  xor2: 2,
  xorGT2: 3,
  and: 4,
  or: 7,
  subprocess: 2,
  multipleInstance: 6,
};

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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSliderModule,
    FormsModule,
  ],
})
export class AppComponent {
  title = 'Client-Complexity-Analyzer';
  uploadedBpmn: string = '';
  analyzedData: AnalyzedDataI = {} as AnalyzedDataI;
  ccmDataForm = DEFAULT_WEIGHTS;

  constructor(
    private analyzerService: AnalyzerService,
    private _snack: MatSnackBar
  ) {}
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

  onSubmit() {
    const weightsData: WeightsDataI = this.ccmDataForm;
    this.analyzerService.updateCognitivWeights(weightsData).subscribe(() =>
      this._snack.open('Cognitiv weights updated successfull', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      })
    );
  }

  resetCCW(): void {
    this.ccmDataForm = DEFAULT_WEIGHTS;
  }
}
