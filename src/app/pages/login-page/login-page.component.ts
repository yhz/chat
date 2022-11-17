import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MaxUsernameLength } from '@shared/constants';
import { Path } from '@client/common/constants';
import { AuthService } from '@client/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit, OnDestroy {

  public login: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(MaxUsernameLength),
    Validators.pattern(/^[\s\w\dа-яё]+$/iu),
  ]);

  private onDestroy$: Subject<void> = new Subject();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.login.valueChanges.pipe(
      takeUntil(this.onDestroy$),
    ).subscribe((value) => {
      const replacedValue = value.trimStart().replace(/\s{2,}/, ' ');
      if (replacedValue !== value) {
        this.login.setValue(replacedValue);
      }
    });
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public submit() {
    this.authService.login(this.login.value.trim()).subscribe(() => {
      this.router.navigate([Path.root]);
    });
  }

}
