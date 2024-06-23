import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Inject } from '@angular/core';
import { state } from '@angular/animations';

@Component({
  selector: 'app-pressure',
  standalone: true,
  imports: [],
  templateUrl: './pressure.component.html',
  styleUrl: './pressure.component.css'
})

export class PressureComponent {
  
  public bowPortBallastValue: number = 100;

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {} // Add the @Inject decorator
  
  public valveControl(unit: string, location: string, action: string): void {
    const payload = {
      type: "pneumaticsCommandGranular",
      command: {
        assembly: location,
        valve: unit,
        state: action
      },
      sendTime: new Date().toString()
    };
    console.log('Sending payload:', JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload));
  }

  public setBow(bow: number): void {
    this.bowPortBallastValue = bow;
  }
}
