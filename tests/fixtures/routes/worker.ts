/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Queue } from '@athenna/queue'

Queue.worker()
  .task()
  .name('worker:task')
  .handler(() => {})
