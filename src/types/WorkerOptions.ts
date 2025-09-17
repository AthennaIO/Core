/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type WorkerOptions = {
  /**
   * Force ignite to fire. If running multiple applications, Athenna will
   * fire Ignite only on the first application bootstrap. Use this option
   * if you want to force the Ignite fire for a specific application.
   *
   * @default false
   */
  forceIgniteFire?: boolean

  /**
   * The path to the worker routes.
   *
   * @default Path.routes(`worker.${Path.ext()}`)
   */
  routePath?: string

  /**
   * The path to the WorkerKernel. The worker kernel is responsible to register controllers,
   * all kind of middlewares, plugins and the exception handler. By default,
   * Athenna will use the built in Kernel. But you can do your own implementation
   * extending the "WorkerKernel" class from Http and setting the path to it here.
   *
   * @default '@athenna/queue/kernels/WorkerKernel'
   */
  kernelPath?: string
}
