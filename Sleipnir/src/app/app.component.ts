import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { LightComponent } from './light/light.component';
import { PressureComponent } from './pressure/pressure.component';
import { MonitorComponent } from './monitor/monitor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { PatternsComponent } from './patterns/patterns.component';
import { FormsModule } from '@angular/forms';
import { WavesComponent } from './waves/waves.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    WavesComponent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    LightComponent,
    PressureComponent,
    MonitorComponent,
    DashboardComponent,
    PatternsComponent,
  ],
})
export class AppComponent {
  title = 'Sleipnir';

  selectedMenuItem: string = 'pressure';

  public menuSelected(menuItem: string): void {
    this.selectedMenuItem = menuItem;
    console.log('Menu selected: ' + menuItem);
  }
}
