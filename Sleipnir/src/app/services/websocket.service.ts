import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket('ws://127.0.0.1:8078');

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      console.log('Message received:', event.data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
    public sendMessage(message: string): void {
      const messageToSend = JSON.stringify({ message });
      this.socket.send(messageToSend);
   }
}
