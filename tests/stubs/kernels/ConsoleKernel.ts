/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CALLED_MAP } from '#tests/helpers/CalledMap'
import { ConsoleKernel as BaseConsoleKernel } from '@athenna/artisan'

export class ConsoleKernel extends BaseConsoleKernel {
  public constructor() {
    super()

    CALLED_MAP.set(ConsoleKernel.name, true)
  }
}
