/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Color, Exception } from '@athenna/common'

export class UndefinedOutDirException extends Exception {
  public constructor() {
    super({
      status: 500,
      code: 'E_SIMPLE_CLI',
      message: `The ${Color.yellow.bold(
        'commands.build.outDir'
      )} setting is not defined in your ${Color.yellow.bold(
        '.athennarc.json'
      )} file. Please define it to continue.`
    })
  }
}
