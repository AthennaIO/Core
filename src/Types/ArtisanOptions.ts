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
  displayName: string

  /**
   * The path to the console routes. Artisan is the only application that
   * loads the routes before application bootstrap. This behavior was implemented
   * because the "rc.preloads" files are loaded only after the providers. This means
   * that the entire application needs to be bootstrapped to register the preload files.
   *
   * Artisan does not need all the application to bootstrap to run.
   */
  routePath: string

  /**
   * The path to the ConsoleKernel. The console kernel is responsible to
   * register the exception handler, register the commands or register a single
   * command by it's path if exists inside "rc.commandsManifest". By default,
   * Athenna will use the built in Kernel. But you can do your own implementation
   * extending the "ConsoleKernel" class from Artisan and setting the path to it
   * here.
   *
   * @default Path.nodeModules('@athenna/artisan/build/Kernels/ConsoleKernel.js')
   */
  kernelPath: string

  /**
   * The path to the exception handler of console commands. The exception
   * handler is responsible to handle all the exception that are throwed
   * in Artisan commands. By default, Athenna will use the built in exception
   * handler. But you can do your own implementantion extending the
   * "ConsoleExceptionHandler" class from Artisan and setting the path to it
   * here.
   *
   * @default Path.nodeModules('@athenna/artisan/build/Handlers/ConsoleExceptionHandler.js')
   */
  exceptionHandlerPath: string
}
