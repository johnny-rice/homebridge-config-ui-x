import type { CharacteristicType } from '@homebridge/hap-client'

import { DecimalPipe, NgClass, UpperCasePipe } from '@angular/common'
import { Component, inject, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe } from '@ngx-translate/core'
import { NouisliderComponent } from 'ng2-nouislider'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'
import { ConvertTempPipe } from '@/app/core/pipes/convert-temp.pipe'
import { SettingsService } from '@/app/core/settings.service'

@Component({
  selector: 'app-heatercooler-manage',
  templateUrl: './heatercooler.manage.component.html',
  styleUrls: ['./heatercooler.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    NouisliderComponent,
    DecimalPipe,
    TranslatePipe,
    ConvertTempPipe,
    UpperCasePipe,
  ],
})
export class HeaterCoolerManageComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)
  $settings = inject(SettingsService)

  @Input() public service: ServiceTypeX

  public targetState: number
  public targetMode: number
  public targetTemperatureChanged: Subject<any> = new Subject<any>()
  public targetStateValidValues: number[] = []
  public CoolingThresholdTemperature: CharacteristicType
  public HeatingThresholdTemperature: CharacteristicType
  public targetCoolingTemp: number
  public targetHeatingTemp: number
  public autoTemp: [number, number]

  constructor() {
    this.targetTemperatureChanged
      .pipe(debounceTime(500))
      .subscribe(() => {
        if (this.HeatingThresholdTemperature) {
          this.service.getCharacteristic('HeatingThresholdTemperature').setValue(this.targetHeatingTemp)
        }
        if (this.CoolingThresholdTemperature) {
          this.service.getCharacteristic('CoolingThresholdTemperature').setValue(this.targetCoolingTemp)
        }
      })
  }

  ngOnInit() {
    this.targetState = this.service.values.Active
    this.targetMode = this.service.values.TargetHeaterCoolerState
    this.CoolingThresholdTemperature = this.service.getCharacteristic('CoolingThresholdTemperature')
    this.HeatingThresholdTemperature = this.service.getCharacteristic('HeatingThresholdTemperature')
    this.targetStateValidValues = this.service.getCharacteristic('TargetHeaterCoolerState').validValues as number[]
    this.loadTargetTemperature()
    setTimeout(() => {
      const sliderElements = document.querySelectorAll('.noUi-target')
      sliderElements.forEach((sliderElement: HTMLElement) => {
        sliderElement.style.background = 'linear-gradient(to right, rgb(80, 80, 179), rgb(173, 216, 230), rgb(255, 185, 120), rgb(139, 90, 60))'
      })
    }, 10)
  }

  loadTargetTemperature() {
    this.targetCoolingTemp = this.service.getCharacteristic('CoolingThresholdTemperature')?.value as number
    this.targetHeatingTemp = this.service.getCharacteristic('HeatingThresholdTemperature')?.value as number
    this.autoTemp = [this.targetHeatingTemp, this.targetCoolingTemp]
  }

  setTargetState(value: number) {
    this.targetState = value
    this.service.getCharacteristic('Active').setValue(this.targetState)
    this.loadTargetTemperature()
  }

  setTargetMode(value: number) {
    this.targetMode = value
    this.service.getCharacteristic('TargetHeaterCoolerState').setValue(this.targetMode)
    this.loadTargetTemperature()
  }

  onTemperatureStateChange() {
    this.autoTemp = [this.targetHeatingTemp, this.targetCoolingTemp]
    this.targetTemperatureChanged.next(undefined)
  }

  onAutoTemperatureStateChange() {
    this.targetHeatingTemp = this.autoTemp[0]
    this.targetCoolingTemp = this.autoTemp[1]
    this.targetTemperatureChanged.next(undefined)
  }
}
