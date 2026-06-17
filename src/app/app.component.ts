import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { BodyComponent } from './body/body.component';
import { BackgroundFxComponent } from './background-fx/background-fx.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, BodyComponent, BackgroundFxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
