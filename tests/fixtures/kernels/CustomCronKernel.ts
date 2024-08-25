/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { CronKernel } from '@athenna/cron'

Log.info('importing CustomCronKernel')

export class CustomCronKernel extends CronKernel {}
