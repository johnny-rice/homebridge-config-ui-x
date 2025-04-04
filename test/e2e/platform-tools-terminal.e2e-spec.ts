import type { IPty } from '@homebridge/node-pty-prebuilt-multiarch'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { TestingModule } from '@nestjs/testing'

import type { WsEventEmitter } from '../../src/modules/platform-tools/terminal/terminal.service'

import { EventEmitter } from 'node:events'
import { resolve } from 'node:path'
import process from 'node:process'

import { FastifyAdapter } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { copy } from 'fs-extra'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfigService } from '../../src/core/config/config.service'
import { NodePtyService } from '../../src/core/node-pty/node-pty.service'
import { TerminalGateway } from '../../src/modules/platform-tools/terminal/terminal.gateway'
import { TerminalModule } from '../../src/modules/platform-tools/terminal/terminal.module'

// create mock websocket client
class MockWsEventEmitter extends EventEmitter implements WsEventEmitter {
  disconnect = vi.fn()
}

describe('PlatformToolsTerminal (e2e)', () => {
  let app: NestFastifyApplication

  let authFilePath: string
  let secretsFilePath: string

  let configService: ConfigService
  let terminalGateway: TerminalGateway
  let nodePtyService: NodePtyService
  let client: WsEventEmitter

  const size = { cols: 80, rows: 24 }

  const mockTerm = {
    onData: vi.fn() as IPty['onData'],
    onExit: vi.fn() as IPty['onExit'],
    kill: vi.fn() as IPty['kill'],
    write: vi.fn() as IPty['write'],
    resize: vi.fn() as IPty['resize'],
  } as IPty

  beforeAll(async () => {
    process.env.UIX_BASE_PATH = resolve(__dirname, '../../')
    process.env.UIX_STORAGE_PATH = resolve(__dirname, '../', '.homebridge')
    process.env.UIX_CONFIG_PATH = resolve(process.env.UIX_STORAGE_PATH, 'config.json')

    authFilePath = resolve(process.env.UIX_STORAGE_PATH, 'auth.json')
    secretsFilePath = resolve(process.env.UIX_STORAGE_PATH, '.uix-secrets')

    // Setup test config
    await copy(resolve(__dirname, '../mocks', 'config.json'), process.env.UIX_CONFIG_PATH)

    // Setup test auth file
    await copy(resolve(__dirname, '../mocks', 'auth.json'), authFilePath)
    await copy(resolve(__dirname, '../mocks', '.uix-secrets'), secretsFilePath)

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TerminalModule],
    }).compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter())

    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    configService = app.get(ConfigService)
    terminalGateway = app.get(TerminalGateway)
    nodePtyService = app.get(NodePtyService)
  })

  beforeEach(async () => {
    vi.resetAllMocks()

    // create client
    client = new MockWsEventEmitter()

    vi.spyOn(client, 'emit')
    vi.spyOn(client, 'on')
    vi.spyOn(nodePtyService, 'spawn')
      .mockImplementationOnce(() => {
        return mockTerm
      })

    configService.enableTerminalAccess = true
  })

  afterEach(async () => {
    client.emit('disconnect')
  })

  it('ON /platform-tools/terminal/start-session (terminal access not enabled)', async () => {
    configService.enableTerminalAccess = false

    terminalGateway.startTerminalSession(client, size)

    expect(client.disconnect).toHaveBeenCalled()
    expect(nodePtyService.spawn).not.toHaveBeenCalled()
  })

  it('ON /platform-tools/terminal/start-session', async () => {
    terminalGateway.startTerminalSession(client, size)

    await new Promise(res => setTimeout(res, 100))

    expect(nodePtyService.spawn).toHaveBeenCalled()
  })

  it('ON /platform-tools/terminal/start-session (cleanup)', async () => {
    terminalGateway.startTerminalSession(client, size)

    await new Promise(res => setTimeout(res, 100))

    expect(nodePtyService.spawn).toHaveBeenCalled()

    // check initial listeners
    expect(client.listenerCount('stdin')).toBe(1)
    expect(client.listenerCount('resize')).toBe(1)
    expect(client.listenerCount('end')).toBe(1)
    expect(client.listenerCount('disconnect')).toBe(1)

    // End the session
    client.emit('end')

    // check the listeners were removed
    expect(client.listenerCount('stdin')).toBe(0)
    expect(client.listenerCount('resize')).toBe(0)
    expect(client.listenerCount('end')).toBe(0)
    expect(client.listenerCount('disconnect')).toBe(0)

    // check the terminal was exited
    expect(mockTerm.onExit).toHaveBeenCalled()
    expect(mockTerm.kill).toHaveBeenCalled()
  })

  it('ON /platform-tools/terminal/start-session (stdin)', async () => {
    terminalGateway.startTerminalSession(client, size)

    await new Promise(res => setTimeout(res, 100))

    expect(nodePtyService.spawn).toHaveBeenCalled()

    // Send stdin
    client.emit('stdin', 'help')
    expect(mockTerm.write).toHaveBeenCalledWith('help')
  })

  it('ON /platform-tools/terminal/start-session (resize)', async () => {
    terminalGateway.startTerminalSession(client, size)

    await new Promise(res => setTimeout(res, 100))

    expect(nodePtyService.spawn).toHaveBeenCalled()

    // Send stdin
    client.emit('resize', { cols: 20, rows: 25 })
    expect(mockTerm.resize).toHaveBeenCalledWith(20, 25)
  })

  afterAll(async () => {
    await app.close()
  })
})
