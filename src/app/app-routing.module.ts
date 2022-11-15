import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatPageComponent } from '@client/pages/chat-page/chat-page.component';
import { AuthGuard } from '@client/guards/auth.guard';
import { LoginPageComponent } from '@client/pages/login-page/login-page.component';

export enum Path {
  root = '',
  login = 'login',
};

const routes: Routes = [
  {
    path: Path.root,
    component: ChatPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: Path.login,
    component: LoginPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
