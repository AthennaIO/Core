/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

export default class ReplEnvProvider extends ServiceProvider {
  public get environment(): string[] {
    return ['repl']
  }

  public register(): void {
    this.container.instance('ReplEnvRegister', 'provided')
  }

  public boot(): void {
    this.container.instance('ReplEnvBoot', 'provided')
  }

  public shutdown(): void {
    this.container.instance('ReplEnvShutdown', 'provided')
  }
}
