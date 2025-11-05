import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HakConnectionsService } from '../hak-connections.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit{
  
  selectedTeam!: string;
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.selectedTeam = params.get('selectedTeam')!;
    });
  }




  
  
}
