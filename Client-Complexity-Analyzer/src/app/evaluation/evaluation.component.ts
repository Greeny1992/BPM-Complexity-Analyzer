import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AnalyzerService } from '../analyzer.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { EvaluationTableDataI } from '../models';
import { MatCardModule } from '@angular/material/card';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    NgxEchartsModule,
    NgIf,
  ],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
})
export class EvaluationComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['bpmnName', 'ccm', 'cfc', 'cop', 'coe', 'fifo'];
  //@ts-ignore
  dataSource: MatTableDataSource<EvaluationTableDataI>;
  //@ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //@ts-ignore
  @ViewChild(MatSort) sort: MatSort;
  data: EvaluationTableDataI[] = [];
  // @ts-ignore
  @ViewChild('chartContainer', { static: false }) chartDiv: ElementRef;
  // @ts-ignore
  chart: echarts.ECharts | null;
  chartType: 'line' | 'bar' | 'stack' = 'stack';

  chartOptions: any;
  constructor(private analyzerS: AnalyzerService) {}
  ngOnInit(): void {
    this.chartOptions = {
      grid: {
        top: '10%',
        left: '5%',
        right: '5%',
        bottom: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
      },
      tooltip: {
        trigger: 'item',
        textStyle: {
          color: 'green',
        },
      },
      series: [
        {
          name: 'CFC',
          type: 'bar',
          barGap: 0,
          data: [],
        },
        {
          name: 'CoE',
          type: 'bar',
          barGap: 0,
          data: [],
        },
        {
          name: 'CCM',
          type: 'bar',
          barGap: 0,
          data: [],
        },
        {
          name: 'FiFo',
          type: 'bar',
          barGap: 0,
          data: [],
        },
      ],
    };
    this.analyzerS
      .getEvaluationData()
      .subscribe((data: EvaluationTableDataI[]) => {
        this.data = data;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.transformData();
      });
  }

  ngAfterViewInit(): void {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  transformData() {
    if (!this.chart && this.chartDiv) {
      this.chart = echarts.init(this.chartDiv.nativeElement);
    }
    if (this.chartOptions) {
      console.log(this.data);
      const chartData = this.data.reduce(
        (
          prev: {
            CFC: number[];
            CoE: number[];
            CCM: number[];
            FiFo: number[];
            bpmnName: string[];
          },
          curr
        ) => {
          prev.CFC.push(curr.calculatedData.cfc);
          prev.CoE.push(curr.calculatedData.elementCount);
          prev.CCM.push(curr.calculatedData.ccm);
          prev.FiFo.push(curr.calculatedData.fifo);
          prev.bpmnName.push(curr.bpmnName);
          return prev;
        },
        { CFC: [], CoE: [], CCM: [], FiFo: [], bpmnName: [] }
      );

      this.chartOptions.series[0].data = chartData.CFC;
      this.chartOptions.series[1].data = chartData.CoE;
      this.chartOptions.series[2].data = chartData.CCM;
      this.chartOptions.series[3].data = chartData.FiFo;
      this.chartOptions.xAxis.data = chartData.bpmnName;
      this.chart?.setOption(this.chartOptions);
    }
  }
  resetData() {
    this.analyzerS.resetCalculatedData().subscribe();
    this.analyzerS
      .getEvaluationData()
      .subscribe((data: EvaluationTableDataI[]) => {
        this.data = data;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.transformData();
      });
  }
}
