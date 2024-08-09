// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class WebsocketService {
//   private socket: WebSocket;

//   constructor() {
//     this.socket = new WebSocket('ws://0.0.0.0:8078');

//     this.socket.onopen = () => {
//       console.log('WebSocket connection established');
//     };

//     this.socket.onmessage = (event) => {
//       console.log('Message received:', event.data);
//       console.log(event.data['Blob']);
//     };

//     this.socket.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     this.socket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };
//   }
  
//     public sendMessage(message: string): void {
//       const messageToSend = JSON.stringify({ message });
//       this.socket.send(messageToSend);
//    }
// }


import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new BehaviorSubject<any>(null);
  private ports = [8078, 8079, 8080];
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

    public sendMessage(message: string): void {
      const messageToSend = JSON.stringify({ message });
      if (this.socket) { 
       this.socket.send(messageToSend);
      }
   }

  private scheduleReconnect(): void {
    setTimeout(() => {
      this.currentPortIndex = (this.currentPortIndex + 1) % this.ports.length;
      this.connect();
    }, this.reconnectDelay);
  }
}