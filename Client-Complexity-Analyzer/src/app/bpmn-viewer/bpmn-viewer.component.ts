import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import TokenSimulationModule from 'bpmn-js-token-simulation/lib/viewer';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-bpmn-viewer',
  standalone: true,
  imports: [CommonModule],
  template: ` <div #bpmnContainer style="height: 100%; display: flex;"></div> `,
})
export class BpmnViewerComponent implements OnChanges {
  @ViewChild('bpmnContainer') private bpmnContainer: ElementRef =
    {} as ElementRef;

  private _bpmnXml: string = '';
  private viewer: BpmnViewer | null = null;

  @Input()
  get bpmnXml(): string {
    return this._bpmnXml;
  }

  set bpmnXml(value: string) {
    this._bpmnXml = value;
  }

  constructor(private _snackBar: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bpmnXml'] && !changes['bpmnXml'].firstChange) {
      this.renderBpmn(changes['bpmnXml'].currentValue);
    }
  }

  private async renderBpmn(xml: string) {
    // Destroy the previous viewer instance to prevent duplicates
    if (this.viewer) {
      this.viewer.detach();
      this.viewer.destroy();
    }

    // Initialize the viewer with the correct container element
    this.viewer = new BpmnViewer({
      container: this.bpmnContainer.nativeElement,
      additionalModules: [TokenSimulationModule],
    });

    try {
      await this.viewer.importXML(xml);
      const canvas = this.viewer.get('canvas');
      //@ts-ignore
      canvas.zoom('fit-viewport');
    } catch (err: any) {
      console.log('Import errors', err.message, err.warnings);
      this.openSnackBar(
        'The importet model has some errors. You can see details in the console'
      );
    }
  }

  openSnackBar(text: string) {
    this._snackBar.open(text, 'Close', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 5000,
    });
  }
}
