import { Routes } from '@angular/router';
import { HomePageComponent } from './body/home-page/home-page.component';
import { BlogPageComponent } from './body/blog-page/blog-page.component';
import { MainPageComponent } from './body/main-page/main-page.component';
import { PostDetailComponent } from './body/post-page/post-detail/post-detail.component';
import { PostEditorComponent } from './body/post-editor/post-editor.component';
import { PublicationPageComponent } from './body/publication-page/publication-page.component';
import { VrPageComponent } from './body/vr-page/vr-page.component';

export const routes: Routes = [
  // 싱글 페이지(about/education/news/publication 섹션) — 헤더가 스크롤 이동
  { path: '', component: HomePageComponent },
  // 블로그
  { path: 'posts', component: BlogPageComponent },
  { path: 'posts/write', component: PostEditorComponent },
  { path: 'post/:slug/edit', component: PostEditorComponent },
  { path: 'post/:slug', component: PostDetailComponent },
  // 프로젝트 데모 / VR
  { path: 'publication', component: PublicationPageComponent },
  { path: 'vr', component: VrPageComponent },
  { path: 'sphere', component: MainPageComponent }, // 3D 구 (보존, 기본 아님)
  { path: '**', redirectTo: '' },
];
