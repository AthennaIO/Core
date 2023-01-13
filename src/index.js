/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import figlet from 'figlet'
import chalkRainbow from 'chalk-rainbow'

import { start } from 'node:repl'
import { normalize, resolve } from 'node:path'

import { Ioc } from '@athenna/ioc'
import { ColorHelper } from '@athenna/logger'
import { Config, EnvHelper } from '@athenna/config'
import { Exception, File, Module, Path } from '@athenna/common'

import { LoggerHelper } from '#src/Helpers/LoggerHelper'
import { ProviderHelper } from '#src/Helpers/ProviderHelper'
import { INTERNAL_REPL_PROPS } from '#src/Constants/InternalReplProps'
import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

export * from './Helpers/CoreLoader.js'
export * from './Helpers/ProviderHelper.js'

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
      process.chdir(
        resolve(Module.createDirname(import.meta.url), '..', '..', '..', '..'),
      )
    }

    this.#resolveNodeEnv()
  }

  /**
   * Fire the application loading configuration files, registering
   * providers and preloading files. Everything in order.
   *
   * @return {Promise<Application>}
   */
  async fire() {
    try {
      /**
       * Load/Reload all config files of config folder.
       */
      await Config.loadAll(Path.config(), false)

      this.#logger = LoggerHelper.get()

      this.#listenToUncaughtExceptions()

      await ProviderHelper.registerAll()
      await ProviderHelper.bootAll()

      this.#logger.success('Providers successfully bootstrapped')

      await this.#preloadFiles()

      return this.#createApplication()
    } catch (error) {
      if (!Env('FORCE_USE_DEFAULT_LOG', false)) {
        this.#logger = LoggerHelper.getConsoleLogger()
      }

      if (!error.prettify) {
        const exception = new Exception(error.message, 0, error.name)

        exception.stack = error.stack
        // eslint-disable-next-line no-ex-assign
        error = exception
      }

      this.#logger.fatal(await error.prettify())

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
   * Notify about uncaught exceptions
   *
   * @return {void}
   */
  #listenToUncaughtExceptions() {
    process.on('uncaughtExceptionMonitor', error => {
      this.#logger.fatal(error, '"uncaughtException" detected')
    })
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
      EnvHelper.resolveFile()

      process.env.OVERRIDE_ENV = 'true'

      EnvHelper.resolveFile()

      return
    }

    EnvHelper.resolveFile()
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
   * Simple mocked logger.
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
    this.#logger = LoggerHelper.get()
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
