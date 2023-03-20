/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { resolve } from 'node:path'
import { EnvHelper } from '@athenna/config'
import { Http } from '#src/Applications/Http'
import { Repl } from '#src/Applications/Repl'
import { PrettyREPLServer } from 'pretty-repl'
import { SemverNode } from '#src/Types/SemverNode'
import { Artisan } from '#src/Applications/Artisan'
import { LoadHelper } from '#src/Helpers/LoadHelper'
import { HttpOptions } from '#src/Types/HttpOptions'
import { Log, LoggerProvider } from '@athenna/logger'
import { IgniteOptions } from '#src/Types/IgniteOptions'
import { ArtisanOptions } from '#src/Types/ArtisanOptions'
import { Is, File, Module, Options } from '@athenna/common'
import { parse as semverParse, satisfies as semverSatisfies } from 'semver'
import { NotSatisfiedNodeVersion } from '#src/Exceptions/NotSatisfiedNodeVersion'

export class Ignite {
  /**
   * The Athenna service provider instance (Ioc container).
   */
  public container = new Ioc()

  /**
   * The meta url path where the Ignite was called.
   *
   * @example
   * ```ts
   * new Ignite(import.meta.url)...
   * ```
   */
  public meta: string

  /**
   * The Ignite options that will be used in "fire" method.
   */
  public options: IgniteOptions

  /**
   * Load the Ignite class using the options and meta url path.
   */
  public async load(meta: string, options?: IgniteOptions): Promise<this> {
    try {
      new LoggerProvider().register()

      this.meta = meta
      this.options = Options.create(options, {
        bootLogs: true,
        shutdownLogs: false,
        beforePath: '/build',
        loadConfigSafe: true,
        athennaRcPath: Path.pwd('.athennarc.json'),
        uncaughtExceptionHandler: this.handleError,
      })

      this.setUncaughtExceptionHandler()
      await this.setRcContentAndAppVars()
      this.verifyNodeEngineVersion()
      this.registerItselfToTheContainer()

      return this
    } catch (err) {
      await this.handleError(err)
    }
  }

