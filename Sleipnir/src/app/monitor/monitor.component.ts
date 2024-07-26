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

  public isPressed: any = {};

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {}

  public buttonPress(event: Event, action: string, side: string): void {
    event.preventDefault();
    const element = (event.target as HTMLElement).closest('.button');

    if (action === 'hold') {
      this.isPressed[action + side] = false;
      if (element) {
        element.classList.remove('pressed');
      }
    } else {
      this.isPressed[action + side] = true;
      if (element) {
        element.classList.add('pressed');
      }
    }
    this.isPressed[action + side] = false;
    const payload = {
      "type": "pneumaticsCommandText",
      "command": action + side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload));
  }

  public move(side: string): void {
    this.isPressed[side] = true;
    const payload = {
      "type": "pneumaticsCommandText",
      "command": side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload))
  }

  public hold(side: string): void {
    this.isPressed['raise' + side] = false;
    this.isPressed['lower' + side] = false;
    const payload = {
      "type": "pneumaticsCommandText",
      "command": 'hold' + side,
      "sendTime": Date().toLocaleString()
    }
    console.log(JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload))
  }

  touchStart(event: TouchEvent, position: string) {
    event.preventDefault();
    this.isPressed[position] = true;
  }

  touchEnd(event: TouchEvent, position: string) {
    event.preventDefault();
    this.isPressed[position] = false;
  }
}
