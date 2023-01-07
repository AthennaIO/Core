/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Module } from '@athenna/common'
import { Logger } from '@athenna/logger'
import { LoggerHelper } from '#src/Helpers/LoggerHelper'

export class ProviderHelper {
  /**
   * Get all the providers from config/app.js file with
   * export normalized.
   *
   * export default, export, module.exports, etc.
   *
   * @return {Promise<any[]>}
   */
  static async getAll() {
    const providersModules = Config.get('app.providers')
    const promises = providersModules.map(module => Module.get(module))

    return Promise.all(promises)
  }

  /**
   * Get all the providers from config/app.js file with
   * export normalized and only where provider is bootable
   * by ATHENNA_APPLICATIONS env.
   *
   * @return {Promise<any[]>}
   */
  static async getAllBootable() {
    const providers = await this.getAll()

    return providers.filter(Provider => this.canBeBootstrapped(Provider))
  }

  /**
   * Boot all the application providers that could be booted.
   *
   * @return {Promise<void>}
   */
  static async bootAll() {
    const providers = await this.getAllBootable()

    const promises = providers.map(P => this.#runProvider('boot', false, P))

    await Promise.all(promises)
  }

  /**
   * Register all the application providers that could be registered.
   *
   * @return {Promise<void>}
   */
  static async registerAll() {
    const providers = await this.getAllBootable()

    const promises = providers.map(P => this.#runProvider('register', false, P))

    await Promise.all(promises)
  }

  /**
   * Shutdown all the application providers that could be shutdown.
   *
   * @return {Promise<void>}
   */
  static async shutdownAll(log = true) {
    const providers = await this.getAllBootable()

    const promises = providers.map(P => this.#runProvider('shutdown', log, P))

    await Promise.all(promises)
  }

  /**
   * Verify if provider can be bootstrap using ATHENNA_APPLICATIONS env.
   *
   * @param {any} Provider
   * @return {boolean}
   */
  static canBeBootstrapped(Provider) {
    const provider = new Provider()

    if (provider.bootstrapIn[0] === '*') {
      return true
    }

    const env = Env('ATHENNA_APPLICATIONS')

    if (!env) {
      return true
    }

    const apps = env.split(',')

    return apps.some(app => provider.bootstrapIn.indexOf(app) >= 0)
  }

  /**
   * Run the providers by method.
   *
   * @param {'boot' | 'register' | 'shutdown'} method
   * @param {boolean} log
   * @param {any} Provider
   * @return {Promise<void>}
   */
  static async #runProvider(method, log, Provider) {
    const provider = new Provider()
    let logger = LoggerHelper.get()

    if (method === 'shutdown' && Env('SHUTDOWN_LOGS')) {
      logger = new Logger().channel('application')
    }

    const messageDictionary = {
      boot: 'has been bootstrapped',
      register: 'has been registered',
      shutdown: 'is going down',
    }
    const logLevelDictionary = {
      boot: 'success',
      register: 'success',
      shutdown: 'warn',
    }

    const possiblePromise = provider.registerAttributes()[method]()

    const logFn = logger[logLevelDictionary[method]].bind(logger)
    const logMsg = `Provider ${Provider.name} ${messageDictionary[method]}`

    if (!possiblePromise) {
      if (log) {
        logFn(logMsg)
      }

      return undefined
    }

    return possiblePromise.then(result => {
      if (log) {
        logFn(logMsg)
      }

      return result
    })
  }
}
