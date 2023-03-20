/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { HttpExceptionHandler as BaseHttpExceptionHandler } from '@athenna/http'

export class HttpExceptionHandler extends BaseHttpExceptionHandler {
  public constructor() {
    super()

    CALLED_MAP.set(HttpExceptionHandler.name, true)
  }
}
