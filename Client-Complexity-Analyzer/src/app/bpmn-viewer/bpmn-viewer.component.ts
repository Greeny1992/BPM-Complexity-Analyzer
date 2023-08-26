import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

//@ts-ignore
import TokenSimulationModule from 'bpmn-js-token-simulation/lib/viewer';

@Component({
  selector: 'app-bpmn-viewer',
  standalone: true,
  imports: [CommonModule],
  template: ` <div #ref class="diagram-container"></div> `,
  styles: [
    `
      .diagram-container {
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class BpmnViewerComponent implements OnChanges, AfterContentInit {
  @ViewChild('ref', { static: true })
  private el!: ElementRef;

  private _bpmnXml: string = '';
  private viewer: BpmnViewer = new BpmnViewer({
    additionalModules: [TokenSimulationModule],
  });

  get bpmnXml(): string {
    return this._bpmnXml;
  }
  @Input()
  set bpmnXml(value: string) {
    this._bpmnXml = value;
  }

  constructor(private _snackBar: MatSnackBar) {
    //@ts-ignore
    this.viewer.on('import.done', ({ error }) => {
      if (!error) {
        //@ts-ignore
        this.viewer.get('canvas').zoom('fit-viewport');
      }
    });
  }
  ngAfterContentInit(): void {
    this.viewer.attachTo(this.el.nativeElement);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['bpmnXml'] && !changes['bpmnXml'].firstChange) {
      if (changes['bpmnXml'].currentValue === '') {
        this.viewer?.clear();
      } else {
        this.renderBpmn(changes['bpmnXml'].currentValue);
      }
    }
  }

  private async renderBpmn(xml: string) {
    try {
      await this.viewer?.importXML(xml);
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
