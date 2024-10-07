import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './body/main-page/main-page.component';
import { PostPageComponent } from './body/post-page/post-page.component';
import { NgModule } from '@angular/core';
import { ProjectPageComponent } from './body/project-page/project-page.component';
import { VrPageComponent } from './body/vr-page/vr-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'post', component: PostPageComponent },
  { path: 'project', component: ProjectPageComponent },
  { path: 'vr', component: VrPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
