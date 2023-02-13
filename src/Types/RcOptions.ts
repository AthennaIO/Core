/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface RcOptions {
  /**
   * The meta url of where the application has bootstrapped. Athenna will always save this information
   * to know the call path where the application has started.
   */
  meta?: string

  /**
   * Set if the application will have boot logs showed.
   */
  bootLogs?: boolean

  /**
   * Set if the application will have shutdown logs showed.
   */
  shutdownLogs?: boolean

  /**
   * The NPM engines property of your application package.json.
   */
  engines?: Record<string, any>

  /**
   * The Athenna version that is running.
   */
  version?: boolean

  /**
   * The environments where the application is running.
   */
  environments?: string[]

  /**
   * Set if Athenna is running as a TypeScript application or not.
   */
  typescript?: boolean

  /**
   * Set if the Rc file is being used inside package.json file in the "athenna" property.
   */
  isInPackageJson?: boolean

  /**
   * Set the path to all the services of your application.
   */
  services?: string[]

  /**
   * Set the preload files that Athenna needs to preload in the application bootstrap.
   */
  preloads?: string[]

  /**
   * Set the providers that Athenna needs to register in the application bootstrap.
   */
  providers?: string[]

  /**
   * Set the commands that Athenna needs to register when running an Artisan command.
   */
  commands?: string[]

  /**
   * Set the commands manifest where the key is the signature of your command and the
   * value is the path to your command. If the command that you are running is inside
   * the commandsManifest property, Athenna will import ONLY that specific command,
   * ignoring the entire "commands" array.
   */
  commandsManifest?: Record<string, string>
}