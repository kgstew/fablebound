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

  public pistonSettings: any;
  public isPressed: boolean = false;

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {}

  ngOnInit() {
    this.pistonSettings = {
      "Bow": true,
      "Port": true,
      "BowPort": true,
      "BowStarboard": true,
      "SternPort": true,
      "SternStarboard": true,
      "Starboard": true,
      "Stern": true
    }
  }

  public move(side: string): void {
    this.isPressed = true;
    const payload = {
      "type": "pneumaticsCommandText",
      "command": side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload))
  }

  public hold(side: string): void {
    this.isPressed = false;
    const payload = {
      "type": "pneumaticsCommandText",
      "command": 'hold' + side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload))
  }
}
