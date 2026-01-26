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
import type { HttpOptions } from '#src/types/HttpOptions'
import { Is, Path, Module, Options } from '@athenna/common'
import type { AWSLambdaHandler } from '#src/types/AWSLambdaHandler'

export class Http {
  /**
   * Only initialize the server without booting it.
   */
  public static async init(options?: HttpOptions): Promise<ServerImpl> {
    const server = ioc.safeUse('Athenna/Core/HttpServer')

    debug('booting http application with options %o', options)

    await this.resolveKernel(options)

    ioc.safeUse('Athenna/Core/HttpRoute').register()

    await server.viteReady()

    return server
  }

  public static async boot(
    options: HttpOptions & { isAWSLambda: true }
  ): Promise<AWSLambdaHandler>

  public static async boot(options?: HttpOptions): Promise<ServerImpl>

  /**
   * Boot the Http application.
   */
  public static async boot(
    options?: HttpOptions
  ): Promise<ServerImpl | AWSLambdaHandler> {
    options = Options.create(options, {
      initOnly: false,
      isAWSLambda: false,
      host: Config.get('http.host', '127.0.0.1'),
      port: Config.get('http.port', 3000),
      routePath: Config.get('rc.http.route', Path.routes(`http.${Path.ext()}`)),
      mcpRoutePath: Config.get('rc.mcp.route', Path.routes(`mcp.${Path.ext()}`)),
      kernelPath: Config.get(
        'rc.http.kernel',
        '@athenna/http/kernels/HttpKernel'
      )
    })

    const server = await this.init(options)

    if (options.initOnly) {
      return server
    }

    if (options.isAWSLambda) {
      return this.resolveAWSLambdaProxy(server)
    }

    await server.listen({ host: options.host, port: options.port })

    if (Config.notExists('rc.bootLogs') || Config.is('rc.bootLogs', false)) {
      return server
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
    await kernel.registerStatic()
    await kernel.registerMultipart()
    await kernel.registerSwagger()
    await kernel.registerVite()
    await kernel.registerRateLimit()
    await kernel.registerRTracer()
    await kernel.registerLoggerTerminator()
    await kernel.registerRoutes(options.routePath)
    await kernel.registerMcpRoutes(options.mcpRoutePath)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`
      )
    }
  }

  /**
   * Resolve the AWS Lambda proxy.
   */
  private static async resolveAWSLambdaProxy(server: ServerImpl) {
    const awsLambda = await Module.safeImport('@athenna/http/awslambda')

    if (awsLambda?.default) {
      return awsLambda.default(server.fastify)
    }

    if (!awsLambda) {
      throw new Error('The library @fastify/aws-lambda is not installed')
    }

    return awsLambda(server.fastify)
  }
}
