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
  
  public bowPortBallastValue: any = 'unknown';
  public bowPortPistonValue: any = 'unknown';
  public bowPortValveBallastIn: any = 'unknown';
  public bowPortValveBallastOut: any = 'unknown';
  public bowPortValveRelease: any = 'unknown';

  public bowStarboardBallastValue: any = 'unknown';
  public bowStarboardPistonValue: any = 'unknown';
  public bowStarboardValveBallastIn: any = 'unknown';
  public bowStarboardValveBallastOut: any = 'unknown';
  public bowStarboardValveRelease: any = 'unknown';

  public sternPortBallastValue: any = 'unknown';
  public sternPortPistonValue: any = 'unknown';
  public sternPortValveBallastIn: any = 'unknown';
  public sternPortValveBallastOut: any = 'unknown';
  public sternPortValveRelease: any = 'unknown';

  public sternStarboardBallastValue: any = 'unknown';
  public sternStarboardPistonValue: any = 'unknown';
  public sternStarboardValveBallastIn: any = 'unknown';
  public sternStarboardValveBallastOut: any = 'unknown';
  public sternStarboardValveRelease: any = 'unknown';

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.websocketService.messages$.subscribe((message) => {
      this.handleIncomingMessage(message);
    });
  }

  private handleIncomingMessage(message: any): void {
    console.log('Message from server:', message);
    if (Object.hasOwn(message, 'bowPort')) {
      this.bowPortBallastValue = message.bowPort.bowPortBallastValue ?? 'unknown';
      this.bowPortPistonValue = message.bowPort.bowPortPistonValue ?? 'unknown';
      this.bowPortValveBallastIn = message.bowPort.bowPortValveBallastIn ?? 'unknown';
      this.bowPortValveBallastOut = message.bowPort.bowPortValveBallastOut ?? 'unknown';
      this.bowPortValveRelease = message.bowPort.bowPortValveRelease ?? 'unknown';
    }
    if (Object.hasOwn(message, 'bowStarboard')) {
      this.bowStarboardBallastValue = message.bowStarboard.bowStarboardBallastValue ?? 'unknown';
      this.bowStarboardPistonValue = message.bowStarboard.bowStarboardPistonValue ?? 'unknown';
      this.bowStarboardValveBallastIn = message.bowStarboard.bowStarboardValveBallastIn ?? 'unknown';
      this.bowStarboardValveBallastOut = message.bowStarboard.bowStarboardValveBallastOut ?? 'unknown';
      this.bowStarboardValveRelease = message.bowStarboard.bowStarboardValveRelease ?? 'unknown';
    }
    if (Object.hasOwn(message, 'sternPort')) {
      this.sternPortBallastValue = message.sternPort.sternPortBallastValue ?? 'unknown';
      this.sternPortPistonValue = message.sternPort.sternPortPistonValue ?? 'unknown';
      this.sternPortValveBallastIn = message.sternPort.sternPortValveBallastIn ?? 'unknown';
      this.sternPortValveBallastOut = message.sternPort.sternPortValveBallastOut ?? 'unknown';
      this.sternPortValveRelease = message.sternPort.sternPortValveRelease ?? 'unknown';
    }
    if (Object.hasOwn(message, 'sternStarboard')) {
      this.sternStarboardBallastValue = message.sternStarboard.sternStarboardBallastValue ?? 'unknown';
      this.sternStarboardPistonValue = message.sternStarboard.sternStarboardPistonValue ?? 'unknown';
      this.sternStarboardValveBallastIn = message.sternStarboard.sternStarboardValveBallastIn ?? 'unknown';
      this.sternStarboardValveBallastOut = message.sternStarboard.sternStarboardValveBallastOut ?? 'unknown';
      this.sternStarboardValveRelease = message.sternStarboard.sternStarboardValveRelease ?? 'unknown';
    }
  }
  
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
