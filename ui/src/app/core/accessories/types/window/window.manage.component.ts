import { Component, inject, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe } from '@ngx-translate/core'
import { NouisliderComponent } from 'ng2-nouislider'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'

@Component({
  selector: 'app-window-manage',
  templateUrl: './window.manage.component.html',
  styleUrls: ['./window.component.scss'],
  standalone: true,
  imports: [
    NouisliderComponent,
    FormsModule,
    TranslatePipe,
  ],
})
export class WindowManageComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)

  @Input() public service: ServiceTypeX
  public targetMode: string
  public targetPosition: {
    value: any
    min: number
    max: number
    step: number
  }

  public targetPositionChanged: Subject<string> = new Subject<string>()

  constructor() {
    this.targetPositionChanged
      .pipe(debounceTime(500))
      .subscribe(() => {
        if (this.service.getCharacteristic('CurrentPosition').value < this.targetPosition.value) {
          this.service.values.PositionState = 1
        } else if (this.service.getCharacteristic('CurrentPosition').value > this.targetPosition.value) {
          this.service.values.PositionState = 0
        }
        this.service.getCharacteristic('TargetPosition').setValue(this.targetPosition.value)
      })
  }

  ngOnInit() {
    this.targetMode = this.service.values.On
    this.loadTargetPosition()
  }

  loadTargetPosition() {
    const TargetPosition = this.service.getCharacteristic('TargetPosition')

    if (TargetPosition) {
      this.targetPosition = {
        value: TargetPosition.value,
        min: TargetPosition.minValue,
        max: TargetPosition.maxValue,
        step: TargetPosition.minStep,
      }

      setTimeout(() => {
        const sliderElements = document.querySelectorAll('.noUi-target')
        sliderElements.forEach((sliderElement: HTMLElement) => {
          sliderElement.style.background = 'linear-gradient(to right, #242424, #ffd6aa)'
        })
      }, 10)
    }
  }

  onTargetPositionChange() {
    this.targetPositionChanged.next(this.targetPosition.value)
  }
}
