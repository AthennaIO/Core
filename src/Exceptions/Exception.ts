/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception as SecException } from '@secjs/utils'

export class Exception extends SecException {
  public constructor(
    message = 'Internal server exception.',
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    help?: string,
  ) {
    super(message, statusCode, code, help)
  }
}
