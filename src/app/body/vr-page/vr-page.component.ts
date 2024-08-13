import { Component, ElementRef, ViewChild } from '@angular/core';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { ScenegraphService } from '../../../service/three-service/scene-service/scenegraph.service';
@Component({
  selector: 'app-vr-page',
  templateUrl: './vr-page.component.html',
  styleUrl: './vr-page.component.scss',
})
export class VrPageComponent {
  @ViewChild('vrViewport') vrViewport: ElementRef =
    undefined as unknown as ElementRef;
  constructor(private scene: ScenegraphService) {}

  public ngAfterViewInit() {
    this.scene.initVRService(this.vrViewport.nativeElement);
  }

  public ngOnDestroy() {
    this.scene.destroyAnimation();
  }
}
