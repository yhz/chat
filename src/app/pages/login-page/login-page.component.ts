import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaxUsernameLength } from '@shared/constants';
import { AuthService } from '@client/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  public login: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(MaxUsernameLength),
    Validators.pattern(/^[\s\w\d]+$/i)
  ]);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  public submit() {
    this.authService.login(this.login.value).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
