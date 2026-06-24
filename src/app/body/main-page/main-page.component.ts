import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScenegraphService } from '../../../service/three-service/scene-service/main-scene/scenegraph.service';
import { PROFILE } from '../../../data/profile';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  @ViewChild('viewport') viewport: ElementRef =
    undefined as unknown as ElementRef;

  public readonly profile = PROFILE;
  public readonly explore = [
    { path: '/', label: 'about' },
    { path: '/publication', label: 'publications' },
    { path: '/project', label: 'projects' },
    { path: '/post', label: 'posts' },
  ];

  constructor(private scene: ScenegraphService, private router: Router) {}

  public ngAfterViewInit() {
    this.scene.initService(this.viewport.nativeElement);
    this.scene.setLayout(window.innerWidth);
  }

  public ngOnDestroy() {
    this.scene.destroyAnimation();
  }

  public go(path: string) {
    this.router.navigate([path]);
  }

  @HostListener('window:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent) {
    this.scene.setMouse(event.clientX, event.clientY);
  }
  @HostListener('window:resize')
  public onWindowResize() {
    this.scene.onResize();
  }
}
