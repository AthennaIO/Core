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
   * Your environment variable file path. If the path is not set, Athenna will
   * read your ".env" file (if exists) to get the NODE_ENV environment variable.
   * Then it will load the ".env.${NODE_ENV}" file (if exists).
   *
   * If the envFile path is set, Athenna will only load the env path you set.
   *
   * @default undefined
   */
  envPath?: string

  /**
   * The configuration files path.
   *
   * @default './config'
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
   * .athennarc.json file. Also, if you use a relative path in this property such
   * as '.athennarc.json', Athenna will resolve the path from your project root.
   * Is the same of using Path.pwd('.athennarc.json'). We are not using Path.pwd
   * helper here because if you run the application outside of the project root,
   * the pwd path will not be from your application.
   *
   * @default './.athennarc.json'
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
   * Log.channelOrVanilla('exception').fatal(await error.prettify())
   *
   * process.exit(1)
   * ```
   */
  uncaughtExceptionHandler?: (error: Error) => void | Promise<void>
}
