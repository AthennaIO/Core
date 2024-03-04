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
import type { ArtisanImpl } from '@athenna/artisan'
import { Path, Module, Options } from '@athenna/common'
import type { ConsoleOptions } from '#src/types/ConsoleOptions'

export class Console {
  /**
   * Boot the Artisan application and execute the commands of argv.
   */
  public static async boot(
    argv: string[],
    options?: ConsoleOptions
  ): Promise<ArtisanImpl> {
    options = Options.create(options, {
      displayName: null,
      routePath: Path.routes(`console.${Path.ext()}`),
      kernelPath: '@athenna/artisan/kernels/ConsoleKernel'
    })

    const artisan = ioc.safeUse('Athenna/Core/Artisan')

    debug(
      'booting console application with argv %o and options %o',
      argv,
      options
    )

    await this.resolveKernel(argv, options)
    await artisan.parse(argv, options.displayName)

    return artisan
  }

  /**
   * Resolve the kernel by importing it and calling the methods to register
   * commands, routes and console exception handler.
   */
  private static async resolveKernel(argv: string[], options?: ConsoleOptions) {
    const Kernel = await Module.resolve(
      options.kernelPath,
      Config.get('rc.parentURL')
    )

    const kernel = new Kernel()

    await kernel.registerExceptionHandler(options.exceptionHandlerPath)
    await kernel.registerCommands(argv)
    await kernel.registerRouteCommands(options.routePath)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`
      )
    }
  }
}
