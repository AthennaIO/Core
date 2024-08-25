/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Scheduler, type Context } from '@athenna/cron'

@Scheduler({ pattern: '* * * * *' })
export class HelloScheduler {
  public async handle(ctx: Context) {
    console.log(ctx)
  }
}
