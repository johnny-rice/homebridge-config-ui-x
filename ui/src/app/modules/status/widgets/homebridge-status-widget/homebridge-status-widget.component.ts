import { NgClass } from '@angular/common'
import { Component, inject, Input, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { firstValueFrom } from 'rxjs'

import { ManagePluginsService } from '@/app/core/manage-plugins/manage-plugins.service'
import { SettingsService } from '@/app/core/settings.service'
import { IoNamespace, WsService } from '@/app/core/ws.service'

@Component({
  templateUrl: './homebridge-status-widget.component.html',
  styleUrls: ['./homebridge-status-widget.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    TranslatePipe,
  ],
})
export class HomebridgeStatusWidgetComponent implements OnInit {
  $plugin = inject(ManagePluginsService)
  private $settings = inject(SettingsService)
  private $toastr = inject(ToastrService)
  private $translate = inject(TranslateService)
  private $ws = inject(WsService)

  @Input() widget: any

  public homebridgePkg = {} as any
  public homebridgeUiPkg = {} as any
  public homebridgeStatus = {} as any
  public homebridgePluginStatus = [] as any
  public homebridgePluginStatusDone = false as boolean

  private io: IoNamespace

  constructor() {}

  async ngOnInit() {
    this.io = this.$ws.getExistingNamespace('status')
    this.io.socket.on('homebridge-status', (data) => {
      this.homebridgeStatus = data
    })

    this.io.connected.subscribe(async () => {
      await Promise.all([
        this.getHomebridgeStatus(),
        this.checkHomebridgeVersion(),
        this.checkHomebridgeUiVersion(),
        this.getOutOfDatePlugins(),
      ])
    })

    if (this.io.socket.connected) {
      await Promise.all([
        this.getHomebridgeStatus(),
        this.checkHomebridgeVersion(),
        this.checkHomebridgeUiVersion(),
        this.getOutOfDatePlugins(),
      ])
    }

    this.io.socket.on('disconnect', () => {
      this.homebridgeStatus.status = 'down'
    })
  }

  async getHomebridgeStatus() {
    this.homebridgeStatus = await firstValueFrom(this.io.request('get-homebridge-status'))
  }

  async checkHomebridgeVersion() {
    try {
      const response = await firstValueFrom(this.io.request('homebridge-version-check'))
      this.homebridgePkg = response
      this.$settings.env.homebridgeVersion = response.installedVersion
    } catch (error) {
      console.error(error)
      this.$toastr.error(error.message, this.$translate.instant('toast.title_error'))
    }
  }

  async checkHomebridgeUiVersion() {
    try {
      const response = await firstValueFrom(this.io.request('homebridge-ui-version-check'))
      this.homebridgeUiPkg = response
      this.$settings.env.homebridgeUiVersion = response.installedVersion
    } catch (error) {
      console.error(error)
      this.$toastr.error(error.message, this.$translate.instant('toast.title_error'))
    }
  }

  async getOutOfDatePlugins() {
    try {
      const outOfDatePlugins = await firstValueFrom(this.io.request('get-out-of-date-plugins'))
      this.homebridgePluginStatus = outOfDatePlugins.filter((x: any) => x.name !== 'homebridge-config-ui-x')
      this.homebridgePluginStatusDone = true
    } catch (error) {
      console.error(error)
      this.$toastr.error(error.message, this.$translate.instant('toast.title_error'))
    }
  }
}
