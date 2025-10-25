import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { 
  RouterOutlet,
  RouterLink,
  RouterLinkActive 
} from '@angular/router';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatSidenavModule, 
    MatToolbarModule, 
    MatListModule, 
    RouterOutlet, 
    HeaderComponent, 
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {}

