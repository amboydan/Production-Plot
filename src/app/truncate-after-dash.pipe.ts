import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'truncateAfterDash',
  standalone: true
})
@Injectable({
  providedIn: 'root'
})
export class TruncateAfterDashPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const idx = value.indexOf('-');
    return idx !== -1 ? value.substring(0, idx).trim() : value;
  }
}

