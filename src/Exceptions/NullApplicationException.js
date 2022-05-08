/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NullApplicationException extends Exception {
  constructor() {
    const content = 'The application is null inside this class instance.'

    super(
      content,
      500,
      'E_NULL_APPLICATION',
      `Try calling ({yellow} "Ignite.fire") method to create the instance of the application class.`,
    )
  }
}
