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
import type { ArtisanImpl } from '@athenna/artisan'
import type { ArtisanOptions } from '#src/types/ArtisanOptions'

export class Artisan {
  /**
   * Boot the Artisan application and execute the commands of argv.
   */
  public static async boot(
    argv: string[],
    options?: ArtisanOptions
  ): Promise<ArtisanImpl> {
    options = Options.create(options, {
      displayName: null,
      routePath: Path.routes(`console.${Path.ext()}`),
      kernelPath: '@athenna/artisan/kernels/ConsoleKernel'
    })

    const artisan = ioc.safeUse('Athenna/Core/Artisan')

    await this.resolveKernel(argv, options)
    await artisan.parse(argv, options.displayName)

    return artisan
  }

  /**
   * Resolve the kernel by importing it and calling the methods to register
   * commands, routes and console exception handler.
   */
  private static async resolveKernel(argv: string[], options?: ArtisanOptions) {
    const Kernel = await Module.resolve(
      options.kernelPath,
      Config.get('rc.meta')
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
