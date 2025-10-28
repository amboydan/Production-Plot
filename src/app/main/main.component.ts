import { Component, OnInit } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { 
  RouterOutlet,
  RouterLink,
  RouterLinkActive 
} from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

interface Team {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule, 
    MatToolbarModule, 
    MatListModule, 
    RouterOutlet, 
    HeaderComponent, 
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  ngOnInit(): void {
    
  }

  selectedValue: string | undefined;
  teams: Team[] = [
    {value: 'PBU', viewValue: 'Prudhoe Bay'},
    {value: 'WNS', viewValue: 'Western North Slope'},
    {value: 'MPU', viewValue: 'Milne Point Unit'},
    {value: 'AKI', viewValue: 'AK Islands'},
    {value: 'KEN', viewValue: 'Kenai'},
    {value: 'CIO', viewValue: 'Cook Inlet Offshore'}
  ];

}

