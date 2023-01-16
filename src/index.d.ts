/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Http } from '@athenna/http'
import { REPLServer } from 'node:repl'
import { ArtisanImpl } from '@athenna/artisan'
import { VanillaLogger } from '@athenna/logger'

export interface REPLOptions {
  /**
   * The repl route path.
   *
   * @default Path.routes(`repl.${Path.ext()}`)
   */
  routePath?: string,
}

export interface ArtisanOptions {
  /**
   * The artisan route path.
   *
   * @default Path.routes(`console.${Path.ext()}`)
   */
  routePath?: string,

  /**
   * The console kernel path.
   *
   * @default Path.console(`Kernel.${Path.ext()}`)
   */
  kernelPath?: string
}

export interface HttpServerOptions {
  /**
   * The http route path.
   *
   * @default Path.routes(`http.${Path.ext()}`)
   */
  routePath?: string,

  /**
   * The http kernel path.
   *
   * @default Path.http(`Kernel.${Path.ext()}`)
   */
  kernelPath?: string
}

export interface IgniteOptions {
  /**
   * Signals that the application should listen too.
   * Useful for configuring graceful shutdown.
   *
   * @default Config.get('app.gracefulShutdown')
   */
  signals?: any,

  /**
   * Your environment variable file path. By
   * default, Athenna will load your ".env" file
   * (just to get the NODE_ENV env) and then try
   * to reload with "OVERRIDE_ENV=true" searching
   * for the ".env.${NODE_ENV}" file.
   *
   * If the envFile path is set, Athenna will only load
   * the env path you set.
   *
   * @default Path.pwd('.env')
   */
  envPath?: string,

  /**
   * Your application preload files. Preload files help
   * an Athenna application to bootstrap, in somecases
   * you might not want to import all your preload files
   * depending on the application you are running. This
   * option could be used for this purpose.
   *
   * @default Config.get('app.preloads')
   */
  preloads?: any[],

  /**
   * Your application providers. Providers help
   * an Athenna application to bootstrap, in somecases
   * you might not want to bootstrap all your providers
   * depending on the application you are running. This
   * option could be used for this purpose.
   *
   * @default Config.get('app.providers')
   */
  providers?: any[],

  /**
   * Show boot logs of the application. If this option
   * is true, Athenna will log operations that are being
   * executed to boot your application.
   *
   * @default true
   */
  bootLogs?: boolean,

  /**
   * The before path that will be used in all
   * "Path" helper calls. This is extremelly useful
   * when working with TypeScript and you need to build
   * your code, just set the "beforePath" as "/build" and
   * Athenna will automatically add it if running ".js" files.
   *
   * If file ends with ".ts", Athenna will not set the "beforePath".
   *
   * @default ''
   */
  beforePath?: string,

  /**
   * The configuration files path.
   *
   * @default Path.config()
   */
  configsPath?: string,

  /**
   * Show shutdown logs of the application. If
   * this option is true, ProviderHelper will
   * log all the providers shutting down.
   *
   * @default false
   */
  shutdownLogs?: boolean,

  /**
   * Load the configurations file safelly. If
   * this option is true, Athenna will not reload
   * configuration files that are already loaded.
   *
   * @default false
   */
  loadConfigSafe?: boolean,

