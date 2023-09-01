import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnalyzedDataI, EvaluationTableDataI, WeightsDataI } from './models';
import { Observable, map } from 'rxjs';
import { environment } from 'src/env/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerService {
  constructor(private readonly http: HttpClient) {}
  updateCognitivWeights(weights: WeightsDataI): Observable<AnalyzedDataI> {
    return this.http.post<AnalyzedDataI>(
      environment.api + '/update-weights',
      weights
    );
  }

  getEvaluationData(): Observable<EvaluationTableDataI[]> {
    return this.http
      .get<{ data: EvaluationTableDataI[] }>(
        environment.api + '/calculated-data'
      )
      .pipe(map((value) => value.data));
  }

  resetCalculatedData(): Observable<any> {
    return this.http.delete(environment.api + '/reset');
  }
}
