import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { VrScenegraphService } from '../../../service/three-service/scene-service/vr-scene/vr-scenegraph.service';

@Component({
  selector: 'app-vr-page',
  standalone: true,
  imports: [],
  templateUrl: './vr-page.component.html',
  styleUrl: './vr-page.component.scss',
})
export class VrPageComponent {
  @ViewChild('vrViewport') vrViewport: ElementRef =
    undefined as unknown as ElementRef;
  constructor(private vrscene: VrScenegraphService) {}

  public ngAfterViewInit() {
    this.vrscene.initVrService(this.vrViewport.nativeElement);
  }
  public ngOnDestroy() {
    this.vrscene.destroyAnimation();
  }
  @HostListener('mousemove', ['$event'])
  public onMouseMove(event: MouseEvent) {}
  @HostListener('window:resize')
  public onWindowResize() {
    this.vrscene.onResize();
  }
}
