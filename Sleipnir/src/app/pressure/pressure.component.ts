import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Inject } from '@angular/core';
import { state } from '@angular/animations';

@Component({
  selector: 'app-pressure',
  standalone: true,
  imports: [],
  templateUrl: './pressure.component.html',
  styleUrl: './pressure.component.css',
})
export class PressureComponent {
  public currentPattern: any = 'unknown';

  public bowPortDistanceValue: any = 'unknown';
  public bowPortBallastValue: any = 'unknown';
  public bowPortPistonValue: any = 'unknown';
  public bowPortValveBallastIn: any = 'unknown';
  public bowPortValveBallastOut: any = 'unknown';
  public bowPortValveRelease: any = 'unknown';

  public bowStarboardDistanceValue: any = 'unknown';
  public bowStarboardBallastValue: any = 'unknown';
  public bowStarboardPistonValue: any = 'unknown';
  public bowStarboardValveBallastIn: any = 'unknown';
  public bowStarboardValveBallastOut: any = 'unknown';
  public bowStarboardValveRelease: any = 'unknown';

  public sternPortDistanceValue: any = 'unknown';
  public sternPortBallastValue: any = 'unknown';
  public sternPortPistonValue: any = 'unknown';
  public sternPortValveBallastIn: any = 'unknown';
  public sternPortValveBallastOut: any = 'unknown';
  public sternPortValveRelease: any = 'unknown';

  public sternStarboardDistanceValue: any = 'unknown';
  public sternStarboardBallastValue: any = 'unknown';
  public sternStarboardPistonValue: any = 'unknown';
  public sternStarboardValveBallastIn: any = 'unknown';
  public sternStarboardValveBallastOut: any = 'unknown';
  public sternStarboardValveRelease: any = 'unknown';

  constructor(
    @Inject(WebsocketService) private websocketService: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.websocketService.messages$.subscribe((message) => {
      this.handleIncomingMessage(message);
    });
  }

  private handleIncomingMessage(message: any): void {
    console.log('Message from server:', message);
    if (Object.prototype.hasOwnProperty.call(message, 'currentPattern')) {
      this.currentPattern = message.currentPattern;
    }
    if (Object.prototype.hasOwnProperty.call(message, 'bowPort')) {
      if (message.bowPort.distanceSensorPosition !== undefined) {
        this.bowPortBallastValue = message.bowPort.distanceSensorPosition;
      }
      if (message.bowPort.ballastPressurePsi !== undefined) {
        this.bowPortBallastValue = message.bowPort.ballastPressurePsi;
      }
      if (message.bowPort.pistonPressurePsi !== undefined) {
        this.bowPortPistonValue = message.bowPort.pistonPressurePsi;
      }
      if (message.bowPort.ballastIntakeValve !== undefined) {
        this.bowPortValveBallastIn = message.bowPort.ballastIntakeValve;
      }
      if (message.bowPort.ballastToPistonValve !== undefined) {
        this.bowPortValveBallastOut = message.bowPort.ballastToPistonValve;
      }
      if (message.bowPort.pistonReleaseValve !== undefined) {
        this.bowPortValveRelease = message.bowPort.pistonReleaseValve;
      }
    }
    if (Object.prototype.hasOwnProperty.call(message, 'bowStarboard')) {
      if (message.bowStarboard.distanceSensorPosition !== undefined) {
        this.bowPortBallastValue = message.bowStarboard.distanceSensorPosition;
      }
      if (message.bowStarboard.ballastPressurePsi !== undefined) {
        this.bowStarboardBallastValue = message.bowStarboard.ballastPressurePsi;
      }
      if (message.bowStarboard.pistonPressurePsi !== undefined) {
        this.bowStarboardPistonValue = message.bowStarboard.pistonPressurePsi;
      }
      if (message.bowStarboard.ballastIntakeValve !== undefined) {
        this.bowStarboardValveBallastIn =
          message.bowStarboard.ballastIntakeValve;
      }
      if (message.bowStarboard.ballastToPistonValve !== undefined) {
        this.bowStarboardValveBallastOut =
          message.bowStarboard.ballastToPistonValve;
      }
      if (message.bowStarboard.pistonReleaseValve !== undefined) {
        this.bowStarboardValveRelease = message.bowStarboard.pistonReleaseValve;
      }
    }
    if (Object.prototype.hasOwnProperty.call(message, 'sternPort')) {
      if (message.sternPort.distanceSensorPosition !== undefined) {
        this.bowPortBallastValue = message.sternPort.distanceSensorPosition;
      }
      if (message.sternPort.ballastPressurePsi !== undefined) {
        this.sternPortBallastValue = message.sternPort.ballastPressurePsi;
      }
      if (message.sternPort.pistonPressurePsi !== undefined) {
        this.sternPortPistonValue = message.sternPort.pistonPressurePsi;
      }
      if (message.sternPort.ballastIntakeValve !== undefined) {
        this.sternPortValveBallastIn = message.sternPort.ballastIntakeValve;
      }
      if (message.sternPort.ballastToPistonValve !== undefined) {
        this.sternPortValveBallastOut = message.sternPort.ballastToPistonValve;
      }
      if (message.sternPort.pistonReleaseValve !== undefined) {
        this.sternPortValveRelease = message.sternPort.pistonReleaseValve;
      }
    }
    if (Object.prototype.hasOwnProperty.call(message, 'sternStarboard')) {
      if (message.sternStarboard.distanceSensorPosition !== undefined) {
        this.sternStarboardBallastValue =
          message.sternStarboard.distanceSensorPosition;
      }
      if (message.sternStarboard.ballastPressurePsi !== undefined) {
        this.sternStarboardBallastValue =
          message.sternStarboard.ballastPressurePsi;
      }
      if (message.sternStarboard.pistonPressurePsi !== undefined) {
        this.sternStarboardPistonValue =
          message.sternStarboard.pistonPressurePsi;
      }
      if (message.sternStarboard.ballastIntakeValve !== undefined) {
        this.sternStarboardValveBallastIn =
          message.sternStarboard.ballastIntakeValve;
      }
      if (message.sternStarboard.ballastToPistonValve !== undefined) {
        this.sternStarboardValveBallastOut =
          message.sternStarboard.ballastToPistonValve;
      }
      if (message.sternStarboard.pistonReleaseValve !== undefined) {
        this.sternStarboardValveRelease =
          message.sternStarboard.pistonReleaseValve;
      }
    }
  }

  public valveControl(unit: string, location: string, action: string): void {
    const payload = {
      type: 'pneumaticsCommandGranular',
      command: {
        assembly: location,
        valve: unit,
        state: action,
      },
      sendTime: new Date().toString(),
    };
    console.log('Sending payload:', JSON.stringify(payload));
    this.websocketService.sendMessage(JSON.stringify(payload));
  }

  public setBow(bow: number): void {
    this.bowPortBallastValue = bow;
  }
}