  /**
   * Ignite the REPL application.
   */
  public async repl(): Promise<PrettyREPLServer> {
    const environments = Config.get<string[]>('rc.environments', [])

    environments.push('repl')

    await this.fire(environments)

    this.options.uncaughtExceptionHandler = async error => {
      if (!Is.Exception(error)) {
        error = error.toAthennaException()
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await Log.channelOrVanilla('exception').fatal(await error.prettify())
      repl.displayPrompt()
    }

    this.setUncaughtExceptionHandler()

    const repl = await Repl.boot()

    return repl
  }

  /**
   * Ignite the Artisan application.
   */
  public async artisan(argv: string[], options?: ArtisanOptions) {
    await Artisan.load()

    return Artisan.boot(argv, options)
  }

  /**
   * Ignite the Http server application.
   */
  public async httpServer(options?: HttpOptions) {
    const environments = Config.get<string[]>('rc.environments', [])

    environments.push('http')

    await this.fire(environments)

    return Http.boot(options)
  }

  /**
   * Fire the application configuring the env variables file, configuration files
   * providers and preload files.
   */
  public async fire(environments: string[]) {
    try {
      Config.set('rc.environments', environments)

      this.setEnvVariablesFile()
      await this.setConfigurationFiles()

      await LoadHelper.regootProviders()
      await LoadHelper.preloadFiles()

      this.setApplicationSignals()
    } catch (err) {
      await this.handleError(err)
    }
  }

  /**
   * Verify the Node.js engine version if meets the required
   * version to run Athenna Framework.
   */
  public verifyNodeEngineVersion() {
    const engines = Config.get('rc.engines')
    const nodeEngine = engines?.node

    if (!nodeEngine) {
      return
    }

    if (!semverSatisfies(process.version, nodeEngine)) {
      throw new NotSatisfiedNodeVersion(process.version, nodeEngine)
    }
  }

  /**
   * Set the application handler for uncaught exceptions. Any exception throwed that is
   * not catched will be resolved by this handler. Also, if this behavior happens, the error
   * will be logged and the application will exit with code "1".
   *
   * @example
   * ```ts
   * this.setUncaughtExceptionHandler(error => {
   *  console.error('UncaughtException:', error)
   * })
   * ```
   */
  public setUncaughtExceptionHandler(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (Is.Array(process._events.uncaughtException)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      process._events.uncaughtException.splice(1, 1)
    }

    process.on('uncaughtException', this.options.uncaughtExceptionHandler)
  }

  /**
   * Set the application chdir, change the process.cwd method to return the
   * root path where the application root is stored. Also resolve the environment
   * where the application is running (JavaScript or TypeScript).
   *
   * This method will determine if the application is using TypeScript by the meta url.
   * Also, if the application IS NOT using TypeScript, the "beforePath" (second argument
   * of this method) will be defined as value of "Path.defaultBeforePath" method.
   *
   * Let's check this example when application is running in TypeScript environment:
   *
   * @example
   * ```ts
   * const meta = import.meta.url // 'file:///Users/jlenon7/Development/Athenna/AthennaIO/artisan.ts'
   *
   * this.setApplicationRootPath(meta, '/build')
   *
   * console.log(Path.ext()) // ts
   * console.log(Path.pwd()) // /Users/jlenon7/Development/Athenna/AthennaIO
   * console.log(Path.config(`app.${Path.ext()}`)) // /Users/jlenon7/Development/Athenna/AthennaIO/config/app.ts
   * ```
   *
   * Now let's suppose that we have transpiled our code to JavaScript inside "/build" folder. "Path.pwd"
   * will end with "/build" at the end:
   *
   * @example
   * ```ts
   * const meta = import.meta.url // 'file:///Users/jlenon7/Development/Athenna/AthennaIO/build/artisan.js'
   *
   * this.setApplicationRootPath(meta, '/build')
   *
   * console.log(Path.ext()) // js
   * console.log(Path.pwd()) // /Users/jlenon7/Development/Athenna/AthennaIO/build
   * console.log(Path.config(`app.${Path.ext()}`)) // /Users/jlenon7/Development/Athenna/AthennaIO/build/config/app.js
   * ```
   */
  public setApplicationRootPath(): void {
    if (!process.env.CORE_TESTING) {
      const __dirname = Module.createDirname(import.meta.url)

      process.chdir(resolve(__dirname, '..', '..', '..', '..', '..'))
    }

    /**
     * If env IS_TS is already set, then we cant change it.
     */
    if (Env('IS_TS') === undefined) {
      Path.resolveEnvironment(this.meta, this.options.beforePath)
    }
  }

  /**
   * Set the env file that the application will use. The env file path will be
   * automatically resolved by Athenna (using the NODE_ENV variable) if any
   * path is set.
   *
   * In case path is empty:
   * If NODE_ENV variable it's already set the .env.${NODE_ENV} file will be used.
   * If not, Athenna will read the .env file and try to find the NODE_ENV value and
   * then load the environment variables inside the .env.${NODE_ENV} file. If any
   * NODE_ENV value is found in .env or .env.${NODE_ENV} file does not exist, Athenna
   * will use the .env file.
   */
  public setEnvVariablesFile(): void {
    if (this.options.envPath) {
      return EnvHelper.resolveFilePath(this.options.envPath)
    }

    EnvHelper.resolveFile(true)
  }

  /**
   * Configure the application signals.
   */
  public setApplicationSignals(): void {
    if (Env('SIGNALS_CONFIGURED', false)) {
      return
    }

    const signals = Config.get('app.signals', {})

    if (!signals.SIGINT) {
      signals.SIGINT = async () => {
        process.exit()
      }
    }

    if (!signals.SIGTERM) {
      signals.SIGTERM = async signal => {
        await LoadHelper.shutdownProviders()

        process.kill(process.pid, signal)
      }
    }

    Object.keys(signals).forEach(key => {
      if (!signals[key]) {
        return
      }

      process.on(key, signals[key])
    })

    process.env.SIGNALS_CONFIGURED = 'true'
  }

  /**
   * Load all the content of the .athennarc.json or athenna property of
   * package json inside the "rc" config. .athennarc.json file will always
   * be the priority, but if it does not exist, Athenna will try to use
   * the "athenna" property of package.json. Also, set app name, app version
   * and athenna version variables in env.
   *
   * @example
   * ```ts
   * Config.get('rc.providers')
   * ```
   */
  public async setRcContentAndAppVars() {
    const file = new File(this.options.athennaRcPath, '')
    const pkgJson = await new File(Path.pwd('package.json')).getContentAsJson()
    const corePkgJson = await new File('../../package.json').getContentAsJson()
    const coreSemverVersion = this.parseVersion(corePkgJson.version)

    this.setApplicationRootPath()

    process.env.APP_NAME = pkgJson.name
    process.env.APP_VERSION = this.parseVersion(pkgJson.version).toString()
    process.env.ATHENNA_VERSION = `Athenna Framework ${coreSemverVersion.toString()}`

    const athennaRc = {
      meta: this.meta,
      typescript: Env('IS_TS', false),
      isInPackageJson: false,
      version: coreSemverVersion,
      athennaVersion: process.env.ATHENNA_VERSION,
      engines: pkgJson.engines || {},
      commands: [],
      services: [],
      preloads: [],
      providers: [],
      controllers: [],
      middlewares: [],
      namedMiddlewares: {},
      globalMiddlewares: {},
      environments: [],
      commandsManifest: {},
    }

    const replaceableConfigs = {
      bootLogs: this.options.bootLogs,
      shutdownLogs: this.options.shutdownLogs,
    }

    if (file.fileExists) {
      Config.set('rc', {
        ...athennaRc,
        ...file.getContentAsJsonSync(),
        ...Config.get('rc', {}),
        ...replaceableConfigs,
      })

      return
    }

    if (!pkgJson.athenna) {
      Config.set('rc', {
        ...athennaRc,
        ...Config.get('rc', {}),
        ...replaceableConfigs,
      })

      this.options.athennaRcPath = null

      return
    }

    athennaRc.isInPackageJson = true
    this.options.athennaRcPath = Path.pwd('package.json')

    Config.set('rc', {
      ...athennaRc,
      ...pkgJson.athenna,
      ...Config.get('rc', {}),
      ...replaceableConfigs,
    })
  }

  /**
   * Load all the configuration files of some path. Remember that the path
   * needs to contains only configuration files (It can be nested inside folders).
   *
   * Imagine this path:
   *
   * config/
   *  user/
   *    database.ts
   *  customer/
   *    database.ts
   *
   * @example
   * ```ts
   * await this.setConfigurationFiles(Path.config())
   *
   * console.log(Path.config('user.database.url')) // some-url
   * console.log(Path.config('customer.database.url')) // some-different-url
   * ```
   */
  public async setConfigurationFiles(): Promise<void> {
    await Config.loadAll(
      this.options.configPath || Path.config(),
      this.options.loadConfigSafe,
    )
  }

  /**
   * Register this Ignite instance inside the IoC container.
   */
  public registerItselfToTheContainer(): void {
    this.container.instance('Athenna/Core/Ignite', this, false)
  }

  /**
   * Handle an error turning it pretty and logging as fatal.
   */
  private async handleError(error: any) {
    if (!Is.Exception(error)) {
      error = error.toAthennaException()
    }

    await Log.channelOrVanilla('exception').fatal(await error.prettify())

    process.exit(1)
  }

  /**
   * Parse some version string to the SemverNode type.
   */
  private parseVersion(version: string): SemverNode {
    const parsed = semverParse(version)

    if (!parsed) {
      return {
        major: null,
        minor: null,
        patch: null,
        prerelease: [],
        version: null,
        toString() {
          return this.version
        },
      }
    }

    return {
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease.map(release => release),
      version: parsed.version,
      toString() {
        return this.version
      },
    }
  }
}
