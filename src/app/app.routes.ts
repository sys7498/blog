import { Routes } from '@angular/router';
import { HomePageComponent } from './body/home-page/home-page.component';
import { BlogPageComponent } from './body/blog-page/blog-page.component';
import { MainPageComponent } from './body/main-page/main-page.component';
import { ProjectDetailComponent } from './body/project-page/project-detail/project-detail.component';
import { PostDetailComponent } from './body/post-page/post-detail/post-detail.component';
import { PostEditorComponent } from './body/post-editor/post-editor.component';
import { PublicationPageComponent } from './body/publication-page/publication-page.component';
import { VrPageComponent } from './body/vr-page/vr-page.component';

export const routes: Routes = [
  // 싱글 페이지(about/education/news/publication/project 섹션) — 헤더가 스크롤 이동
  { path: '', component: HomePageComponent },
  // 블로그
  { path: 'posts', component: BlogPageComponent },
  { path: 'editor', component: PostEditorComponent },
  { path: 'post/:slug', component: PostDetailComponent },
  // 프로젝트 데모 / VR
  { path: 'publication', component: PublicationPageComponent },
  { path: 'project/:slug', component: ProjectDetailComponent },
  { path: 'vr', component: VrPageComponent },
  { path: 'sphere', component: MainPageComponent }, // 3D 구 (보존, 기본 아님)
  { path: '**', redirectTo: '' },
];
