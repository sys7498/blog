import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { VrScenegraphService } from '../../../service/three-service/scene-service/vr-scene/vr-scenegraph.service';
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
    this.vrscene.initVrService(this.vrViewport.nativeElement);
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
