import { DecimalPipe, NgClass, UpperCasePipe } from '@angular/common'
import { Component, inject, Input } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe } from '@ngx-translate/core'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'
import { HeaterCoolerManageComponent } from '@/app/core/accessories/types/heater-cooler/heater-cooler.manage.component'
import { LongClickDirective } from '@/app/core/directives/long-click.directive'
import { ConvertTempPipe } from '@/app/core/pipes/convert-temp.pipe'
import { SettingsService } from '@/app/core/settings.service'

@Component({
  selector: 'app-heater-cooler',
  templateUrl: './heater-cooler.component.html',
  styleUrls: ['./heater-cooler.component.scss'],
  standalone: true,
  imports: [
    LongClickDirective,
    NgClass,
    DecimalPipe,
    TranslatePipe,
    ConvertTempPipe,
    UpperCasePipe,
  ],
})
export class HeaterCoolerComponent {
  private $modal = inject(NgbModal)
  private $settings = inject(SettingsService)

  @Input() public service: ServiceTypeX
  @Input() public type: 'heater' | 'cooler'

  public temperatureUnits = this.$settings.env.temperatureUnits
  public hasHeating: boolean = false
  public hasCooling: boolean = false

  public ngOnInit() {
    this.hasHeating = 'HeatingThresholdTemperature' in this.service.values
    this.hasCooling = 'CoolingThresholdTemperature' in this.service.values
  }

  public onClick() {
    if ('Active' in this.service.values) {
      this.service.getCharacteristic('Active').setValue(this.service.values.Active ? 0 : 1)
    } else if ('On' in this.service.values) {
      this.service.getCharacteristic('On').setValue(!this.service.values.On)
    }
  }

  public onLongClick() {
    if ('TargetHeaterCoolerState' in this.service.values) {
      const ref = this.$modal.open(HeaterCoolerManageComponent, {
        size: 'md',
        backdrop: 'static',
      })
      ref.componentInstance.service = this.service
    }
  }
}
