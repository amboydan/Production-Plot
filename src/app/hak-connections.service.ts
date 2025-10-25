import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HakConnectionsService {

  constructor(private http: HttpClient) { }

  getJson(url: string): Observable<any> {
    return this.http.get<any>(url)
      .pipe(
        retry(3)
      );
  }

  getFieldList(): Observable<any> {
    const url = `http://localhost:3000/fields`
    return this.getJson(url);
  }
}
