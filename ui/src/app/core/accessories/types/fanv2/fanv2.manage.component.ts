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
  selector: 'app-fanv2-manage',
  templateUrl: './fanv2.manage.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NouisliderComponent,
    TranslatePipe,
    NgClass,
  ],
})
export class Fanv2ManageComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)

  @Input() public service: ServiceTypeX

  public targetMode: number
  public targetRotationSpeed: any
  public targetRotationSpeedChanged: Subject<string> = new Subject<string>()
  public hasRotationDirection = false

  constructor() {
    this.targetRotationSpeedChanged
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.service.getCharacteristic('RotationSpeed').setValue(this.targetRotationSpeed.value)

        // Turn fan on or off when rotation speed is adjusted
        if (this.targetRotationSpeed.value && !this.service.values.Active) {
          this.targetMode = 1
          this.service.getCharacteristic('Active').setValue(this.targetMode)
        } else if (!this.targetRotationSpeed.value && this.service.values.Active) {
          this.targetMode = 0
          this.service.getCharacteristic('Active').setValue(this.targetMode)
        }
      })
  }

  ngOnInit() {
    this.targetMode = this.service.values.Active
    this.loadRotationSpeed()
    if (this.service.serviceCharacteristics.find(c => c.type === 'RotationDirection')) {
      this.hasRotationDirection = true
    }
  }

  loadRotationSpeed() {
    const RotationSpeed = this.service.getCharacteristic('RotationSpeed')
    if (RotationSpeed) {
      this.targetRotationSpeed = {
        value: RotationSpeed.value,
        min: RotationSpeed.minValue,
        max: RotationSpeed.maxValue,
        step: RotationSpeed.minStep,
        unit: RotationSpeed.unit,
      }
      setTimeout(() => {
        const sliderElements = document.querySelectorAll('.noUi-target')
        sliderElements.forEach((sliderElement: HTMLElement) => {
          sliderElement.style.background = 'linear-gradient(to right, #add8e6, #416bdf)'
        })
      }, 10)
    }
  }

  setTargetMode(value: number) {
    this.targetMode = value
    this.service.getCharacteristic('Active').setValue(this.targetMode)

    // Set the rotation speed to max if on 0% when turned on
    if (this.targetMode && this.targetRotationSpeed && !this.targetRotationSpeed.value) {
      this.targetRotationSpeed.value = this.service.getCharacteristic('RotationSpeed').maxValue
    }
  }

  onTargetRotationSpeedChange() {
    this.targetRotationSpeedChanged.next(this.targetRotationSpeed.value)
  }

  setRotationDirection(value: number) {
    this.service.getCharacteristic('RotationDirection').setValue(value)
  }
}
