import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-text-button',
  templateUrl: './text-button.component.html',
  styleUrl: './text-button.component.scss',
})
export class TextButtonComponent {
  @Input() content: string = 'BUTTON';
  @Input() color: string = 'black';
  @Input() backgroundColor: string = 'transparent';
  @Input() clicked: boolean = false;

  @Output() onClickEvent = new EventEmitter();
  constructor() {}
  public getClicked() {
    return this.clicked ? 'y-button y-button-clicked' : 'y-button';
  }
}
