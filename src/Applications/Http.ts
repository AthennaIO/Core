/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { HttpOptions } from '#src/Types/HttpOptions'
import { Is, Module, Options } from '@athenna/common'

export class Http {
  /**
   * Boot the Http application and execute the commands of argv.
   */
  public static async boot(options?: HttpOptions) {
    options = Options.create(options, {
      host: Config.get('http.host', '127.0.0.1'),
      port: Config.get('http.port', 3000),
      kernelPath: Path.nodeModules('@athenna/http/build/Kernels/HttpKernel.js'),
    })

    const server = ioc.safeUse('Athenna/Core/HttpServer')

    await this.resolveKernel(options)

    ioc.safeUse('Athenna/Core/HttpRoute').register()

    await server.listen({ host: options.host, port: options.port }).then(() => {
      if (Config.is('rc.bootLogs', false)) {
        return
      }

      const host = server.getHost()
      const port = server.getPort()
      let path = `${host}:${port}`

      if (!Is.Ip(host)) {
        path = host
      }

      if (host === '::1') {
        path = `localhost:${port}`
      }

      Log.channelOrVanilla('application').success(
        `Http server started on ({yellow} ${path})`,
      )
    })
  }

  /**
   * Resolve the kernel by importing it and calling the methods to register
   * controllers, all kind of middlewares, plugins and exception handler for
   * requests.
   */
  private static async resolveKernel(options?: HttpOptions) {
    const Kernel = await Module.resolve(
      options.kernelPath,
      Config.get('rc.meta'),
    )

    const kernel = new Kernel()

    await kernel.registerControllers()
    await kernel.registerMiddlewares()
    await kernel.registerExceptionHandler(options.exceptionHandlerPath)
    await kernel.registerCors()
    await kernel.registerHelmet()
    await kernel.registerSwagger()
    await kernel.registerRateLimit()
    await kernel.registerRTracer()
    await kernel.registerLoggerTerminator()

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`,
      )
    }
  }
}
