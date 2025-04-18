/**
 * Homebridge Entry Point
 */

import { fork } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'

import { Command } from 'commander'
import { satisfies } from 'semver'

let homebridge: any

class HomebridgeUi {
  log: any

  constructor(log: any, config: any) {
    this.log = log

    process.env.UIX_CONFIG_PATH = homebridge.user.configPath()
    process.env.UIX_STORAGE_PATH = homebridge.user.storagePath()
    process.env.UIX_PLUGIN_NAME = config.name || 'homebridge-config-ui-x'

    const program = new Command()
    program
      .allowUnknownOption()
      .allowExcessArguments()
      .option('-P, --plugin-path [path]', '', p => process.env.UIX_CUSTOM_PLUGIN_PATH = p)
      .option('-I, --insecure', '', () => process.env.UIX_INSECURE_MODE = '1')
      .option('-T, --no-timestamp', '', () => process.env.UIX_LOG_NO_TIMESTAMPS = '1')
      .parse(process.argv)

    if (!satisfies(process.version, '>=18.15.0')) {
      const msg = `Node.js v18.15.0 higher is required. You may experience issues running this plugin running on ${process.version}.`
      log.error(msg)
      log.warn(msg)
    }

    if (process.env.UIX_SERVICE_MODE === '1' && process.connected) {
      this.log('Running in service mode.')
    } else if (config.standalone || process.env.UIX_SERVICE_MODE === '1'
      || (process.env.HOMEBRIDGE_CONFIG_UI === '1' && satisfies(process.env.CONFIG_UI_VERSION, '>=3.5.5', { includePrerelease: true }))) {
      this.log.warn('*********** Homebridge Standalone Mode Is Deprecated **********')
      this.log.warn('* Please swap to service mode using the hb-service command.  *')
      this.log.warn('* See https://homebridge.io/w/JUvQr for instructions on how to migrate. *')
      this.log('Running in standalone mode.')
    } else if (config.noFork) {
      this.noFork()
    } else {
      this.fork()
    }
  }

  /**
   * Run plugin as a separate node.js process
   */
  fork() {
    const ui = fork(resolve(__dirname, 'bin/fork'), null, {
      env: process.env,
    })

    this.log('Spawning Homebridge UI with PID', ui.pid)

    ui.on('close', () => {
      process.kill(process.pid, 'SIGTERM')
    })

    ui.on('error', () => {
      // Do nothing
    })
  }

  /**
   * Run plugin in the main homebridge process
   */
  async noFork() {
    await import('./main')
  }

  /**
   * Set up the service mode process helper
   * This ensures the Homebridge process is killed when hb-service
   * is killed with SIGTERM to prevent stale processes.
   */
  static serviceMode() {
    process.on('disconnect', () => {
      process.exit()
    })
  }

  accessories(callback) {
    const accessories = []
    callback(accessories)
  }
}

// eslint-disable-next-line no-restricted-syntax
export = (api) => {
  homebridge = api
  homebridge.registerPlatform('homebridge-config-ui-x', 'config', HomebridgeUi)

  if (process.env.UIX_SERVICE_MODE === '1' && process.connected) {
    HomebridgeUi.serviceMode()
  }
}
