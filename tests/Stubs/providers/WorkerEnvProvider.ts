/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

export default class WorkerEnvProvider extends ServiceProvider {
  public get environment(): string[] {
    return ['worker']
  }

  public register(): void {
    this.container.instance('WorkerEnvRegister', 'provided')
  }

  public boot(): void {
    this.container.instance('WorkerEnvBoot', 'provided')
  }

  public shutdown(): void {
    this.container.instance('WorkerEnvShutdown', 'provided')
  }
}
