/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { Logger } from '@athenna/logger'
import { Route, Server } from '@athenna/http'
import { Exec, File, Path } from '@secjs/utils'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, normalize, resolve } from 'node:path'
import { Config, Env, EnvHelper } from '@athenna/config'

import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

const __dirname = dirname(fileURLToPath(import.meta.url))

export class Ignite {
  /**
   * Simple logger for Ignite class. Ignite creates a new
   * instance of Logger because providers are not registered
   * yet.
   *
   * @type {Logger}
   */
  #logger

  /**
   * An instance of the application. Is here that the
   * client will bootstrap his type of application.
   *
   * @type {Application}
   */
  #application

  constructor() {
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
      process.chdir(resolve(__dirname, '..', '..', '..', '..'))
    }

    this.#resolveNodeEnv()
  }

  /**
   * Mocking the Logger when client doesn't want to show it.
   *
   * @return {Logger}
   */
  static getLogger() {
    return Env('NODE_ENV') === 'test' || Env('BOOT_LOGS') === 'false'
      ? {
          channel: (_channel, _runtimeConfig) => {},
          log: (_message, _options = {}) => {},
          info: (_message, _options = {}) => {},
          warn: (_message, _options = {}) => {},
          error: (_message, _options = {}) => {},
          debug: (_message, _options = {}) => {},
          success: (_message, _options = {}) => {},
        }
      : new Logger()
  }

  async fire() {
    /**
     * Load all config files of config folder
     */
    await Config.load(Path.config())

    this.#clearConsole()

    this.#logger = Ignite.getLogger()

    const providers = await this.#getProviders()

    await this.#registerProviders(providers)
    await this.#bootProviders(providers)

    await this.#preloadFiles()

    return this.#createApplication()
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
  #createApplication() {
    this.#application = new Application()

    return this.#application
  }

  /**
   * Resolve the NODE_ENV Env variable verifying if it's already
   * set. If not, get the content of config/app file and take the
   * environment key value to set as NODE_ENV. Then, resolve the
   * .env.${NODE_ENV} file in Node.js process.
   *
   * @return {void}
   */
  #resolveNodeEnv() {
    if (!process.env.NODE_ENV) {
      let env = new File(Path.config('app.js'))
        .loadSync()
        .getContentSync()
        .toString()
        .split('environment:')[1]
        .split(',')[0]
        .trim()

      if (env.includes('process.env.NODE_ENV')) {
        env = env
          .split('process.env.NODE_ENV')[1]
          .replace(/'|"/g, '')
          .replace(/\|/g, '')
          .trim()
      }

      process.env.NODE_ENV = env
    }

    EnvHelper.resolveFile()
  }

  /**
   * Clear the console if isn't in debug mode and NODE_ENV is
   * not set to testing environment.
   *
   * @private
   */
  #clearConsole() {
    const isNotDebugModeOrTesting =
      !Env('APP_DEBUG') &&
      (Env('NODE_ENV') === 'test' ||
        Env('NODE_ENV') === 'testing' ||
        Env('BOOT_LOGS') === 'false')

    if (isNotDebugModeOrTesting) {
      return
    }

    console.clear()
  }

  /**
   * Get all the providers from config/app file with export normalized.
   *
   * export default, export, module.exports, etc.
   *
   * @return {Promise<any[]>}
   */
  async #getProviders() {
    const providers = await Promise.all(
      Config.get('app.providers').map(p => Exec.getModule(p)),
    )

    providers.forEach(p => this.#logger.success(`Registering ${p.name}`))

    return providers
  }

  /**
   * Boot all the providers calling the boot method
   * and reading the register attributes inside providers.
   *
   * @param {any[]} providers
   * @return {Promise<void>}
   */
  async #bootProviders(providers) {
    const promises = providers.map(Provider => {
      const provider = new Provider()

      provider.registerAttributes()

      return provider.boot()
    })

    await Promise.all(promises)
  }

  /**
   * Register all the providers calling the register method
   * and reading the register attributes inside providers.
   *
   * @params {any[]} providers
   * @return {Promise<void>}
   */
  async #registerProviders(providers) {
    const promises = providers.map(Provider => {
      const provider = new Provider()

      provider.registerAttributes()

      return provider.register()
    })

    await Promise.all(promises)
  }

  /**
   * Preload all the files configured inside config/app
   * file.
   *
   * @return {Promise<void>}
   */
  async #preloadFiles() {
    const preloads = await Promise.all(Config.get('app.preloads'))

    const promises = preloads.map(preload => {
      preload = normalize(preload)

      const { name, href } = new File(Path.config(preload))

      this.#logger.success(`Preloading ${name} file`)

      return import(href)
    })

    await Promise.all(promises)
  }
}

