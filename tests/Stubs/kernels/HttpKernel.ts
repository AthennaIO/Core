/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { HttpKernel as BaseHttpKernel } from '@athenna/http'

export class HttpKernel extends BaseHttpKernel {
  public constructor() {
    super()

    CALLED_MAP.set(HttpKernel.name, true)
  }
}
