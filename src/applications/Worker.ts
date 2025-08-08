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
import type { WorkerImpl } from '@athenna/queue'
import { Path, Module, Options } from '@athenna/common'
import type { CronOptions } from '#src/types/CronOptions'

export class Worker {
  /**
   * Boot the Worker application.
   */
  public static async boot(options?: CronOptions): Promise<WorkerImpl> {
    options = Options.create(options, {
      routePath: Config.get(
        'rc.worker.route',
        Path.routes(`worker.${Path.ext()}`)
      ),
      kernelPath: Config.get(
        'rc.worker.kernel',
        '@athenna/queue/kernels/WorkerKernel'
      )
    })

    const worker = ioc.safeUse('Athenna/Core/Worker')

    debug('booting worker application with options %o', options)

    await this.resolveKernel(options)

    if (Config.notExists('rc.bootLogs') || Config.is('rc.bootLogs', false)) {
      return worker
    }

    Log.channelOrVanilla('application').success(
      `Worker application successfully started`
    )

    await worker.start()

    return worker
  }

  /**
   * Resolve the kernel by importing it and calling the methods to register
   * worker tasks and plugins.
   */
  private static async resolveKernel(options?: CronOptions) {
    const Kernel = await Module.resolve(
      options.kernelPath,
      Config.get('rc.parentURL')
    )

    const kernel = new Kernel()

    await kernel.registerLogger()
    await kernel.registerRTracer()
    await kernel.registerWorkers()
    await kernel.registerRoutes(options.routePath)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Kernel ({yellow} ${Kernel.name}) successfully booted`
      )
    }
  }
}
