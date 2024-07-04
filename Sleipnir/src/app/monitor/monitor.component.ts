import { Component } from '@angular/core';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {

  public move(side: string): void {
    console.log('Moving to ' + side);
  }
}
