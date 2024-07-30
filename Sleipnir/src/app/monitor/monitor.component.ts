import { Component, Inject } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [NgClass],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {}

  public buttonPress(event: Event, action: string, side: string): void {
    event.preventDefault();
    const element = (event.target as HTMLElement).closest('.button');

    if (action === 'hold') {
      if (element) {
        element.classList.remove('pressed');
      }
    } else {
      if (element) {
        element.classList.add('pressed');
      }
    }
    const payload = {
      "type": "pneumaticsCommandText",
      "command": action + side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload));
  }
}
