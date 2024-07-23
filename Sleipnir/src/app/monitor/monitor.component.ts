import { Component, Inject } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {}

  public move(side: string): void {
    const payload = {
      "type": "pneumaticsCommandText",
      "command": side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload))
  }
}
