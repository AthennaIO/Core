/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class CoreLoader {
  /**
   * Return all commands from artisan console application.
   *
   * @return {any[]}
   */
  static loadCommands(): any[]

  /**
   * Return all templates from artisan console application.
   *
   * @return {any[]}
   */
  static loadTemplates(): any[]
}

export class Ignite {
  /**
   * Fire the application loading configuration files, registering
   * providers and preloading files. Everything in order.
   *
   * @return {Promise<Application>}
   */
  fire(): Promise<Application>

  /**
   * Get the instance of the application inside of Ignite class.
   *
   * @return {Application}
   */
  getApplication(): Application
}

export class Application {
  /**
   * Boot a new REPL inside this Application instance.
   *
   * @return {Promise<import('node:repl').REPLServer>}
   */
  bootREPL(): Promise<import('node:repl').REPLServer>

  /**
   * Boot a new Artisan inside this Application instance.
   *
   * @return {Promise<import('@athenna/artisan').ArtisanImpl>}
   */
  bootArtisan(): Promise<import('@athenna/artisan').ArtisanImpl>

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @return {Promise<import('@athenna/http').Http>}
   */
  bootHttpServer(): Promise<import('@athenna/http').Http>
}

export class ProviderHelper {
  /**
   * Get all the providers from config/app.js file with
   * export normalized.
   *
   * export default, export, module.exports, etc.
   *
   * @return {Promise<any[]>}
   */
  static getAll(): Promise<any[]>

  /**
   * Get all the providers from config/app.js file with
   * export normalized and only where provider is bootable
   * by ATHENNA_APPLICATIONS env.
   *
   * @return {Promise<any[]>}
   */
  static getAllBootable(): Promise<any[]>

  /**
   * Boot all the application providers that could be booted.
   *
   * @param {boolean} log
   * @return {Promise<void>}
   */
  static bootAll(log?: boolean): Promise<void>

  /**
   * Register all the application providers that could be registered.
   *
   * @param {boolean} log
   * @return {Promise<void>}
   */
  static registerAll(log?: boolean): Promise<void>

  /**
   * Shutdown all the application providers that could be shutdown.
   *
   * @param {boolean} log
   * @return {Promise<void>}
   */
  static shutdownAll(log?: boolean): Promise<void>

  /**
   * Verify if provider can be bootstrap using ATHENNA_APPLICATIONS env.
   *
   * @param {any} Provider
   * @return {boolean}
   */
  static canBeBootstrapped(Provider: any): boolean
}
