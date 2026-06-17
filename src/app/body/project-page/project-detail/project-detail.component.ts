import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PROJECTS, Project } from '../../../../data/projects';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  public project?: Project;
  public safeEmbed?: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.project = PROJECTS.find((p) => p.slug === slug);
    if (this.project?.embedUrl) {
      this.safeEmbed = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.project.embedUrl
      );
    }
  }
}
