/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:path'
import { Log } from '@athenna/logger'
import { Exec, Module } from '@athenna/common'
import { ServiceProvider } from '@athenna/ioc'

export class LoadHelper {
  /**
   * The providers modules loaded.
   */
  public static providers: (typeof ServiceProvider)[] = []

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
          `Provider ({yellow} ${Provider.name}) successfully booted`,
        ),
      )
    }
  }

  /**
   * Execute the "boot" method of all the providers loaded.
   */
  public static async bootProviders(): Promise<void> {
    await Exec.concurrently(
      this.providers,
      Provider => new Provider().boot() as Promise<void>,
    )
  }

  /**
   * Execute the "register" method of all the providers loaded.
   */
  public static async registerProviders(): Promise<void> {
    await Exec.concurrently(
      this.providers,
      Provider => new Provider().register() as Promise<void>,
    )
  }

  /**
   * Execute the "shutdown" method of all the providers loaded.
   */
  public static async shutdownProviders(): Promise<void> {
    await Exec.concurrently(this.providers, Provider => {
      if (Config.is('rc.bootLogs', true)) {
        Log.channelOrVanilla('application').success(
          `Provider ({yellow} ${Provider.name}) successfully shutdown`,
        )
      }

      return new Provider().shutdown() as Promise<void>
    })
  }

  /**
   * Preload all the files inside "rc.preloads" configuration by importing.
   */
  public static async preloadFiles(): Promise<void> {
    await Exec.concurrently(Config.get('rc.preloads'), path => {
      if (Config.is('rc.bootLogs', true)) {
        Log.channelOrVanilla('application').success(
          `File ({yellow} ${parse(path).base}) successfully preloaded`,
        )
      }

      return this.resolvePath(path)
    })
  }

  /**
   * Get all the providers from .athennarc.json file. Also, will return only
   * the providers have the same value of "rc.s".
   */
  public static async loadBootableProviders(): Promise<void> {
    const paths = Config.get('rc.providers')
    const providers = await Exec.concurrently(paths, this.resolvePath)

    this.providers = providers.filter(Provider => {
      if (!this.isRegistered(Provider) && this.canBeBootstrapped(Provider)) {
        return true
      }

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
    return Module.resolve(path, Config.get('rc.meta'))
  }
}
