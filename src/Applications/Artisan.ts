/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { Module, Options } from '@athenna/common'
import { ArtisanOptions } from '#src/Types/ArtisanOptions'

export class Artisan {
  /**
   * Boot the Artisan application and execute the commands of argv.
   */
  public async boot(argv: string[], options?: ArtisanOptions) {
    options = Options.create(options, {
      displayName: 'Artisan',
      routePath: Path.routes(`console.${Path.ext()}`),
      kernelPath: Path.nodeModules(
        '@athenna/artisan/build/Kernels/ConsoleKernel.js',
      ),
      exceptionHandlerPath: Path.nodeModules(
        '@athenna/artisan/build/Handlers/ConsoleExceptionHandler.js',
      ),
    })

    const artisan = ioc.safeUse('Athenna/Core/Artisan')

    await this.resolveConsoleKernel(argv, options)

    return artisan.parse(argv, options.displayName)
  }

  /**
   * Resolve the console kernel by importing it and calling the methods to register
   * commands and console exception handler.
   */
  private async resolveConsoleKernel(argv: string[], options?: ArtisanOptions) {
    const Kernel = await Module.getFrom(options.kernelPath)

    const kernel = new Kernel()

    Log.channelOrVanilla('application').success(`Booting kernel ${Kernel.name}`)

    await kernel.registerCommands(argv)
    await kernel.registerRouteCommands(options.routePath)
    await kernel.registerExceptionHandler(options.exceptionHandlerPath)
  }
}