export class Application {
  /**
   * Simple logger for Application class. Application creates
   * a new instance of Logger because providers are not
   * registered yet.
   *
   * @type {Logger}
   */
  #logger

  /**
   * An instance of the Ioc class that is a Monostate with
   * the Awilix container inside.
   *
   * @type {import('@athenna/ioc').Ioc}
   */
  #container

  /**
   * Creates a new instance of Application.
   */
  constructor() {
    this.#container = new Ioc()
    this.#logger = Ignite.getLogger()
  }

  // TODO
  // async bootWorker() {}

  // TODO
  // async shutdownWorker() {}

  /**
   * Boot a new Artisan inside this Application instance.
   *
   * @return {Promise<import('@athenna/artisan').ArtisanImpl>}
   */
  async bootArtisan() {
    const artisan = this.#container.safeUse('Athenna/Core/Artisan')

    /**
     * Resolve the Kernel file inside Console directory.
     */
    await this.#resolveConsoleKernel()

    /**
     * Preload default console route file
     */
    await this.#preloadFile(Path.routes('console.js'))

    return artisan
  }

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @return {Promise<import('@athenna/http').Http>}
   */
  async bootHttpServer() {
    const httpServer = this.#container.safeUse('Athenna/Core/HttpServer')

    /**
     * Resolve the Kernel file inside Http directory. It's
     * extremely important to call this method before preloading
     * the routes/http file because of named middlewares
     */
    await this.#resolveHttpKernel()

    /**
     * Preload default http route file
     */
    await this.#preloadFile(Path.routes('http.js'))

    this.#registerGracefulShutdown()

    Route.register()

    const port = Config.get('http.port')
    const host = Config.get('http.host')

    await Server.listen(port, host)

    this.#logger.success(`Http server started on http://${host}:${port}`)

    return httpServer
  }

  /**
   * Shutdown the HttpServer inside this Application instance.
   *
   * @return {Promise<void>}
   */
  async shutdownHttpServer() {
    this.#logger.warn(`Http server shutdown, bye! :)`)

    await Server.close()
  }

  /**
   * Preload the file according to filePath. This is usefully
   * to preload default files of each type of application. Such
   * as routes and Kernels.
   *
   * @param {string} filePath
   */
  async #preloadFile(filePath) {
    const { name, href } = new File(filePath)

    this.#logger.success(`Preloading ${name} file`)

    return import(href)
  }

  /**
   * Resolve the Kernel of the http server.
   *
   * @private
   */
  async #resolveHttpKernel() {
    const Kernel = await Exec.getModule(
      import(pathToFileURL(Path.http('Kernel.js')).href),
    )

    const kernel = new Kernel()

    this.#logger.success('Booting the Http Kernel')

    await kernel.registerCors()
    await kernel.registerRateLimit()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()
    await kernel.registerRequestIdMiddleware()
  }

  /**
   * Resolve the Kernel of the artisan/console.
   *
   * @private
   */
  async #resolveConsoleKernel() {
    const Kernel = await Exec.getModule(
      import(pathToFileURL(Path.console('Kernel.js')).href),
    )

    const kernel = new Kernel()

    this.#logger.success('Booting the Console Kernel')

    await kernel.registerErrorHandler()
    await kernel.registerCommands()
  }

  /**
   * Register graceful shutdown using config/app file.
   *
   * @private
   */
  #registerGracefulShutdown() {
    if (!Config.get('app.gracefulShutdown')) {
      return
    }

    process.on('SIGTERM', Config.get('app.gracefulShutdown'))
  }
}
