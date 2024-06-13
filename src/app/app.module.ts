import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BodyComponent } from './body/body.component';
import { HeaderComponent } from './header/header.component';
import { MainPageComponent } from './body/main-page/main-page.component';
import { PostPageComponent } from './body/post-page/post-page.component';
import { TextButtonComponent } from './component/text-button/text-button.component';
import { AppRoutingModule } from './app.routes';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BodyComponent,
    MainPageComponent,
    PostPageComponent,

    TextButtonComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, CommonModule, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
