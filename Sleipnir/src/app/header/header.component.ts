import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {

  @Output() menuSelected = new EventEmitter<string>();

  public menuSelect(menuItem: string): void {
    this.menuSelected.emit(menuItem);
  }
}
