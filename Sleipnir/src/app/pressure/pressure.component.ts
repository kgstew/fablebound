import { Component } from '@angular/core';

import { WebsocketService } from '../services/websocket.service';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-pressure',
  standalone: true,
  imports: [],
  templateUrl: './pressure.component.html',
  styleUrl: './pressure.component.css'
})
export class PressureComponent {
  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {} // Add the @Inject decorator

  public valveControl(unit: string, location: string, action: string): void {
    const payload = {
      location: location,
      action: action,
      unit: unit
    };
    console.log('Sending payload:', JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload));
  }
}
