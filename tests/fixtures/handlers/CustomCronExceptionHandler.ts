/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { ConsoleExceptionHandler } from '@athenna/artisan'

Log.info('importing CustomCronExceptionHandler')

export class CustomCronExceptionHandler extends ConsoleExceptionHandler {}
