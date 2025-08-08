/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Worker, type Context } from '@athenna/queue'

@Worker()
export class HelloWorker {
  public async handle(ctx: Context) {
    console.log(ctx)
  }
}
