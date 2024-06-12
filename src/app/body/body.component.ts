import { Component, ElementRef, ViewChild } from '@angular/core';
import { ScenegraphService } from '../../service/three-service/scene-service/scenegraph.service';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss',
})
export class BodyComponent {
  @ViewChild('viewport') viewport: ElementRef =
    undefined as unknown as ElementRef;
  constructor(private scene: ScenegraphService) {}
  ngAfterViewInit() {
    console.log('viewport', this.viewport);
    this.scene.initService(this.viewport.nativeElement);
  }
}
