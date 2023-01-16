/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dotenv from 'dotenv'

import { Logger } from '@athenna/logger'
import { normalize, resolve } from 'node:path'
import { Config, EnvHelper } from '@athenna/config'
import { File, Is, Module, Options, Path } from '@athenna/common'
import { Application } from '#src/Application/Application'
import { ProviderHelper } from '#src/Helpers/ProviderHelper'
import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

export * from './Helpers/CoreLoader.js'
export * from './Helpers/ProviderHelper.js'
export * from './Application/Application.js'

export class Ignite {
  /**
   * Simple vanilla logger for Ignite class.
   *
   * @type {import('@athenna/logger').VanillaLogger}
   */
  #logger = Logger.getVanillaLogger({
    driver: 'console',
    formatter: 'simple',
  })

  /**
   * An instance of the application. Is here that the
   * client will bootstrap his type of application.
   *
   * @type {Application}
   */
  #application

  /**
   * Set listener in "uncaughtException" event. You can set
   * your own callback or use the Athenna default to handle
   * uncaught errors.
   *
   * @param {any} [callback]
   * @return {void}
   */
  setUncaught(callback) {
    if (Is.Array(process._events.uncaughtException)) {
      process._events.uncaughtException.splice(1, 1)
    }

    const defaultCallback = async error => {
      const logger = Logger.getVanillaLogger({
        driver: 'console',
        formatter: 'none',
      })

      if (!error.prettify) {
        error = error.toAthennaException()
      }

      logger.fatal(await error.prettify())

      process.exit()
    }

    process.on('uncaughtException', callback || defaultCallback)
  }

  /**
   * Set the process chdir and resolve the environment
   * where the application is running.
   *
   * This method will also set if the application is TS,
   * if is Artisan and the Path.defaultBeforePath.
   *
   * @param metaUrl {string}
   * @param [beforePath] {string}
   * @return {void}
   */
  setRootPath(metaUrl, beforePath = '') {
    /**
     * Change all process.cwd commands to return the
     * root path where the application root is stored.
     *
     * It keeps like that:
     * go out from athenna core src folder ->
     * go out from athenna core root folder ->
     * go out from athenna packages folder ->
     * go out from node_modules folder.
     *
     * Now process.chdir is in the application root.
     */
    if (!process.env.CORE_TESTING) {
      const __dirname = Module.createDirname(import.meta.url)

      process.chdir(resolve(__dirname, '..', '..', '..', '..'))
    }

    /**
     * If env IS_TS is already set, then we cant change it.
     */
    if (Env('IS_TS') === undefined) {
      Path.resolveEnvironment(metaUrl, beforePath)
    }

    if (metaUrl.endsWith(`artisan.${Path.ext()}`)) {
      process.env.IS_ARTISAN = process.env.IS_ARTISAN || 'true'
    } else {
      process.env.IS_ARTISAN = 'false'
    }
  }

  /**
   * Set the env file that the application will use.
   * The env file path will be automactlly be resolved by
   * Athenna (using the NODE_ENV variable) if any path is set.
   *
   * In case path is empty:
   * If NODE_ENV variable it's already set the .env.${NODE_ENV} file
   * will be used. If not, Athenna will load the .env file and reload
   * the environment variables with OVERRIDE_ENV=true in case NODE_ENV
   * is set inside .env file.
   *
   * @param {string} [path]
   * @return {void}
   */
  setEnvFile(path) {
    if (path) {
      const configurations = { path }

      dotenv.config(configurations)

      return
    }

    if (!process.env.NODE_ENV) {
      EnvHelper.resolveFile()

      process.env.OVERRIDE_ENV = 'true'

      EnvHelper.resolveFile()

      return
    }

    EnvHelper.resolveFile()
  }

  /**
   * Load the configuration files inside some path.
   * The default path is always Path.config().
   *
   * @param {string} [path]
   * @param {boolean} [safe]
   * @return {Promise<void>}
   */
  async setConfigFiles(path = Path.config(), safe) {
    await Config.loadAll(path, safe)
  }

  /**
   * Also set the application providers. By default, if
   * providers array is empty, Athenna will bootstrap
   * according to "config/app" file using "providers" key
   * value.
   *
   * @param {any[]} providers
   * @return {Promise<void>}
   */
  async setProviders(providers = Config.get('app.providers')) {
    await ProviderHelper.setProviders(providers)

    await ProviderHelper.registerAll()
    await ProviderHelper.bootAll()

    this.#logger.success('Providers successfully bootstrapped')
  }

  /**
   * Files that Athenna needs to preload when bootstraping
   * the application. By default, if files is undefined, Athenna
   * will look up into config/app using the "preloads" key value.
   *
   * @param {any[]} preloads
   * @return {Promise<void>}
   */
  async setFilesToPreload(preloads = Config.get('app.preloads')) {
    preloads = await Promise.all(preloads)

    const promises = preloads.map(preload => {
      preload = normalize(preload)

      const { base, href } = new File(Path.config(preload))

      this.#logger.success(`Preloading ${base} file`)

      return import(href)
    })

    await Promise.all(promises)
  }

  /**
   * Register graceful shutdown set in "config/app" file.
   *
   * @private
   */
  setGracefulShutdown(signals = Config.get('app.gracefulShutdown')) {
    if (!signals || Is.Empty(signals)) {
      return
    }

    if (Env('GRACEFUL_SHUTDOWN_CONFIGURED', false)) {
      return
    }

    Object.keys(signals).forEach(key => {
      if (!signals[key]) {
        return
      }

      process.on(key, signals[key])
    })

    process.env.GRACEFUL_SHUTDOWN_CONFIGURED = 'true'
  }

  /**
   * Fire the application loading configuration files, registering
   * providers and preloading files. Everything in order.
   *
   * @param metaUrl {string}
   * @param {{
   *   signals?: any,
   *   envPath?: string,
   *   preloads?: any[],
   *   providers?: any[],
   *   bootLogs?: boolean,
   *   beforePath?: string,
   *   configsPath?: string,
   *   shutdownLogs?: boolean,
   *   loadConfigSafe?: boolean,
   *   uncaughtExceptionHandler?: (error: Error) => void | Promise<void>
   * }} [options]
   * @return {Promise<Application>}
   */
  async fire(metaUrl, options = {}) {
    try {
      options = Options.create(options, {
        bootLogs: true,
        shutdownLogs: false,
      })

      process.env.BOOT_LOGS = `${options.bootLogs}`
      process.env.SHUTDOWN_LOGS = `${options.shutdownLogs}`

      if (!options.bootLogs) {
        this.#logger = Logger.getVanillaLogger({
          driver: 'null',
        })
      }

      this.setUncaught(options.uncaughtExceptionHandler)
      this.setRootPath(metaUrl, options.beforePath)
      this.setEnvFile(options.envPath)

      await this.setConfigFiles(options.configsPath, options.loadConfigSafe)
      await this.setProviders(options.providers)
      await this.setFilesToPreload(options.preloads)

      this.setGracefulShutdown(options.signals)

      return this.createApplication()
    } catch (error) {
      const logger = Logger.getVanillaLogger({
        driver: 'console',
        formatter: 'none',
      })

      if (!error.prettify) {
        // eslint-disable-next-line no-ex-assign
        error = error.toAthennaException()
      }

      logger.fatal(await error.prettify())

      process.exit()
    }
  }

  /**
   * Get the instance of the application inside of Ignite class.
   *
   * @return {Application}
   */
  getApplication() {
    if (!this.#application) {
      throw new NullApplicationException()
    }

    return this.#application
  }

  /**
   * Create a new instance of application inside
   * Ignite class.
   *
   * @return {Application}
   */
  createApplication() {
    this.#application = new Application(this.#logger)

    return this.#application
  }
}
