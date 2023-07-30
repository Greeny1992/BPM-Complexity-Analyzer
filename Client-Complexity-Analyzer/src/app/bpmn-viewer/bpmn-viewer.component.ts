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
@Component({
  selector: 'app-bpmn-viewer',
  standalone: true,
  imports: [CommonModule],
  template: ` <div #bpmnContainer style="height: 100%;"></div> `,
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
    this.renderBpmn(this._bpmnXml);
  }

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
    });

    try {
      const result = await this.viewer.importXML(xml);
      const { warnings } = result;
      console.log('Import warnings', warnings);
    } catch (err: any) {
      console.log('Import errors', err.message, err.warnings);
    }
  }
}
