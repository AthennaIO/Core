/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { ReplImpl } from '#src/repl/ReplImpl'
import { ServiceProvider } from '@athenna/ioc'

export class ReplProvider extends ServiceProvider {
  public async register() {
    this.container.singleton('Athenna/Core/Repl', ReplImpl)
  }
}
