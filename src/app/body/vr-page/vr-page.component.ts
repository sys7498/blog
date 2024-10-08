import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { VrScenegraphService } from '../../../service/three-service/scene-service/vr-scene/vr-scenegraph.service';
import { WebSocket } from 'ws';
@Component({
  selector: 'app-vr-page',
  templateUrl: './vr-page.component.html',
  styleUrl: './vr-page.component.scss',
})
export class VrPageComponent {
  @ViewChild('vrViewport') vrViewport: ElementRef =
    undefined as unknown as ElementRef;
  constructor(private vrscene: VrScenegraphService) {}

  public ngAfterViewInit() {
    this.vrscene.initVrService(
      this.vrViewport.nativeElement,
      "Your research interest is in computer vision in virtual reality environments at KAIST's UVR Lab."
    );
    document.body.appendChild(VRButton.createButton(this.vrscene.renderer));
  }
  public ngOnDestroy() {
    this.vrscene.destroyAnimation();
  }
  @HostListener('mousemove', ['$event'])
  private onMouseMove(event: MouseEvent) {}
  @HostListener('window:resize')
  private onWindowResize() {
    this.vrscene.onResize();
  }
}
