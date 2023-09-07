/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

export default class HttpAndConsoleEnvProvider extends ServiceProvider {
  public get environment(): string[] {
    return ['http', 'console']
  }

  public register(): void {
    this.container.instance('HttpAndConsoleEnvRegister', 'provided')
  }

  public boot(): void {
    this.container.instance('HttpAndConsoleEnvBoot', 'provided')
  }

  public shutdown(): void {
    this.container.instance('HttpAndConsoleEnvShutdown', 'provided')
  }
}
