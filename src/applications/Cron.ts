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
import type { CronImpl } from '@athenna/cron'
import { Path, Module, Options } from '@athenna/common'
import type { CronOptions } from '#src/types/CronOptions'

export class Cron {
  /**
   * Boot the Cron application.
   */
  public static async boot(options?: CronOptions): Promise<CronImpl> {
    options = Options.create(options, {
      routePath: Config.get('rc.cron.route', Path.routes(`cron.${Path.ext()}`)),
      kernelPath: Config.get(
        'rc.cron.kernel',
        '@athenna/cron/kernels/CronKernel'
      )
    })

    const cron = ioc.safeUse('Athenna/Core/Cron')

    debug('booting cron application with options %o', options)

    await this.resolveKernel(options)

    if (Config.notExists('rc.bootLogs') || Config.is('rc.bootLogs', false)) {
      return cron
    }

    Log.channelOrVanilla('application').success(
      `Cron application successfully started`
    )

    return cron
  }

  /**
   * Resolve the kernel by importing it and calling the methods to register
   * schedulers, plugins and exception handler.
   */
  private static async resolveKernel(options?: CronOptions) {
    const Kernel = await Module.resolve(
      options.kernelPath,
      Config.get('rc.parentURL')
    )

    const kernel = new Kernel()

    await kernel.registerLogger()
    await kernel.registerRTracer()
    await kernel.registerExceptionHandler(options.exceptionHandlerPath)
    await kernel.registerSchedulers()
    await kernel.registerRoutes(options.routePath)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`
      )
    }
  }
}
