import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { HakConnectionsService } from '../hak-connections.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit{
  
  fields: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private hakConnectionsService: HakConnectionsService) {}

  ngOnInit(): void {
    this.loadFields();
  }


  loadFields(): void {
    this.loading = true;  // Set loading to true while the data is being fetched
    this.hakConnectionsService.getFieldList()
      .subscribe({
        next: (data) => {
          this.fields = data;  // Assign the data to the fields variable
          console.log(data)
          this.loading = false;  // Set loading to false after receiving the data
        },
        error: (error) => {
          this.errorMessage = 'Failed to load data';  // Set an error message if there's an issue
          this.loading = false;  // Set loading to false if there's an error
        }
      });
  }
  
}
