import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private selectedTeamSource = new BehaviorSubject<string | null>(null);
  private selectedFieldSource = new BehaviorSubject<string | null>(null);

  selectedTeam$ = this.selectedTeamSource.asObservable();
  selectedField$ = this.selectedFieldSource.asObservable();

  setSelectedTeam(team: string | null) {
    this.selectedTeamSource.next(team);
  }
  
  setSelectedField(field: string | null) {
    this.selectedFieldSource.next(field);
  }

  get currentTeam(): string | null {
    return this.selectedTeamSource.value;
  }
  
  get currentField(): string | null {
    return this.selectedFieldSource.value;
  }

  private activeLinkSubject = new BehaviorSubject<string>('');
  activeLink$ = this.activeLinkSubject.asObservable();

  setActiveLink(link: string) {
    console.log(this)
    this.activeLinkSubject.next(link);
  }

}
