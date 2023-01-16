/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:path'
import { Module, Options, Path } from '@athenna/common'
import { PreloadHelper } from '#src/Helpers/PreloadHelper'

export class Artisan {
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
   * Creates a new instance of Artisan.
   *
   * @param logger {import('@athenna/logger').VanillaLogger}
   * @param container {import('@athenna/ioc').Ioc}
   */
  constructor(logger, container) {
    this.#logger = logger
    this.#container = container
  }

  /**
   * Boot the Artisan application.
   *
   * @param {{
   *   routePath?: string,
   *   kernelPath?: string,
   * }} [options]
   * @return {Promise<import('@athenna/artisan').ArtisanImpl>}
   */
  async boot(options = {}) {
    options = Options.create(options, {
      routePath: Path.routes(`console.${Path.ext()}`),
      kernelPath: Path.console(`Kernel.${Path.ext()}`),
    })

    const artisan = this.#container.safeUse('Athenna/Core/Artisan')

    await this.#resolveConsoleKernel(options.kernelPath)

    const routePath = Path.routes(`console.${Path.ext()}`)
    await PreloadHelper.preload(routePath)

    this.#logger.success(`File ${parse(routePath).base} successfully preloaded`)

    return artisan
  }

  /**
   * Resolve the Kernel of the Artisan.
   *
   * @param {string} path
   * @return {Promise<void>}
   */
  async #resolveConsoleKernel(path) {
    const Kernel = await Module.getFrom(path)

    const kernel = new Kernel()

    this.#logger.success('Booting console Kernel')

    await kernel.registerErrorHandler()
    await kernel.registerCommands()
    await kernel.registerTemplates()
  }
}
