/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

export default class HttpEnvProvider extends ServiceProvider {
  public get environment(): string[] {
    return ['http']
  }

  public register(): void {
    this.container.instance('HttpEnvRegister', 'provided')
  }

  public boot(): void {
    this.container.instance('HttpEnvBoot', 'provided')
  }

  public shutdown(): void {
    this.container.instance('HttpEnvShutdown', 'provided')
  }
}
