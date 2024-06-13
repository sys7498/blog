import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ScenegraphService } from '../../../service/three-service/scene-service/scenegraph.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
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