  /**
   * The exception handler for uncaught exceptions.
   * The default one uses VanillaLogger to show errors.
   * After the error is logged, the application exits.
   */
  uncaughtExceptionHandler?: (error: Error) => void | Promise<void>
}

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
   * Set listener in "uncaughtException" event. You can set
   * your own callback or use the Athenna default to handle
   * uncaught errors.
   *
   * @param {any} [callback]
   * @return {void}
   */
  setUncaught(callback?: (error: Error) => void | Promise<void>): void

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
  setRootPath(metaUrl: string, beforePath?: string): void

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
  setEnvFile(path?: string): void

  /**
   * Load the configuration files inside some path.
   * The default path is always Path.config().
   *
   * @param {string} [path]
   * @param {boolean} [safe]
   * @return {Promise<void>}
   */
  setConfigFiles(path?: string, safe?: boolean): Promise<void>

  /**
   * Also set the application providers. By default, if
   * providers array is empty, Athenna will bootstrap
   * according to "config/app" file using "providers" key
   * value.
   *
   * @param [providers] {any[]}
   * @return {Promise<void>}
   */
  setProviders(providers?: any[]): Promise<void>

  /**
   * Files that Athenna needs to preload when bootstraping
   * the application. By default, if files is undefined, Athenna
   * will look up into config/app using the "preloads" key value.
   *
   * @param {any[]} preloads
   * @return {Promise<void>}
   */
  setFilesToPreload(preloads?: any[]): Promise<void>

  /**
   * Fire the application loading configuration files, registering
   * providers and preloading files. Everything in order.
   *
   * @param {string} metaUrl
   * @param {IgniteOptions} [options]
   * @return {Promise<Application>}
   */
  fire(metaUrl: string, options?: IgniteOptions): Promise<Application>

  /**
   * Get the instance of the application inside of Ignite class.
   *
   * @return {Application}
   */
  getApplication(): Application

  /**
   * Create a new instance of application inside
   * Ignite class.
   *
   * @return {Application}
   */
  createApplication(): Application
}

export class Application {
  /**
   * Creates a new instance of Application.
   */
  constructor(logger: VanillaLogger)

  /**
   * Boot a new REPL inside this Application instance.
   *
   * @param {{
   *   routePath?: string,
   * }} [options]
   * @return {Promise<import('node:repl').REPLServer>}
   */
  bootREPL(options?: REPLOptions): Promise<REPLServer>

  /**
   * Boot a new Artisan inside this Application instance.
   *
   * @param {{
   *   routePath?: string,
   *   kernelPath?: string,
   * }} [options]
   * @return {Promise<import('@athenna/artisan').ArtisanImpl>}
   */
  bootArtisan(options?: ArtisanOptions): Promise<ArtisanImpl>

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @param {{
   *   routePath?: string,
   *   kernelPath?: string,
   * }} [options]
   * @return {Promise<import('@athenna/http').Http>}
   */
  bootHttpServer(options?: HttpServerOptions): Promise<Http>
}

export class ProviderHelper {
  /**
   * All the providers registered in the application.
   *
   * @type {any[]}
   */
  static providers: any[]

  /**
   * Set if provider helper will generate shutdown logs
   * when running providers shutdown method.
   *
   * @type {boolean}
   */
  static shutdownLogs: boolean

  /**
   * Set the providers that ProviderHelper will work with.
   *
   * @param providers {any[]}
   * @return {Promise<void>}
   */
  static setProviders(providers: any[]): Promise<void>

  /**
   * Get all the providers from config/app.js file with
   * export normalized.
   *
   * export default, export, module.exports, etc.
   *
   * @return {any[]}
   */
  static getAll(): any[]

  /**
   * Get all the providers from config/app.js file with
   * export normalized and only where provider is bootable
   * by ATHENNA_APPLICATIONS env.
   *
   * @return {any[]}
   */
  static getAllBootable(): any[]

  /**
   * Boot all the application providers that could be booted.
   *
   * @return {Promise<void>}
   */
  static bootAll(): Promise<void>

  /**
   * Register all the application providers that could be registered.
   *
   * @return {Promise<void>}
   */
  static registerAll(): Promise<void>

  /**
   * Shutdown all the application providers that could be shutdown.
   *
   * @return {Promise<void>}
   */
  static shutdownAll(): Promise<void>

  /**
   * Verify if provider can be bootstrap using ATHENNA_APPLICATIONS env.
   *
   * @param {any} Provider
   * @return {boolean}
   */
  static canBeBootstrapped(Provider: any): boolean
}
