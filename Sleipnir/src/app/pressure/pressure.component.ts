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
    if (Object.prototype.hasOwnProperty.call(message, 'bowPort')) {
      if (message.bowPort.bowPortBallastValue !== undefined) {
        this.bowPortBallastValue = message.bowPort.bowPortBallastValue;
      }
      if (message.bowPort.bowPortPistonValue !== undefined) {
        this.bowPortPistonValue = message.bowPort.bowPortPistonValue;
      }
      if (message.bowPort.bowPortValveBallastIn !== undefined) {
        this.bowPortValveBallastIn = message.bowPort.bowPortValveBallastIn;
      }
      if (message.bowPort.bowPortValveBallastOut !== undefined) {
        this.bowPortValveBallastOut = message.bowPort.bowPortValveBallastOut;
      }
      if (message.bowPort.bowPortValveRelease !== undefined) {
        this.bowPortValveRelease = message.bowPort.bowPortValveRelease;
      }
    }
    if (Object.prototype.hasOwnProperty.call(message, 'bowStarboard')) {
      if (message.bowStarboard.bowStarboardBallastValue !== undefined) {
        this.bowStarboardBallastValue = message.bowStarboard.bowStarboardBallastValue;
      }
      if (message.bowStarboard.bowStarboardPistonValue !== undefined) {
        this.bowStarboardPistonValue = message.bowStarboard.bowStarboardPistonValue;
      }
      if (message.bowStarboard.bowStarboardValveBallastIn !== undefined) {
        this.bowStarboardValveBallastIn = message.bowStarboard.bowStarboardValveBallastIn;
      }
      if (message.bowStarboard.bowStarboardValveBallastOut !== undefined) {
        this.bowStarboardValveBallastOut = message.bowStarboard.bowStarboardValveBallastOut;
      }
      if (message.bowStarboard.bowStarboardValveRelease !== undefined) {
        this.bowStarboardValveRelease = message.bowStarboard.bowStarboardValveRelease;
      }
    }
    if (Object.prototype.hasOwnProperty.call(message, 'sternPort')) {
      if (message.sternPort.sternPortBallastValue !== undefined) {
        this.sternPortBallastValue = message.sternPort.sternPortBallastValue;
      }
      if (message.sternPort.sternPortPistonValue !== undefined) {
        this.sternPortPistonValue = message.sternPort.sternPortPistonValue;
      }
      if (message.sternPort.sternPortValveBallastIn !== undefined) {
        this.sternPortValveBallastIn = message.sternPort.sternPortValveBallastIn;
      }
      if (message.sternPort.sternPortValveBallastOut !== undefined) {
        this.sternPortValveBallastOut = message.sternPort.sternPortValveBallastOut;
      }
      if (message.sternPort.sternPortValveRelease !== undefined) {
        this.sternPortValveRelease = message.sternPort.sternPortValveRelease;
      }
    }
    if (Object.prototype.hasOwnProperty.call(message, 'sternStarboard')) {
      if (message.sternStarboard.sternStarboardBallastValue !== undefined) {
        this.sternStarboardBallastValue = message.sternStarboard.sternStarboardBallastValue;
      }
      if (message.sternStarboard.sternStarboardPistonValue !== undefined) {
        this.sternStarboardPistonValue = message.sternStarboard.sternStarboardPistonValue;
      }
      if (message.sternStarboard.sternStarboardValveBallastIn !== undefined) {
        this.sternStarboardValveBallastIn = message.sternStarboard.sternStarboardValveBallastIn;
      }
      if (message.sternStarboard.sternStarboardValveBallastOut !== undefined) {
        this.sternStarboardValveBallastOut = message.sternStarboard.sternStarboardValveBallastOut;
      }
      if (message.sternStarboard.sternStarboardValveRelease !== undefined) {
        this.sternStarboardValveRelease = message.sternStarboard.sternStarboardValveRelease;
      }
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
