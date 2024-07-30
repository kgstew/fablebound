import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-patterns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patterns.component.html',
  styleUrl: './patterns.component.css'
})
export class PatternsComponent {

  constructor(@Inject(WebsocketService) private websocketService: WebsocketService) {}
  
  public patternName: string = '';
  public patterns: any = [];

  public buttonPress(event: Event, action: string): void {
    event.preventDefault();
    
    if (action !== undefined) {
      const element = (event.target as HTMLElement).closest('.button');
      element && element.classList.add('pressed');
      
      const payload = {
        "type": "pneumaticsCommandPattern",
        "pattern": action,
        "sendTime": Date().toLocaleString()
      }
      console.log(JSON.stringify(payload));
      this.websocketService.sendMessage(JSON.stringify(payload));
    }
  }

  public buttonRelease(event: Event, action: string): void {
    event.preventDefault();
    const element = (event.target as HTMLElement).closest('.button');
    element && element.classList.remove('pressed');

    if (action !== '') {
      const payload = {
        "type": "pneumaticsCommandPattern",
        "pattern": action,
        "sendTime": Date().toLocaleString()
      }
      console.log(JSON.stringify(payload));
      this.websocketService.sendMessage(JSON.stringify(payload));
    }
  }

  public savePattern(): void {
    this.patterns.push(this.patternName);
    this.patternName = '';
  }
}
