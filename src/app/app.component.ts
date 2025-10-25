import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HakConnectionsService } from './hak-connections.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [HakConnectionsService]
})
export class AppComponent {
  title = 'prod-plot';
}
