import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new BehaviorSubject<any>(null);
  private ports = [8078, 8090, 8091];
  private currentPortIndex = 0;
  private reconnectDelay = 1000; // 1 second delay between connection attempts

  constructor() {
    this.connect();
  }

  private connect(): void {
    const port = this.ports[this.currentPortIndex];
    this.socket = new WebSocket(`ws://0.0.0.0:${port}`);

    this.socket.onopen = () => {
      console.log(`Connected on port ${port}`);
    };

    this.socket.onmessage = (event) => {
      console.log('Message received:', event.data);
      console.log(event.data['Blob']);
    };

    this.socket.onclose = () => {
      console.log(`Connection closed on port ${port}`);
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error(`WebSocket error on port ${port}:`, error);
      this.socket?.close();
    };
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      this.currentPortIndex = (this.currentPortIndex + 1) % this.ports.length;
      this.connect();
    }, this.reconnectDelay);
  }
}