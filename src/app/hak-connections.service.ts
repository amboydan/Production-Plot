import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { 
  Observable, 
  retry,
  timeout,
  catchError,
  throwError 
} from 'rxjs';

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

  getTeamList(): Observable<any> {
    // const url = `http://localhost:3000/teams`
    const url = `http://localhost:3000/teams`
    return this.getJson(url);
  }

  getTeamStats(selectedTeam: string): Observable<any> {
    const url = `http://localhost:3000/team/statistics/${encodeURIComponent(selectedTeam)}`
    return this.getJson(url);
  }

  getFieldsList(selectedTeam: string): Observable<any> {
    // const url = `http://localhost:3000/teams`
    const url = `http://localhost:3000/team/fields/${encodeURIComponent(selectedTeam)}`
    return this.getJson(url);
  }

  getFieldWells(selectedField: string): Observable<any> {
    // const url = `http://localhost:3000/teams`
    const url = `http://localhost:3000/team/fieldWellsSummary/${encodeURIComponent(selectedField)}`
    return this.getJson(url);
  }

  getFieldProduction(selectedField: string): Observable<any> {
    const url = `http://localhost:3000/team/field/production/${encodeURIComponent(selectedField)}/2024-10-10`;
    return this.getJson(url).pipe(
      //timeout(30000), // Wait for up to 30 seconds
      catchError(err => {
        // Handle the error if even 30 seconds is not enough
        console.error('API call timed out:', err);
        return throwError(() => new Error('Request timed out after 30 seconds'));
      })
    );
}
}

