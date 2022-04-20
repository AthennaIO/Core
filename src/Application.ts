/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'path'
import { Ioc } from '@athenna/ioc'
import { Logger } from '@athenna/logger'
import { Path, resolveModule } from '@secjs/utils'
import { Artisan } from '@athenna/artisan/src/Artisan'
import { Http, Router as HttpRoute } from '@athenna/http'
import { NotBootedException } from 'src/Exceptions/NotBootedException'
import { AlreadyBootedException } from 'src/Exceptions/AlreadyBootedException'
import { AlreadyShutdownException } from 'src/Exceptions/AlreadyShutdownException'

export class Application {
  /**
   * Simple logger for Application class. Application creates
   * a new instance of Logger because providers are not
   * registered yet.
   *
   * @private
   */
  private logger: Logger

  /**
   * An instance of the Ioc class that is a Monostate with
   * the Awilix container inside.
   *
   * @private
   */
  private readonly container: Ioc

  /**
   * An instance of the application. Is here that the
   * client will bootstrap his type of application.
   *
   * @private
   */
  private readonly extension: string

  /**
   * The http server instance.
   *
   * @private
   */
  private httpServer: Http | null

  /**
   * The http route instance.
   *
   * @private
   */
  private httpRoute: HttpRoute | null

  /**
   * The artisan instance.
   *
   * @private
   */
  private artisan: Artisan | null

  public constructor(extension: string) {
    this.container = new Ioc()
    this.httpServer = null
    this.httpRoute = null
    this.extension = extension
  }

  /**
   * An instance of the Ioc class that is a Monostate with
   * the Awilix container inside.
   *
   * @return Ioc
   */
  getContainer(): Ioc {
    return this.container
  }

  /**
   * An instance of the Artisan class or an exception if it's not
   * booted.
   *
   * @return Artisan
   */
  getArtisan(): Artisan {
    if (!this.artisan) {
      throw new NotBootedException('Artisan')
    }

    return this.artisan
  }

  /**
   * An instance of the Http class or an exception if it's not
   * booted.
   *
   * @return Http
   */
  getHttpServer(): Http {
    if (!this.httpServer) {
      throw new NotBootedException('HttpServer')
    }

    return this.httpServer
  }

  /**
   * An instance of the Router class or an exception if it's not
   * booted.
   *
   * @return HttpRoute
   */
  getHttpRoute(): HttpRoute {
    if (!this.httpRoute) {
      throw new NotBootedException('HttpServer')
    }

    return this.httpRoute
  }

  // TODO
  // async bootWorker() {}

  // TODO
  // async shutdownWorker() {}

  /**
   * Boot a new Artisan inside this Application instance.
   *
   * @return void
   */
  async bootArtisan() {
    if (!this.logger) {
      this.logger = resolveModule(await import('./Utils/Logger'))
    }

    if (this.artisan) {
      throw new AlreadyBootedException('Artisan')
    }

    this.artisan = this.container.safeUse<Artisan>('Athenna/Core/Artisan')

    /**
     * Resolve the Kernel file inside Console directory.
     */
    await this.resolveConsoleKernel()

    /**
     * Preload default console route file
     */
    await this.preloadFile(Path.pwd('routes/console'))

    return this.artisan
  }

  /**
   * Shutdown the Artisan inside this Application instance.
   *
   * @return void
   */
  async shutdownArtisan() {
    if (!this.artisan) {
      throw new AlreadyShutdownException('Artisan')
    }

    this.logger.warn(`Artisan shutdown, bye! :)`)

    this.artisan = null
  }

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @return void
   */
  async bootHttpServer(): Promise<Http> {
    if (!this.logger) {
      this.logger = resolveModule(await import('./Utils/Logger'))
    }

    if (this.httpServer) {
      throw new AlreadyBootedException('HttpServer')
    }

    this.httpServer = this.container.safeUse<Http>('Athenna/Core/HttpServer')
    this.httpRoute = this.container.safeUse<HttpRoute>('Athenna/Core/HttpRoute')

    /**
     * Resolve the Kernel file inside Http directory. It's
     * extremely important to call this method before preloading
     * the routes/http file because of named middlewares
     */
    await this.resolveHttpKernel()

    /**
     * Preload default http route file
     */
    await this.preloadFile(Path.pwd('routes/http'))

    this.httpRoute.register()

    const port = Config.get('http.port')
    const host = Config.get('http.host')

    await this.httpServer.listen(port, host)

    this.logger.success(`Http server started on http://${host}:${port}`)

    return this.httpServer
  }

  /**
   * Shutdown the HttpServer inside this Application instance.
   *
   * @return void
   */
  async shutdownHttpServer() {
    if (!this.httpServer) {
      throw new AlreadyShutdownException('HttpServer')
    }

    this.logger.warn(`Http server shutdown, bye! :)`)

    await this.httpServer.close()

    this.httpRoute = null
    this.httpServer = null
  }

  /**
   * Preload the file according to filePath. This is usefully
   * to preload default files of each type of application. Such
   * as routes and Kernels.
   *
   * @param filePath
   * @private
   */
  private async preloadFile(filePath: string) {
    const { dir, name } = parse(filePath)

    this.logger.success(`Preloading ${name} file`)

    await import(`${dir}/${name}${this.extension}`)
  }

  /**
   * Resolve the Kernel of the http server.
   *
   * @private
   */
  private async resolveHttpKernel() {
    const { dir, name } = parse(Path.app('Http/Kernel'))

    const Kernel = resolveModule(
      await import(`${dir}/${name}${this.extension}`),
    )

    const kernel = new Kernel()

    this.logger.success('Booting the Http Kernel')

    await kernel.registerCors()
    await kernel.registerRateLimit()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()
    await kernel.registerMiddlewares()
  }

  /**
   * Resolve the Kernel of the artisan/console.
   *
   * @private
   */
  private async resolveConsoleKernel() {
    const { dir, name } = parse(Path.app('Console/Kernel'))

    const Kernel = resolveModule(
      await import(`${dir}/${name}${this.extension}`),
    )

    const kernel = new Kernel()

    this.logger.success('Booting the Console Kernel')

    await kernel.registerCommands()
  }
}
