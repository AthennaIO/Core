/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class AlreadyBootedException extends Exception {
  public constructor(resource: string) {
    const content = `The resource "${resource}" is already booted.`

    super(
      content,
      500,
      'ALREADY_BOOTED_ERROR',
      `Try calling "shutdown${resource}" method to shutdown this resource`,
    )
  }
}
