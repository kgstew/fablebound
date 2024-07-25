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
    let movement: string = "";
    if (this.pistonSettings[side]) {
      this.pistonSettings[side] = !this.pistonSettings[side];
      movement = "raise";
    } else {
      this.pistonSettings[side] = !this.pistonSettings[side];
      movement = "lower";
    }
    const payload = {
      "type": "pneumaticsCommandText",
      "command": movement + side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload))
  }
}
