import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg-2';

import { AppRoutingModule } from '@client/app-routing.module';
import { AppComponent } from '@client/app.component';
import { LoginPageComponent } from '@client/pages/login-page/login-page.component';
import { ChatPageComponent } from '@client/pages/chat-page/chat-page.component';
import { UserListComponent } from '@client/components/user-list/user-list.component';
import { MessageInputComponent } from '@client/components/message-input/message-input.component';
import { MessageListComponent } from '@client/components/message-list/message-list.component';
import { ProfileComponent } from '@client/components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    ChatPageComponent,
    UserListComponent,
    MessageInputComponent,
    MessageListComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    HttpClientModule,
    InlineSVGModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
