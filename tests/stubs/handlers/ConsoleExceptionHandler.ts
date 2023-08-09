/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CALLED_MAP } from '#tests/helpers/CalledMap'
import { ConsoleExceptionHandler as BaseConsoleExceptionHandler } from '@athenna/artisan'

export class ConsoleExceptionHandler extends BaseConsoleExceptionHandler {
  public constructor() {
    super()

    CALLED_MAP.set(ConsoleExceptionHandler.name, true)
  }
}
