/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module } from '@athenna/common'
import { Logger } from '@athenna/logger'

import {
  getDriver,
  LEVEL,
  MESSAGE,
} from '#src/Constants/Providers/Dictionaries'

export class ProviderHelper {
  /**
   * All the providers registered in the application.
   *
   * @type {any[]}
   */
  static providers = []

  /**
   * Set the providers that ProviderHelper will work with.
   *
   * @param providers {any[]}
   * @return {Promise<void>}
   */
  static async setProviders(providers) {
    const promises = providers.map(module => Module.get(module))

    this.providers = await Promise.all(promises)
  }

  /**
   * Get all the providers from config/app.js file with
   * export normalized.
   *
   * export default, export, module.exports, etc.
   *
   * @return {any[]}
   */
  static getAll() {
    return this.providers
  }

  /**
   * Get all the providers from config/app.js file with
   * export normalized and only where provider is bootable
   * by ATHENNA_APPLICATIONS env.
   *
   * @return {any[]}
   */
  static getAllBootable() {
    const providers = this.getAll()

    return providers.filter(Provider => this.canBeBootstrapped(Provider))
  }

  /**
   * Boot all the application providers that could be booted.
   *
   * @return {Promise<void>}
   */
  static async bootAll() {
    const providers = this.getAllBootable()

    const promises = providers.map(P => this.#runProvider('boot', P))

    await Promise.all(promises)
  }

  /**
   * Register all the application providers that could be registered.
   *
   * @return {Promise<void>}
   */
  static async registerAll() {
    const providers = this.getAllBootable()

    const promises = providers.map(P => this.#runProvider('register', P))

    await Promise.all(promises)
  }

  /**
   * Shutdown all the application providers that could be shutdown.
   *
   * @return {Promise<void>}
   */
  static async shutdownAll() {
    const providers = this.getAllBootable()

    const promises = providers.map(P => this.#runProvider('shutdown', P))

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
   * @param {any} Provider
   * @return {Promise<void>}
   */
  static async #runProvider(method, Provider) {
    const provider = new Provider()
    const logger = Logger.getVanillaLogger({
      driver: getDriver(method),
      formatter: 'simple',
    })

    const possiblePromise = provider.registerAttributes()[method]()

    const logFn = logger[LEVEL[method]].bind(logger)
    const message = `Provider ${Provider.name} ${MESSAGE[method]}`

    if (!possiblePromise) {
      logFn(message)

      return undefined
    }

    return possiblePromise.then(result => {
      logFn(message)

      return result
    })
  }
}
