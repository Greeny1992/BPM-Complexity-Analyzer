import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/env/environment';
@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private readonly http: HttpClient) {}
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('bpmnFile', file, file.name);
    return this.http.post(environment.api + '/upload', formData);
  }
}
