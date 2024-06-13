import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BodyComponent } from './body/body.component';
import { ScenegraphService } from '../service/three-service/scene-service/scenegraph.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BodyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private scene: ScenegraphService) {}
  title = 'blog';
  @HostListener('window:resize')
  private onWindowResize() {
    this.scene.onResize();
  }
}
