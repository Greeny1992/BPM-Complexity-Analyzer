import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnalyzedDataI, WeightsDataI } from './models';
import { Observable } from 'rxjs';
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
}
