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
   * The host where the server will run. By default Athenna will read the "http.host" config
   * to get this information, but you can set here and subscribe this behavior.
   *
   * @default Config.get('http.host', 'localhost')
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
   * The path to the HttpKernel. The http kernel is responsible to register controllers,
   * all kind of middlewares, plugins and the exception handler for requests. By default,
   * Athenna will use the built in Kernel. But you can do your own implementation
   * extending the "HttpKernel" class from Http and setting the path to it here.
   *
   * @default Path.nodeModules('@athenna/http/build/Kernels/HttpKernel.js')
   */
  kernelPath?: string

  /**
   * The path to the exception handler of http server requests. The exception
   * handler is responsible to handle all the exception that are throwed
   * inside route handlers. By default, Athenna will use the built in exception
   * handler. But you can do your own implementantion extending the
   * "HttpExceptionHandler" class from Http and setting the path to it here.
   *
   * @default Path.nodeModules('@athenna/http/build/Handlers/HttpExceptionHandler.js')
   */
  exceptionHandlerPath?: string
}
