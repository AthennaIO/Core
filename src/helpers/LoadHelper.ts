/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:path'
import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import { Module } from '@athenna/common'
import { ServiceProvider } from '@athenna/ioc'

export class LoadHelper {
  /**
   * The providers modules loaded.
   */
  public static providers: (typeof ServiceProvider)[] = []

  /**
   * The file paths that are already preloaded.
   */
  public static alreadyPreloaded: string[] = []

  /**
   * REGOOT (Register and Boot) providers.
   */
  public static async regootProviders(): Promise<void> {
    await this.loadBootableProviders()
    await this.registerProviders()
    await this.bootProviders()

    if (Config.is('rc.bootLogs', true)) {
      this.providers.forEach(Provider =>
        Log.channelOrVanilla('application').success(
          `Provider ({yellow} ${Provider.name}) successfully booted`
        )
      )
    }
  }

  /**
   * Execute the "boot" method of all the providers loaded.
   */
  public static async bootProviders(): Promise<void> {
    await this.providers.athenna.concurrently(Provider => {
      debug('running boot() method of provider %s.', Provider.name)
      return new Provider().boot() as Promise<void>
    })
  }

  /**
   * Execute the "register" method of all the providers loaded.
   */
  public static async registerProviders(): Promise<void> {
    await this.providers.athenna.concurrently(Provider => {
      debug('running register() method of provider %s.', Provider.name)
      return new Provider().register() as Promise<void>
    })
  }

  /**
   * Execute the "shutdown" method of all the providers loaded.
   */
  public static async shutdownProviders(): Promise<void> {
    await this.providers.athenna.concurrently(Provider => {
      debug('running shutdown() method of provider %s.', Provider.name)

      if (Config.is('rc.shutdownLogs', true)) {
        Log.channelOrVanilla('application').success(
          `Provider ({yellow} ${Provider.name}) successfully shutdown`
        )
      }

      return new Provider().shutdown() as Promise<void>
    })
  }

  /**
   * Preload all the files inside "rc.preloads" configuration by importing.
   */
  public static async preloadFiles(): Promise<void> {
    await Config.get<string[]>('rc.preloads', []).athenna.concurrently(path => {
      debug('preloading path %s.', path)

      if (this.alreadyPreloaded.includes(path)) {
        debug('path %s has already been preloaded and will be skipped.', path)
        return
      }

      if (Config.is('rc.bootLogs', true)) {
        Log.channelOrVanilla('application').success(
          `File ({yellow} ${parse(path).base}) successfully preloaded`
        )
      }

      return this.resolvePath(path).then(() =>
        this.alreadyPreloaded.push(path)
      ) as Promise<void>
    })
  }

  /**
   * Get all the providers from .athennarc.json file. Also, will return only
   * the providers have the same value of "rc.s".
   */
  public static async loadBootableProviders(): Promise<void> {
    const paths = Config.get<string[]>('rc.providers', [])
    const providers = await paths.athenna.concurrently(this.resolvePath)

    this.providers = providers.filter(Provider => {
      debug('loading provider %s.', Provider.name)

      if (!this.isRegistered(Provider) && this.canBeBootstrapped(Provider)) {
        return true
      }

      debug(
        'provider %s will not be loaded because it is already registered or it cannot bootstrap in the current environment.',
        Provider.name
      )

      return false
    })
  }

  /**
   * Verify if provider is already registered.
   */
  private static isRegistered(Provider: typeof ServiceProvider) {
    return !!this.providers.find(P => P === Provider)
  }

  /**
   * Verify if provider can be bootstrapped.
   */
  private static canBeBootstrapped(Provider: typeof ServiceProvider) {
    const provider = new Provider()

    if (provider.environment[0] === '*') {
      return true
    }

    const envs = Config.get<string[]>('rc.environments')

    if (!envs || !envs.length || envs[0] === '*') {
      return true
    }

    return envs.some(env => provider.environment.indexOf(env) >= 0)
  }

  /**
   * Resolve the import path by meta URL and import it.
   */
  private static async resolvePath(path: string) {
    return Module.resolve(path, Config.get('rc.parentURL'))
  }
}
