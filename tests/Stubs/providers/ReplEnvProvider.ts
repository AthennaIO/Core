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
    this.container.instance('ReplEnv', 'provided')
  }
}
