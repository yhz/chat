import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import User from '@shared/user.entity';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {

  @Input() user?: User | null;
  @Output() logout: EventEmitter<void> = new EventEmitter();

}
