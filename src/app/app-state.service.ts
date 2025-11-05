import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private selectedTeamSource = new BehaviorSubject<string | null>(null);
  selectedTeam$ = this.selectedTeamSource.asObservable();

  setSelectedTeam(team: string | null) {
    this.selectedTeamSource.next(team);
  }

  get currentTeam(): string | null {
    return this.selectedTeamSource.value;
  }
}
