/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type ArtisanOptions = {
  /**
   * The display name that should be rendered when calling just "node artisan"
   * command.
   *
   * @default Artisan
   */
  displayName?: string

  /**
   * The path to the console routes.
   *
   * @default Path.routes(`console.${Path.ext()}`)
   */
  routePath?: string

  /**
   * The path to the ConsoleKernel. The console kernel is responsible to
   * register the exception handler, register the commands or register a single
   * command by it's path if exists inside "rc.commandsManifest". By default,
   * Athenna will use the built in Kernel. But you can do your own implementation
   * extending the "ConsoleKernel" class from Artisan and setting the path to it
   * here.
   *
   * @default '@athenna/artisan/kernels/ConsoleKernel'
   */
  kernelPath?: string

  /**
   * The path to the exception handler of console commands. The exception
   * handler is responsible to handle all the exception that are throwed
   * in Artisan commands. By default, Athenna will use the built in exception
   * handler. But you can do your own implementantion extending the
   * "ConsoleExceptionHandler" class from Artisan and setting the path to it
   * here.
   *
   * @default '@athenna/artisan/handlers/ConsoleExceptionHandler'
   */
  exceptionHandlerPath?: string
}
