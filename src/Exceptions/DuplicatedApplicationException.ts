/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class DuplicatedApplicationException extends Exception {
  public constructor() {
    const content =
      'An instance of application class has already been created inside this class.'

    super(
      content,
      500,
      'DUPLICATED_APPLICATION_ERROR',
      `Try calling "getApplication" method to get the instance of the application class.`,
    )
  }
}
