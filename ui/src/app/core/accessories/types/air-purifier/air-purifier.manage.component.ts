import { NgClass } from '@angular/common'
import { Component, inject, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe } from '@ngx-translate/core'
import { NouisliderComponent } from 'ng2-nouislider'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'

@Component({
  templateUrl: './air-purifier.manage.component.html',
  styleUrls: ['./air-purifier.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NouisliderComponent,
    TranslatePipe,
    NgClass,
  ],
})
export class AirPurifierManageComponent implements OnInit {
  private $activeModal = inject(NgbActiveModal)

  @Input() public service: ServiceTypeX

  public targetState: number
  public targetMode: number
  public targetModeValidValues: number[] = []
  public targetRotationSpeed: any
  public targetRotationSpeedChanged: Subject<string> = new Subject<string>()

  constructor() {
    this.targetRotationSpeedChanged
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.service.getCharacteristic('RotationSpeed').setValue(this.targetRotationSpeed.value)

        // Turn the air purifier on or off when rotation speed is adjusted
        if (this.targetRotationSpeed.value && !this.service.values.Active) {
          this.targetState = 1
          this.service.getCharacteristic('Active').setValue(this.targetMode)
        } else if (!this.targetRotationSpeed.value && this.service.values.Active) {
          this.targetState = 0
          this.service.getCharacteristic('Active').setValue(this.targetMode)
        }
      })
  }

  public ngOnInit() {
    this.targetState = this.service.values.Active
    this.targetMode = this.service.values.TargetAirPurifierState
    this.targetModeValidValues = this.service.getCharacteristic('TargetAirPurifierState').validValues as number[]
    this.loadRotationSpeed()
  }

  public setTargetState(value: number, event: MouseEvent) {
    this.targetState = value
    this.service.getCharacteristic('Active').setValue(this.targetState)

    // Set the rotation speed to max if on 0% when turned on
    if (this.targetState && this.targetRotationSpeed && !this.targetRotationSpeed.value) {
      this.targetRotationSpeed.value = this.service.getCharacteristic('RotationSpeed').maxValue
    }

    const target = event.target as HTMLButtonElement
    target.blur()
  }

  public setTargetMode(value: number, event: MouseEvent) {
    this.targetMode = value
    this.service.getCharacteristic('TargetAirPurifierState').setValue(this.targetMode)

    const target = event.target as HTMLButtonElement
    target.blur()
  }

  public onTargetRotationSpeedChange() {
    this.targetRotationSpeedChanged.next(this.targetRotationSpeed.value)
  }

  public dismissModal() {
    this.$activeModal.dismiss('Dismiss')
  }

  private loadRotationSpeed() {
    const RotationSpeed = this.service.getCharacteristic('RotationSpeed')
    if (RotationSpeed) {
      this.targetRotationSpeed = {
        value: RotationSpeed.value,
        min: RotationSpeed.minValue,
        max: RotationSpeed.maxValue,
        step: RotationSpeed.minStep,
      }
      setTimeout(() => {
        const sliderElements = document.querySelectorAll('.noUi-target')
        sliderElements.forEach((sliderElement: HTMLElement) => {
          sliderElement.style.background = 'linear-gradient(to right, #add8e6, #416bdf)'
        })
      }, 10)
    }
  }
}
