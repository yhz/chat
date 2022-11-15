import { Subject } from 'rxjs';
import User from '@shared/user.entity';
import RpcAlert from '@shared/rpcAlert';
import { Service } from '@server/common/service.decorator';

@Service
export default class AlertService {

  private alert$: Subject<[User | null, RpcAlert]> = new Subject();
  public readonly onAlert$ = this.alert$.asObservable();

  public notify(
    alertName: string,
    params: unknown,
    excludeUser: User | null = null,
  ): void {
    const request = new RpcAlert(alertName, params);
    this.alert$.next([excludeUser, request]);
  }

}
