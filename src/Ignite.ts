/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Importing global files to be added to global module of Node.js
 */
import '@athenna/ioc'
import '@athenna/config/src/Utils/global'

import { Logger } from '@athenna/logger'
import { File, Path } from '@secjs/utils'
import { Application } from 'src/Application'
import { resolveEnvFile } from '@athenna/config'
import { normalize, parse, resolve } from 'path'
import { ResolveClassExport } from 'src/Utils/ResolveClassExport'
import { DuplicatedApplicationException } from 'src/Exceptions/DuplicatedApplicationException'

export class Ignite {
  /**
   * Simple logger for Ignite class.
   *
   * @private
   */
  private logger: Logger

  /**
   * An instance of the application. Is here that the
   * client will bootstrap his type of application.
   *
   * @private
   */
  private application: Application | null

  /**
   * The extension that is being used to bootstrap the
   * application. This will be usefully to preload files.
   *
   * @private
   */
  private extension: '.ts' | '.js'

  public constructor(fileName: string) {
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

    this.resolveNodeTs(fileName)
    this.resolveNodeEnv()

    /**
     * Load all config files of config folder
     */
    Config.load(Path.config())

    this.clearConsole()

    /**
     * Using require because logger needs to be set after
     * resolveNodeEnv method has been called.
     */
    this.logger = ResolveClassExport.resolve(require('./Utils/Logger'))

    const providers = this.getProviders()

    this.registerProviders(providers)
    this.bootProviders(providers)
    this.preloadFiles()
  }

  /**
   * Get the instance of the application inside of Ignite class.
   *
   * @return Application
   */
  getApplication(): Application {
    if (!this.application) {
      throw new DuplicatedApplicationException()
    }

    return this.application
  }

  /**
   * Create a new instance of application inside
   * Ignite class.
   *
   * @return Application
   */
  createApplication(): Application {
    if (this.application) {
      throw new DuplicatedApplicationException()
    }

    this.application = new Application(this.extension)

    return this.application
  }

  /**
   * Resolve the NODE_TS Env variable verifying if the extension
   * of the file that is running Ignite class is .ts or other.
   *
   * @param fileName
   * @private
   */
  private resolveNodeTs(fileName: string) {
    const { ext } = parse(fileName)

    if (ext === '.ts') {
      process.env.NODE_TS = 'true'

      this.extension = '.ts'

      return
    }

    process.env.NODE_TS = 'false'
    this.extension = (ext || '') as any
  }

  /**
   * Resolve the NODE_ENV Env variable verifying if it's already
   * set. If not, get the content of config/app file and take the
   * environment key value to set as NODE_ENV. Then, resolve the
   * .env.${NODE_ENV} file in Node.js process.
   *
   * @private
   */
  private resolveNodeEnv() {
    if (!process.env.NODE_ENV) {
      let env = new File(Path.config(`app${this.extension}`))
        .loadSync()
        .getContentSync()
        .toString()
        .split('environment:')[1]
        .split(',')[0]
        .trim()

      if (env.includes('process.env.NODE_ENV')) {
        env = env.split('process.env.NODE_ENV')[1].replace('/||/g', '').trim()
      }

      process.env.NODE_ENV = env
    }

    resolveEnvFile()
  }

  /**
   * Clear the console if isn't in debug mode and NODE_ENV is
   * not set to testing environment.
   *
   * @private
   */
  private clearConsole() {
    const isNotDebugModeOrTesting =
      !Env('APP_DEBUG') &&
      (Env('NODE_ENV') === 'test' || Env('NODE_ENV') === 'testing')

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
   * @private
   */
  private getProviders() {
    const providers = Config.get('app.providers')
    const providersNormalized: any[] = []

    providers.forEach(Provider => {
      providersNormalized.push(ResolveClassExport.resolve(Provider))
    })

    providersNormalized.forEach(p =>
      this.logger.success(`Registering ${p.name}`),
    )

    return providersNormalized
  }

  /**
   * Boot all the providers calling the boot method
   * and reading the register attributes inside providers.
   *
   * @private
   */
  private bootProviders(providers: any[]) {
    providers.forEach(Provider => {
      const provider = new Provider()

      provider.registerAttributes()

      if (provider.boot) provider.boot()
    })
  }

  /**
   * Register all the providers calling the register method
   * and reading the register attributes inside providers.
   *
   * @private
   */
  private registerProviders(providers: any[]) {
    providers.forEach(Provider => {
      const provider = new Provider()

      provider.registerAttributes()

      if (provider.register) provider.register()
    })
  }

  /**
   * Preload all the files configured inside config/app
   * file.
   *
   * @private
   */
  private preloadFiles() {
    const preloads = Config.get('app.preloads')

    preloads.forEach(preload => {
      preload = normalize(preload)

      const { dir, name } = parse(Path.config(preload))
      this.logger.success(`Preloading ${name} file`)

      require(`${dir}/${name}${this.extension}`)
    })
  }
}
