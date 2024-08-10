import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;
  private messageSubject: Subject<any> = new Subject<any>();
  public messages$: Observable<any> = this.messageSubject.asObservable();

  constructor() {
    this.socket = new WebSocket('ws://192.168.0.101:8078');

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      console.log('Message received:', event.data);
      this.messageSubject.next(event.data);
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
