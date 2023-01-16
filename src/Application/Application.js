/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'

import { Repl } from '#src/Application/Repl'
import { Artisan } from '#src/Application/Artisan'
import { HttpServer } from '#src/Application/HttpServer'

export class Application {
  /**
   * Simple vanilla logger.
   *
   * @type {import('@athenna/logger').VanillaLogger}
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
  constructor(logger) {
    this.#logger = logger
    this.#container = new Ioc()
  }

  /**
   * Boot a new REPL inside this Application instance.
   *
   * @param {{
   *   routePath?: string,
   * }} [options]
   * @return {Promise<import('node:repl').REPLServer>}
   */
  async bootREPL(options) {
    return new Repl(this.#logger, this.#container).boot(options)
  }

  /**
   * Boot a new Artisan inside this Application instance.
   *
   * @param {{
   *   routePath?: string,
   *   kernelPath?: string,
   * }} [options]
   * @return {Promise<import('@athenna/artisan').ArtisanImpl>}
   */
  async bootArtisan(options) {
    return new Artisan(this.#logger, this.#container).boot(options)
  }

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @param {{
   *   routePath?: string,
   *   kernelPath?: string,
   * }} [options]
   * @return {Promise<import('@athenna/http').Http>}
   */
  async bootHttpServer(options) {
    return new HttpServer(this.#logger, this.#container).boot(options)
  }
}
