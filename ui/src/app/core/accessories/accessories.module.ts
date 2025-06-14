import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import { NouisliderModule } from 'ng2-nouislider'
import { NgxMdModule } from 'ngx-md'

import { AccessoriesService } from '@/app/core/accessories/accessories.service'
import { AccessoryInfoComponent } from '@/app/core/accessories/accessory-info/accessory-info.component'
import { AccessoryTileComponent } from '@/app/core/accessories/accessory-tile/accessory-tile.component'
import { AirpurifierComponent } from '@/app/core/accessories/types/airpurifier/airpurifier.component'
import { AirpurifierManageComponent } from '@/app/core/accessories/types/airpurifier/airpurifier.manage.component'
import { AirqualitysensorComponent } from '@/app/core/accessories/types/airqualitysensor/airqualitysensor.component'
import { BatteryComponent } from '@/app/core/accessories/types/battery/battery.component'
import { CarbondioxidesensorComponent } from '@/app/core/accessories/types/carbondioxidesensor/carbondioxidesensor.component'
import { CarbonmonoxidesensorComponent } from '@/app/core/accessories/types/carbonmonoxidesensor/carbonmonoxidesensor.component'
import { ContactsensorComponent } from '@/app/core/accessories/types/contactsensor/contactsensor.component'
import { DoorComponent } from '@/app/core/accessories/types/door/door.component'
import { DoorManageComponent } from '@/app/core/accessories/types/door/door.manage.component'
import { FanComponent } from '@/app/core/accessories/types/fan/fan.component'
import { FanManageComponent } from '@/app/core/accessories/types/fan/fan.manage.component'
import { Fanv2Component } from '@/app/core/accessories/types/fanv2/fanv2.component'
import { Fanv2ManageComponent } from '@/app/core/accessories/types/fanv2/fanv2.manage.component'
import { GaragedooropenerComponent } from '@/app/core/accessories/types/garagedooropener/garagedooropener.component'
import { HeaterCoolerComponent } from '@/app/core/accessories/types/heatercooler/heatercooler.component'
import { HeaterCoolerManageComponent } from '@/app/core/accessories/types/heatercooler/heatercooler.manage.component'
import { HumidifierDehumidifierComponent } from '@/app/core/accessories/types/humidifierdehumidifier/humidifierdehumidifier.component'
import { HumidifierDehumidifierManageComponent } from '@/app/core/accessories/types/humidifierdehumidifier/humidifierdehumidifier.manage.component'
import { HumiditysensorComponent } from '@/app/core/accessories/types/humiditysensor/humiditysensor.component'
import { IrrigationSystemComponent } from '@/app/core/accessories/types/irrigationsystem/irrigationsystem.component'
import { LeaksensorComponent } from '@/app/core/accessories/types/leaksensor/leaksensor.component'
import { LightbulbComponent } from '@/app/core/accessories/types/lightbulb/lightbulb.component'
import { LightbulbManageComponent } from '@/app/core/accessories/types/lightbulb/lightbulb.manage.component'
import { LightsensorComponent } from '@/app/core/accessories/types/lightsensor/lightsensor.component'
import { LockmechanismComponent } from '@/app/core/accessories/types/lockmechanism/lockmechanism.component'
import { LockmechanismManageComponent } from '@/app/core/accessories/types/lockmechanism/lockmechanism.manage.component'
import { MotionsensorComponent } from '@/app/core/accessories/types/motionsensor/motionsensor.component'
import { OccupancysensorComponent } from '@/app/core/accessories/types/occupancysensor/occupancysensor.component'
import { OutletComponent } from '@/app/core/accessories/types/outlet/outlet.component'
import { SecuritysystemComponent } from '@/app/core/accessories/types/securitysystem/securitysystem.component'
import { SecuritysystemManageComponent } from '@/app/core/accessories/types/securitysystem/securitysystem.manage.component'
import { SmokesensorComponent } from '@/app/core/accessories/types/smokesensor/smokesensor.component'
import { SpeakerComponent } from '@/app/core/accessories/types/speaker/speaker.component'
import { SpeakerManageComponent } from '@/app/core/accessories/types/speaker/speaker.manage.component'
import { StatelessprogrammableswitchComponent } from '@/app/core/accessories/types/statelessprogrammableswitch/statelessprogrammableswitch.component'
import { SwitchComponent } from '@/app/core/accessories/types/switch/switch.component'
import { TelevisionComponent } from '@/app/core/accessories/types/television/television.component'
import { TemperaturesensorComponent } from '@/app/core/accessories/types/temperaturesensor/temperaturesensor.component'
import { ThermostatComponent } from '@/app/core/accessories/types/thermostat/thermostat.component'
import { ThermostatManageComponent } from '@/app/core/accessories/types/thermostat/thermostat.manage.component'
import { UnknownComponent } from '@/app/core/accessories/types/unknown/unknown.component'
import { ValveComponent } from '@/app/core/accessories/types/valve/valve.component'
import { ValveManageComponent } from '@/app/core/accessories/types/valve/valve.manage.component'
import { WindowComponent } from '@/app/core/accessories/types/window/window.component'
import { WindowManageComponent } from '@/app/core/accessories/types/window/window.manage.component'
import { WindowCoveringComponent } from '@/app/core/accessories/types/windowcovering/windowcovering.component'
import { WindowcoveringManageComponent } from '@/app/core/accessories/types/windowcovering/windowcovering.manage.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    NouisliderModule,
    NgbModule,
    NgxMdModule,
    AccessoryTileComponent,
    AccessoryInfoComponent,
    SwitchComponent,
    StatelessprogrammableswitchComponent,
    ThermostatComponent,
    ThermostatManageComponent,
    OutletComponent,
    FanComponent,
    FanManageComponent,
    Fanv2Component,
    Fanv2ManageComponent,
    UnknownComponent,
    LightbulbComponent,
    LightbulbManageComponent,
    LightsensorComponent,
    LockmechanismComponent,
    LockmechanismManageComponent,
    TemperaturesensorComponent,
    GaragedooropenerComponent,
    MotionsensorComponent,
    OccupancysensorComponent,
    HumiditysensorComponent,
    AirqualitysensorComponent,
    WindowCoveringComponent,
    WindowcoveringManageComponent,
    WindowComponent,
    WindowManageComponent,
    DoorComponent,
    DoorManageComponent,
    TelevisionComponent,
    ContactsensorComponent,
    BatteryComponent,
    SpeakerComponent,
    SpeakerManageComponent,
    SecuritysystemComponent,
    SecuritysystemManageComponent,
    LeaksensorComponent,
    SmokesensorComponent,
    ValveComponent,
    ValveManageComponent,
    IrrigationSystemComponent,
    AirpurifierComponent,
    AirpurifierManageComponent,
    HeaterCoolerComponent,
    HeaterCoolerManageComponent,
    HumidifierDehumidifierComponent,
    HumidifierDehumidifierManageComponent,
    CarbonmonoxidesensorComponent,
    CarbondioxidesensorComponent,
  ],
  exports: [
    AccessoryTileComponent,
  ],
  providers: [
    AccessoriesService,
  ],
})
export class AccessoriesCoreModule {}
