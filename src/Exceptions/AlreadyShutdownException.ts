/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class AlreadyShutdownException extends Exception {
  public constructor(resource: string) {
    const content = `The resource "${resource}" is already shutdown.`

    super(
      content,
      500,
      'ALREADY_SHUTDOWN_ERROR',
      `Try calling "boot${resource}" method to boot this resource`,
    )
  }
}
