import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { filter, map, pairwise, Subject, take, takeUntil, tap } from 'rxjs';
import Message from '@shared/message.entity';
import User from '@shared/user.entity';
import { scrollTo, trackByUuid } from '@client/common/helpers';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageListComponent implements OnInit, OnDestroy {

  @ViewChild('scrollViewport') scrollViewport?: CdkVirtualScrollViewport;

  @Input() messages?: Message[] | null;
  @Input() currentUser?: User | null;
  @Output() onScrollNearTop: EventEmitter<void> = new EventEmitter();

  public readonly ITEM_SIZE: number = 90;
  public readonly trackByUuid: TrackByFunction<Message> = trackByUuid;
  public readonly scrolledIndex$: Subject<number> = new Subject();
  private onDestroy$: Subject<void> = new Subject();

  public ngOnInit(): void {
    this.scrolledIndex$.pipe(
      filter(() => !!this.scrollViewport && !!this.messages),
      take(1),
      tap(() => this.scrollToBottom()),
      takeUntil(this.onDestroy$),
    ).subscribe();

    this.scrolledIndex$.pipe(
      pairwise(),
      filter(([olderIndex, newestIndex]) => olderIndex > newestIndex && newestIndex === 0),
      map(() => this.messages?.length ?? 0),
      tap(() => this.onScrollNearTop.emit()),
      tap((oldLength) => {
        const newLength = this.messages?.length ?? 0;
        this.scrollViewport?.scrollToIndex(newLength - oldLength + 1);
      }),
      takeUntil(this.onDestroy$),
    ).subscribe();
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public scrollToBottom(): void {
    const target = this.scrollViewport?.elementRef.nativeElement;

    if (this.messages && target) {
      const bottomPosition = target.scrollHeight - target.offsetHeight + this.ITEM_SIZE;
      scrollTo(bottomPosition, target, 300);
    }
  }

}
