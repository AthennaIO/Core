/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type IgniteOptions = {
  /**
   * Show boot logs of the application. If this option is true, Athenna
   * will log operations that are being executed to boot your application.
   *
   * @default true
   */
  bootLogs?: boolean

  /**
   * Show shutdown logs of the application. If this option is true,
   * Athenna will log operations that are being executed to shutdown your
   * application.
   *
   * @default false
   */
  shutdownLogs?: boolean

  /**
   * Your environment variable file path. By default, Athenna will load
   * your ".env" file (just to get the NODE_ENV env) and then try to
   * reload with "OVERRIDE_ENV=true" searching for the ".env.${NODE_ENV}"
   * file.
   *
   * If the envFile path is set, Athenna will only load
   * the env path you set.
   *
   * @default Path.pwd('.env')
   */
  envPath?: string

  /**
   * The configuration files path.
   *
   * @default Path.config()
   */
  configPath?: string

  /**
   * Load the configurations file safelly. If this option is true, Athenna
   * will not reload configuration files that are already loaded.
   *
   * @default false
   */
  loadConfigSafe?: boolean

  /**
   * Your application preload files. Preload files help an Athenna application
   * to bootstrap, in somecases you might not want to import all your preload
   * files depending on the application you are running. This option could be
   * used for this purpose.
   *
   * @default Config.get('rc.preloads')
   */
  preloads?: any[]

  /**
   * Your application providers. Providers help an Athenna application to bootstrap,
   * in somecases you might not want to bootstrap all your providers depending on
   * the application you are running. This option could be used for this purpose.
   *
   * @default Config.get('rc.providers')
   */
  providers?: any[]

  /**
   * The before path that will be used in all "Path" helper calls. This is extremelly
   * useful when working with TypeScript and you need to build your code, just set
   * the "beforePath" as "/build" and Athenna will automatically add it if running
   * ".js" files.
   *
   * If file ends with ".ts", Athenna will not set the "beforePath".
   *
   * @default ''
   */
  beforePath?: string

  /**
   * The .athennarc.json file path. This file is used to map providers, commands,
   * preloads and many other stuffs used to boot your application. You can also
   * use the "athenna" property inside your package.json file, but the priority
   * of Athenna load will always be the .athennarc.json file. So, if you wish to
   * move your properties to the "athenna" property, you will need to delete the
   * .athennarc.json file.
   *
   * @default Path.pwd('.athennarc.json')
   */
  athennaRcPath?: string

  /**
   * The exception handler for uncaught exceptions. The default one uses Athenna Logger
   * to show errors. After the error is logged, the application exits.
   *
   * @default
   * ```ts
   * if (!error.prettify) {
   *   error = error.toAthennaException()
   * }
   *
   * if (this.container.hasDependency('Athenna/Core/Logger')) {
   *   Log.channelOrVanilla('exception').fatal(await error.prettify())
   * } else {
   *   new Logger().channelOrVanilla('exception').fatal(await error.prettify())
   * }
   *
   * process.exit(1)
   * ```
   */
  uncaughtExceptionHandler?: (error: Error) => void | Promise<void>
}
