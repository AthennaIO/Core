/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dotenv from 'dotenv'
import figlet from 'figlet'
import chalkRainbow from 'chalk-rainbow'

import { start } from 'node:repl'
import { normalize, resolve } from 'node:path'

import { Ioc } from '@athenna/ioc'
import { Config, EnvHelper } from '@athenna/config'
import { File, Module, Path } from '@athenna/common'
import { ColorHelper, Logger } from '@athenna/logger'

import { LoggerHelper } from '#src/Helpers/LoggerHelper'
import { ProviderHelper } from '#src/Helpers/ProviderHelper'
import { INTERNAL_REPL_PROPS } from '#src/Constants/InternalReplProps'
import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

export * from './Helpers/CoreLoader.js'
export * from './Helpers/ProviderHelper.js'

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
    if (Env('LISTEN_UNCAUGHT_CONFIGURED', false)) {
      return
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

    process.env.LISTEN_UNCAUGHT_CONFIGURED = 'true'
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
    if (Env('IS_TS') === true || Env('IS_TS') === false) {
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
   * Fire the application loading configuration files, registering
   * providers and preloading files. Everything in order.
   *
   * @param metaUrl {string}
   * @param {{
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
      if (options?.bootLogs === false) {
        this.#logger = Logger.getVanillaLogger({
          driver: 'null',
        })
      }

      ProviderHelper.shutdownLogs = options.shutdownLogs || false

      this.setUncaught(options.uncaughtExceptionHandler)
      this.setRootPath(metaUrl, options.beforePath)
      this.setEnvFile(options.envPath)

      await this.setConfigFiles(options.configsPath, options.loadConfigSafe)
      await this.setProviders(options.providers)
      await this.setFilesToPreload(options.preloads)

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
    this.#application = new Application()

    return this.#application
  }
}

export class Application {
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
  }

  // TODO
  // async bootWorker() {}

  /**
   * Boot a new REPL inside this Application instance.
   *
   * @return {Promise<import('node:repl').REPLServer>}
   */
  async bootREPL() {
    const ui = LoggerHelper.replUi
    const log = LoggerHelper.replLog

    log.write(chalkRainbow(figlet.textSync('REPL\n')))

    log.gray('To import your modules use dynamic imports:\n')
    log.gray("{ Log } = await import('@athenna/logger')")
    log.gray("{ User } = await import('#app/Models/User')")
    log.gray("const stringHelper = await import('#app/Helpers/string')\n")

    log.write(
      `${ui.yellow.bold('To see all commands available type:')} .help\n`,
    )

    const repl = start(
      ui.purple.bold('Athenna ') + ColorHelper.green.bold('❯ '),
    )

    repl.on('exit', () => {
      ProviderHelper.shutdownAll().then(() => process.exit())
    })

    repl.defineCommand('ls', {
      help: 'List all Athenna preloaded methods/properties in REPL context.',
      action(property) {
        this.clearBufferedCommand()

        log.write('')
        Object.keys(repl.context).forEach(key => {
          if (INTERNAL_REPL_PROPS.includes(key)) {
            return
          }

          log.yellow(key)
        })
        log.write('')

        this.displayPrompt()
      },
    })

    repl.defineCommand('clean', {
      help: `Clean any property of REPL global context. Example: .clean ${ui.gray(
        '(propertyName)',
      )}`,
      action(property) {
        this.clearBufferedCommand()

        log.write('')

        if (!property) {
          log.red('You have not provided any property to remove.')
          log.write(`Try like this: .clean ${ui.gray('(propertyName)')}\n`)

          return this.displayPrompt()
        }

        if (!repl.context[property]) {
          log.red(
            `The property "${property}" doesnt exist inside REPL global context.`,
          )
          log.red(
            'Use the ".ls" command to check the properties available in REPL global context.',
          )

          return this.displayPrompt()
        }

        delete repl.context[property]

        log.green(
          `Property "${property}" successfully removed from REPL context.\n`,
        )

        this.displayPrompt()
      },
    })

    return repl
  }

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
    await this.#preloadFile(Path.routes(`console.${Path.ext()}`))

    this.#registerGracefulShutdown(process)

    return artisan
  }

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @return {Promise<import('@athenna/http').Http>}
   */
  async bootHttpServer() {
    const httpServer = this.#container.safeUse('Athenna/Core/HttpServer')
    const httpRoute = this.#container.safeUse('Athenna/Core/HttpRoute')

    /**
     * Resolve the Kernel file inside Http directory. It's
     * extremely important to call this method before preloading
     * the routes/http file because of named middlewares
     */
    await this.#resolveHttpKernel()

    /**
     * Preload default http route file
     */
    await this.#preloadFile(Path.routes(`http.${Path.ext()}`))

    httpRoute.register()

    const port = Config.get('http.port')
    const host = Config.get('http.host')

    await httpServer.listen(port, host)

    this.#registerGracefulShutdown(process)

    this.#logger.success(`Http server started on http://${host}:${port}`)

    return httpServer
  }

  /**
   * Preload the file according to filePath. This is usefully
   * to preload default files of each type of application. Such
   * as routes and Kernels.
   *
   * @param {string} filePath
   */
  async #preloadFile(filePath) {
    if (!(await File.exists(filePath))) {
      return
    }

    const { base, href } = new File(filePath)

    this.#logger.success(`Preloading ${base} file`)

    return import(href)
  }

  /**
   * Resolve the Kernel of the http server.
   *
   * @private
   */
  async #resolveHttpKernel() {
    const Kernel = await Module.getFrom(Path.http(`Kernel.${Path.ext()}`))

    const kernel = new Kernel()

    this.#logger.success('Booting the Http Kernel')

    await kernel.registerCors()
    await kernel.registerTracer()
    await kernel.registerHelmet()
    await kernel.registerSwagger()
    await kernel.registerRateLimit()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()
  }

  /**
   * Resolve the Kernel of the artisan/console.
   *
   * @private
   */
  async #resolveConsoleKernel() {
    const Kernel = await Module.getFrom(Path.console(`Kernel.${Path.ext()}`))

    const kernel = new Kernel()

    this.#logger.success('Booting the Console Kernel')

    await kernel.registerErrorHandler()
    await kernel.registerCommands()
    await kernel.registerTemplates()
  }

  /**
   * Register graceful shutdown using config/app file.
   *
   * @private
   */
  #registerGracefulShutdown(process) {
    if (Env('GRACEFUL_SHUTDOWN_CONFIGURED', false)) {
      return
    }

    const signals = Config.get('app.gracefulShutdown')

    if (!signals) {
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
}
