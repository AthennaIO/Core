/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

export default class ConsoleEnvProvider extends ServiceProvider {
  public get environment(): string[] {
    return ['console']
  }

  public register(): void {
    this.container.instance('ConsoleEnvRegister', 'provided')
  }

  public boot(): void {
    this.container.instance('ConsoleEnvBoot', 'provided')
  }

  public shutdown(): void {
    this.container.instance('ConsoleEnvShutdown', 'provided')
  }
}
