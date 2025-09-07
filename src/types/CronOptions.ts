/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type CronOptions = {
  /**
   * Force ignite to fire. If running multiple applications, Athenna will
   * fire Ignite only on the first application bootstrap. Use this option
   * if you want to force the Ignite fire for a specific application.
   *
   * @default false
   */
  forceIgniteFire: boolean

  /**
   * The path to the cron routes.
   *
   * @default Path.routes(`cron.${Path.ext()}`)
   */
  routePath?: string

  /**
   * The path to the CronKernel. The cron kernel is responsible to register controllers,
   * all kind of middlewares, plugins and the exception handler. By default,
   * Athenna will use the built in Kernel. But you can do your own implementation
   * extending the "CronKernel" class from Http and setting the path to it here.
   *
   * @default '@athenna/cron/kernels/CronKernel'
   */
  kernelPath?: string

  /**
   * The path to the exception handler of cron schedulers. The exception
   * handler is responsible to handle all the exception that are throwed
   * inside route handlers. By default, Athenna will use the built in exception
   * handler. But you can do your own implementation extending the
   * "CronExceptionHandler" class from Http and setting the path to it here.
   *
   * @default '@athenna/cron/handlers/CronExceptionHandler'
   */
  exceptionHandlerPath?: string
}
