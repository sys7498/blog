import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ScenegraphService } from '../../../service/three-service/scene-service/main-scene/scenegraph.service';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [],
  templateUrl: './project-page.component.html',
  styleUrl: './project-page.component.scss',
})
export class ProjectPageComponent {
  @ViewChild('viewport') viewport: ElementRef =
    undefined as unknown as ElementRef;
  constructor(private scene: ScenegraphService) {}

  public ngAfterViewInit() {
    this.scene.initService(this.viewport.nativeElement);
  }

  public ngOnDestroy() {
    this.scene.destroyAnimation();
  }

  @HostListener('mousemove', ['$event'])
  private onMouseMove(event: MouseEvent) {}
  @HostListener('window:resize')
  private onWindowResize() {
    this.scene.onResize();
  }
}
