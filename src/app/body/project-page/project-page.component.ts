import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PROJECTS } from '../../../data/projects';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-page.component.html',
  styleUrl: './project-page.component.scss',
})
export class ProjectPageComponent {
  public readonly projects = PROJECTS;
  constructor(private router: Router) {}

  public open(slug: string) {
    this.router.navigate(['/project', slug]);
  }
}
