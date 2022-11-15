import { ChangeDetectionStrategy, Component, Input, TrackByFunction } from '@angular/core';
import User from '@shared/user.entity';
import { trackByUuid } from '@client/common/helpers';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {

  @Input() users!: User[] | null;
  public readonly trackByUuid: TrackByFunction<User> = trackByUuid;

}
