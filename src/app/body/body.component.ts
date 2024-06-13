import { Component, ElementRef, ViewChild } from '@angular/core';
import { ScenegraphService } from '../../service/three-service/scene-service/scenegraph.service';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss',
})
export class BodyComponent {
  constructor() {}
}
