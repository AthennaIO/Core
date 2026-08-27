/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Color, Exception } from '@athenna/common'

export class NotInstalledEslintException extends Exception {
  public constructor() {
    super({
      status: 500,
      code: 'E_SIMPLE_CLI',
      /**
       * The "E_SIMPLE_CLI" code makes the console handler render the message
       * alone, so the instruction has to live in it instead of in "help".
       */
      message: `The ${Color.yellow.bold(
        'eslint'
      )} package could not be resolved from your application. Run ${Color.yellow.bold(
        'npm i -D eslint'
      )} to be able to use the ${Color.yellow.bold('lint')} command.`
    })
  }
}
