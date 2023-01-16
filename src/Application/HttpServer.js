/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:path'
import { Config } from '@athenna/config'
import { Module, Options, Path } from '@athenna/common'
import { PreloadHelper } from '#src/Helpers/PreloadHelper'

export class HttpServer {
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
   * Creates a new instance of HttpServer.
   *
   * @param logger {import('@athenna/logger').VanillaLogger}
   * @param container {import('@athenna/ioc').Ioc}
   */
  constructor(logger, container) {
    this.#logger = logger
    this.#container = container
  }

  /**
   * Boot the Http server application.
   *
   * @param {{
   *   routePath?: string,
   *   kernelPath?: string,
   * }} [options]
   * @return {Promise<import('@athenna/http').Http>}
   */
  async boot(options) {
    options = Options.create(options, {
      routePath: Path.routes(`http.${Path.ext()}`),
      kernelPath: Path.http(`Kernel.${Path.ext()}`),
    })

    const httpRoute = this.#container.safeUse('Athenna/Core/HttpRoute')
    const httpServer = this.#container.safeUse('Athenna/Core/HttpServer')

    /**
     * Resolve the Kernel file inside Http directory. It's
     * extremely important to call this method before preloading
     * the routes/http file because of named middlewares
     */
    await this.#resolveHttpKernel(options.kernelPath)

    await PreloadHelper.preload(options.routePath)

    this.#logger.success(
      `File ${parse(options.routePath).base} successfully preloaded`,
    )

    httpRoute.register()

    const port = Config.get('http.port')
    const host = Config.get('http.host')

    await httpServer.listen(port, host)

    this.#logger.success(`Http server started on http://${host}:${port}`)

    return httpServer
  }

  /**
   * Resolve the Kernel of the http server.
   *
   * @parm {string} path
   * @return {Promise<void>}
   */
  async #resolveHttpKernel(path) {
    const Kernel = await Module.getFrom(path)

    const kernel = new Kernel()

    this.#logger.success('Booting http Kernel')

    await kernel.registerCors()
    await kernel.registerTracer()
    await kernel.registerHelmet()
    await kernel.registerSwagger()
    await kernel.registerRateLimit()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()
  }
}
