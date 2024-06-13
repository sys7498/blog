import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './body/main-page/main-page.component';
import { PostPageComponent } from './body/post-page/post-page.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'post', component: PostPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
