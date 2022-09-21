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
import { Route, Server } from '@athenna/http'
import { ColorHelper, Logger } from '@athenna/logger'
import { Config, Env, EnvHelper } from '@athenna/config'
import { Exception, File, Module, Path } from '@secjs/utils'

import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

export * from './Helpers/CoreLoader.js'
export * from './Exceptions/Exception.js'

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
   * Mocking the Logger when client doesn't want to show it.
   *
   * @return {Logger}
   */
  static getLogger() {
    const logger = new Logger()

    return Env('NODE_ENV') === 'test' || Env('BOOT_LOGS') === 'false'
      ? logger.channel('discard')
      : logger.channel('application')
  }

  async fire() {
    try {
      /**
       * Load all config files of config folder
       */
      await Config.load(Path.config())

      this.#logger = Ignite.getLogger()

      const providers = await this.#getProviders()

      await this.#registerProviders(providers)
      await this.#bootProviders(providers)

      await this.#preloadFiles()

      return this.#createApplication()
    } catch (error) {
      if (error.prettify) {
        const prettyError = await error.prettify()

        if (!this.#logger) {
          console.log(prettyError)
        } else {
          this.#logger.error(prettyError)
        }

        process.exit()
      } else {
        const exception = new Exception(error.message, 0, error.name)

        exception.stack = error.stack

        const prettyException = await exception.prettify()

        if (!this.#logger) {
          console.log(prettyException)
        } else {
          this.#logger.error(prettyException)
        }

        process.exit()
      }
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
   * Get all the providers from config/app file with export normalized.
   *
   * export default, export, module.exports, etc.
   *
   * @return {Promise<any[]>}
   */
  async #getProviders() {
    const promises = Config.get('app.providers').map(module => {
      return Module.get(module).then(provider => {
        if (!this.#canBeBootstrapped(provider)) {
          return null
        }

        this.#logger.success(`Registering ${provider.name}`)

        return provider
      })
    })

    return (await Promise.all(promises)).filter(provider => provider)
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

  /**
   * Verify if the provider can be bootstrapped.
   *
   * @param {import('@athenna/ioc').ServiceProvider} Provider
   * @return {boolean}
   */
  #canBeBootstrapped(Provider) {
    const provider = new Provider()

    if (provider.bootstrapIn[0] === '*') {
      return true
    }

    if (!process.env.ATHENNA_APPLICATIONS) {
      return true
    }

    const apps = process.env.ATHENNA_APPLICATIONS.split(',')

    return apps.some(app => provider.bootstrapIn.indexOf(app) >= 0)
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
   * Boot a new REPL inside this Application instance.
   *
   * @return {Promise<import('node:repl').REPLServer>}
   */
  async bootREPL() {
    const colors = {
      pure: ColorHelper.chalk,
      red: ColorHelper.chalk.red,
      gray: ColorHelper.chalk.gray,
      green: ColorHelper.chalk.green,
      purple: ColorHelper.purple,
      yellow: ColorHelper.chalk.yellow,
    }

    const log = {
      write: m => process.stdout.write(m + '\n'),
      red: m => process.stdout.write(colors.red(m + '\n')),
      gray: m => process.stdout.write(colors.gray(m + '\n')),
      green: m => process.stdout.write(colors.green(m + '\n')),
      purple: m => process.stdout.write(colors.purple(m + '\n')),
      yellow: m => process.stdout.write(colors.yellow(m + '\n')),
    }

    log.write(chalkRainbow(figlet.textSync('REPL\n')))

    log.gray('To import your modules use dynamic imports:\n')
    log.gray("{ Log } = await import('@athenna/logger')")
    log.gray("{ User } = await import('#app/Models/User')")
    log.gray("const stringHelper = await import('#app/Helpers/string')\n")

    log.write(
      `${colors.yellow.bold('To see all commands available type:')} .help\n`,
    )

    const repl = start(
      colors.purple.bold('Athenna ') + ColorHelper.green.bold('❯ '),
    )

    repl.defineCommand('ls', {
      help: 'List all Athenna preloaded methods/properties in REPL context.',
      action(property) {
        this.clearBufferedCommand()

        const INTERNAL_PROPS = [
          'global',
          'clearInterval',
          'clearTimeout',
          'setInterval',
          'setTimeout',
          'queueMicrotask',
          'performance',
          'nodeTiming',
          'clearImmediate',
          'setImmediate',
          '__extends',
          '__assign',
          '__rest',
          '__decorate',
          '__param',
          '__metadata',
          '__awaiter',
          '__generator',
          '__exportStar',
          '__createBinding',
          '__values',
          '__read',
          '__spread',
          '__spreadArrays',
          '__spreadArray',
          '__await',
          '__asyncGenerator',
          '__asyncDelegator',
          '__asyncValues',
          '__makeTemplateObject',
          '__importStar',
          '__importDefault',
          '__classPrivateFieldGet',
          '__classPrivateFieldSet',
          '__classPrivateFieldIn',
        ]

        log.write('')
        Object.keys(repl.context).forEach(key => {
          if (INTERNAL_PROPS.includes(key)) {
            return
          }

          log.yellow(key)
        })
        log.write('')

        this.displayPrompt()
      },
    })

    repl.defineCommand('clean', {
      help: `Clean any property of REPL global context. Example: .clean ${colors.gray(
        '(propertyName)',
      )}`,
      action(property) {
        this.clearBufferedCommand()

        log.write('')

        if (!property) {
          log.red('You have not provided any property to remove.')
          log.write(`Try like this: .clean ${colors.gray('(propertyName)')}\n`)

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
    const Kernel = await Module.getFrom(Path.http('Kernel.js'))

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
    const Kernel = await Module.getFrom(Path.console('Kernel.js'))

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
  #registerGracefulShutdown() {
    if (!Config.get('app.gracefulShutdown')) {
      return
    }

    process.on('SIGTERM', Config.get('app.gracefulShutdown'))
  }
}
