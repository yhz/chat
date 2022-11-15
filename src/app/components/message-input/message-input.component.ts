import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MaxMessageLength } from '@shared/constants';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageInputComponent implements OnInit, OnDestroy {

  @ViewChild('field') fieldElement?: ElementRef<HTMLTextAreaElement>;
  @Output() onSend: EventEmitter<string> = new EventEmitter();

  private onDestroy$: Subject<void> = new Subject();
  private DEFAULT_FIELD_HEIGHT_PX: number = 46;
  public fieldHeightPx: number = this.DEFAULT_FIELD_HEIGHT_PX;
  public readonly MAX_LENGTH: number = MaxMessageLength;
  public readonly messageControl: FormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(this.MAX_LENGTH),
  ]);

  constructor(
    private changeDetector: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.messageControl.valueChanges.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((value) => {
      if (value && this.messageControl.invalid) {
        this.messageControl.setValue(value.slice(0, this.MAX_LENGTH));
      }

      if (!this.fieldElement?.nativeElement) {
        return;
      }

      const scrollHeight = this.fieldElement.nativeElement.scrollHeight;
      this.fieldHeightPx = value ? scrollHeight : this.DEFAULT_FIELD_HEIGHT_PX;
    });
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public sendMessage(event: Event): void {
    event.preventDefault();
    if (this.messageControl.invalid) {
      return;
    }

    this.onSend.emit(this.messageControl.value);
  }

  public clearField(): void {
    this.messageControl.setValue('');
    this.changeDetector.detectChanges();
  }
}
