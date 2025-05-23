import type { ServiceType } from '@homebridge/hap-client'

import { join } from 'node:path'

import { HapClient } from '@homebridge/hap-client'
import { BadRequestException, Injectable } from '@nestjs/common'
import { mkdirp, pathExists, readJson, writeJsonSync } from 'fs-extra'
import NodeCache from 'node-cache'

import { ConfigService } from '../../core/config/config.service'
import { Logger } from '../../core/logger/logger.service'

@Injectable()
export class AccessoriesService {
  public hapClient: HapClient
  public accessoriesCache = new NodeCache({ stdTTL: 0 })

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    if (this.configService.homebridgeInsecureMode) {
      this.hapClient = new HapClient({
        pin: this.configService.homebridgeConfig.bridge.pin,
        logger: this.logger,
        config: this.configService.ui.accessoryControl || {},
      })
    }
  }

  /**
   * Connects the client to the homebridge service
   * @param client
   */
  public async connect(client: any) {
    if (!this.configService.homebridgeInsecureMode) {
      this.logger.error('Homebridge must be running in insecure mode to control accessories.')
      return
    }

    let services: any[]

    const loadAllAccessories = async (refresh: boolean) => {
      if (!refresh) {
        const cached = this.accessoriesCache.get<any[]>('services')
        if (cached && cached.length) {
          client.emit('accessories-data', cached)
        }
      }

      services = await this.loadAccessories()
      this.refreshCharacteristics(services)
      client.emit('accessories-ready-for-control')
      client.emit('accessories-data', services)
      this.accessoriesCache.set('services', services)
    }

    // Initial load
    await loadAllAccessories(false)

    // Handling incoming requests
    const requestHandler = async (msg?: any) => {
      if (msg.set) {
        const service: ServiceType = services.find(x => x.uniqueId === msg.set.uniqueId)
        if (service) {
          try {
            await service.setCharacteristic(msg.set.iid, msg.set.value)
            services = await this.loadAccessories()
            // Do a refresh to check if any accessories changed after this action
            setTimeout(() => {
              this.refreshCharacteristics(services)
            }, 1500)
          } catch (e) {
            client.emit('accessory-control-failure', e.message)
          }
        }
      }
    }
    client.on('accessory-control', requestHandler)

    const monitor = await this.hapClient.monitorCharacteristics()

    const updateHandler = (data: any) => {
      client.emit('accessories-data', data)
    }
    monitor.on('service-update', updateHandler)

    // eslint-disable-next-line unused-imports/no-unused-vars
    const instanceUpdateHandler = async (data: any) => {
      client.emit('accessories-reload-required', services)
    }
    this.hapClient.on('instance-discovered', instanceUpdateHandler)

    // Load a second time in case anything was missed
    const secondaryLoadTimeout = setTimeout(async () => {
      await loadAllAccessories(true)
    }, 3000)

    // Clean up on disconnect
    const onEnd = () => {
      clearTimeout(secondaryLoadTimeout)
      client.removeAllListeners('end')
      client.removeAllListeners('disconnect')
      client.removeAllListeners('accessory-control')
      monitor.removeAllListeners('service-update')
      monitor.finish()
      this.hapClient.removeListener('instance-discovered', instanceUpdateHandler)
    }

    client.on('disconnect', onEnd.bind(this))
    client.on('end', onEnd.bind(this))

    // Send a refresh instances request
    this.hapClient.refreshInstances()
  }

  /**
   * Refresh the characteristics from Homebridge
   * @param services
   */
  private refreshCharacteristics(services: any[]) {
    services.forEach(service => service.refreshCharacteristics())
  }

  /**
   * Load all the accessories from Homebridge
   */
  public async loadAccessories(): Promise<ServiceType[]> {
    if (!this.configService.homebridgeInsecureMode) {
      throw new BadRequestException('Homebridge must be running in insecure mode to access accessories.')
    }

    try {
      return await this.hapClient.getAllServices()
    } catch (e) {
      if (e.response?.status === 401) {
        this.logger.warn('Homebridge must be running in insecure mode to view and control accessories from this plugin.')
      } else {
        this.logger.error(`Failed to load accessories from Homebridge as ${e.message}.`)
      }
      return []
    }
  }

  /**
   * Get a single accessory and refresh its characteristics
   * @param uniqueId
   */
  public async getAccessory(uniqueId: string) {
    const services = await this.loadAccessories()
    const service = services.find(x => x.uniqueId === uniqueId)

    if (!service) {
      throw new BadRequestException(`Service with uniqueId of '${uniqueId}' not found.`)
    }

    try {
      await service.refreshCharacteristics()
      return service
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  /**
   * Set a characteristics value
   * @param uniqueId
   * @param characteristicType
   * @param value
   */
  public async setAccessoryCharacteristic(uniqueId: string, characteristicType: string, value: number | boolean | string) {
    const services = await this.loadAccessories()
    const service = services.find(x => x.uniqueId === uniqueId)

    if (!service) {
      throw new BadRequestException(`Service with uniqueId of '${uniqueId}' not found.`)
    }

    const characteristic = service.getCharacteristic(characteristicType)

    if (!characteristic || !characteristic.canWrite) {
      const types = service.serviceCharacteristics.filter(x => x.canWrite).map(x => `'${x.type}'`).join(', ')
      throw new BadRequestException(`Invalid characteristicType. Valid types are: ${types}.`)
    }

    // Integers
    if (['uint8', 'uint16', 'uint32', 'uint64'].includes(characteristic.format)) {
      value = Number.parseInt(value as string, 10)
      if (characteristic.minValue !== undefined && value < characteristic.minValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`)
      }
      if (characteristic.maxValue !== undefined && value > characteristic.maxValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`)
      }
    }

    // Floats
    if (characteristic.format === 'float') {
      value = Number.parseFloat(value as string)
      if (characteristic.minValue !== undefined && value < characteristic.minValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`)
      }
      if (characteristic.maxValue !== undefined && value > characteristic.maxValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`)
      }
    }

    // Booleans
    if (characteristic.format === 'bool') {
      if (typeof value === 'string') {
        if (['true', '1'].includes(value.toLowerCase())) {
          value = true
        } else if (['false', '0'].includes(value.toLowerCase())) {
          value = false
        }
      } else if (typeof value === 'number') {
        value = value === 1
      }

      if (typeof value !== 'boolean') {
        throw new BadRequestException('Invalid value. The value must be a boolean (true or false).')
      }
    }

    try {
      await characteristic.setValue(value)
      await service.refreshCharacteristics()
      return service
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  /**
   * Get the accessory layout
   */
  public async getAccessoryLayout(username: string) {
    try {
      const accessoryLayout = await readJson(this.configService.accessoryLayoutPath)
      if (username in accessoryLayout) {
        return accessoryLayout[username]
      } else {
        throw new Error('User not in Accessory Layout')
      }
    } catch (e) {
      return [
        {
          name: 'Default Room',
          services: [],
        },
      ]
    }
  }

  /**
   * Saves the accessory layout
   * @param user
   * @param layout
   */
  public async saveAccessoryLayout(user: string, layout: Record<string, unknown>) {
    let accessoryLayout: any

    try {
      accessoryLayout = await readJson(this.configService.accessoryLayoutPath)
    } catch (e) {
      accessoryLayout = {}
    }

    if (!await pathExists(join(this.configService.storagePath, 'accessories'))) {
      await mkdirp(join(this.configService.storagePath, 'accessories'))
    }

    accessoryLayout[user] = layout
    writeJsonSync(this.configService.accessoryLayoutPath, accessoryLayout)
    this.logger.log(`Accessory layout changes saved for ${user}.`)
    return layout
  }

  /**
   * Reset the instance pool and do a full scan for Homebridge instances
   */
  public resetInstancePool() {
    if (this.configService.homebridgeInsecureMode) {
      this.hapClient.resetInstancePool()
    }
  }
}
