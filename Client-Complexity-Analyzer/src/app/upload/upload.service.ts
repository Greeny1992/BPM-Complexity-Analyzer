import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/env/environment';
import { AnalyzedDataI } from '../models';
@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private readonly http: HttpClient) {}
  uploadFile(file: File): Observable<AnalyzedDataI> {
    const formData = new FormData();
    formData.append('bpmnFile', file, file.name);
    return this.http.post<AnalyzedDataI>(environment.api + '/upload', formData);
  }
}
