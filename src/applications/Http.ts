/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import type { ServerImpl } from '@athenna/http'
import { Is, Module, Options } from '@athenna/common'
import type { HttpOptions } from '#src/types/HttpOptions'

export class Http {
  /**
   * Boot the Http application.
   */
  public static async boot(options?: HttpOptions): Promise<ServerImpl> {
    options = Options.create(options, {
      host: Config.get('http.host', '127.0.0.1'),
      port: Config.get('http.port', 3000),
      trace: Config.get('http.trace', false),
      routePath: Path.routes(`rest.${Path.ext()}`),
      kernelPath: '@athenna/http/kernels/HttpKernel'
    })

    const server = ioc.safeUse('Athenna/Core/HttpServer')

    debug('booting http application with options %o', options)

    await this.resolveKernel(options)

    ioc.safeUse('Athenna/Core/HttpRoute').register()

    await server.listen({ host: options.host, port: options.port })

    if (Config.notExists('rc.bootLogs') || Config.is('rc.bootLogs', false)) {
      return
    }

    const host = server.getHost() || options.host
    const port = server.getPort() || options.port
    let path = `${host}:${port}`

    if (!Is.Ip(host)) {
      path = host
    }

    if (host === '::1') {
      path = `localhost:${port}`
    }

    Log.channelOrVanilla('application').success(
      `Http server started on ({yellow} ${path})`
    )

    return server
  }

  /**
   * Resolve the kernel by importing it and calling the methods to register
   * controllers, all kind of middlewares, plugins and exception handler for
   * requests.
   */
  private static async resolveKernel(options?: HttpOptions) {
    const Kernel = await Module.resolve(
      options.kernelPath,
      Config.get('rc.parentURL')
    )

    const kernel = new Kernel()

    await kernel.registerControllers()
    await kernel.registerMiddlewares()
    await kernel.registerExceptionHandler(options.exceptionHandlerPath)
    await kernel.registerCors()
    await kernel.registerHelmet()
    await kernel.registerSwagger()
    await kernel.registerRateLimit()
    await kernel.registerRTracer(options.trace)
    await kernel.registerLoggerTerminator()
    await kernel.registerRoutes(options.routePath)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`
      )
    }
  }
}
