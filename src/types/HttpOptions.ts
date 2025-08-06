/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type HttpOptions = {
  /**
   * Only initialize the server without booting it. Useful when you want to
   * deploy your application in a serverless environment.
   *
   * @default false
   */
  initOnly?: boolean

  /**
   * The host where the server will run. By default Athenna will read the "http.host" config
   * to get this information, but you can set here and subscribe this behavior.
   *
   * @default Config.get('http.host', '127.0.0.1')
   */
  host?: string

  /**
   * The port where the server will run. By default Athenna will read the "http.port" config
   * to get this information, but you can set here and subscribe this behavior.
   *
   * @default Config.get('http.port', 3000)
   */
  port?: number

  /**
   * The path to the http routes.
   *
   * @default Path.routes(`http.${Path.ext()}`)
   */
  routePath?: string

  /**
   * The path to the HttpKernel. The http kernel is responsible to register controllers,
   * all kind of middlewares, plugins and the exception handler for requests. By default,
   * Athenna will use the built in Kernel. But you can do your own implementation
   * extending the "HttpKernel" class from Http and setting the path to it here.
   *
   * @default '@athenna/http/kernels/HttpKernel'
   */
  kernelPath?: string

  /**
   * The path to the exception handler of http server requests. The exception
   * handler is responsible to handle all the exception that are throwed
   * inside route handlers. By default, Athenna will use the built in exception
   * handler. But you can do your own implementation extending the
   * "HttpExceptionHandler" class from Http and setting the path to it here.
   *
   * @default '@athenna/http/handlers/HttpExceptionHandler'
   */
  exceptionHandlerPath?: string
}
