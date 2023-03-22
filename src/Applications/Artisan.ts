/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { ArtisanImpl } from '@athenna/artisan'
import { Module, Options } from '@athenna/common'
import { ArtisanOptions } from '#src/Types/ArtisanOptions'

export class Artisan {
  /**
   * Load the necessary stuff before booting Artisan.
   */
  public static async load() {
    const { ViewProvider } = await import('@athenna/view')
    const { ArtisanProvider } = await import('@athenna/artisan')

    new ViewProvider().register()
    new ArtisanProvider().register()
  }

  /**
   * Boot the Artisan application and execute the commands of argv.
   */
  public static async boot(
    argv: string[],
    options?: ArtisanOptions,
  ): Promise<ArtisanImpl> {
    options = Options.create(options, {
      displayName: null,
      routePath: Path.routes(`console.${Path.ext()}`),
      kernelPath: Path.originalPwd(
        'node_modules/@athenna/artisan/src/Kernels/ConsoleKernel.js',
      ),
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
      Config.get('rc.meta'),
    )

    const kernel = new Kernel()

    await kernel.registerExceptionHandler(options.exceptionHandlerPath)
    await kernel.registerCommands(argv)
    await kernel.registerRouteCommands(options.routePath)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`,
      )
    }
  }
}
