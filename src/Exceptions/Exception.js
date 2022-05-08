/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception as AbstractException } from '@secjs/utils'

export class Exception extends AbstractException {
  /**
   * Creates a new instance of Exception.
   *
   * @param {string} [message]
   * @param {number} [statusCode]
   * @param {string} [code]
   * @param {string} [help]
   */
  constructor(
    message = 'Internal server exception.',
    statusCode = 500,
    code = 'E_RUNTIME',
    help,
  ) {
    super(message, statusCode, code, help)
  }
}
