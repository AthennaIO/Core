/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotSatisfiedNodeVersion extends Exception {
  public constructor(nodeVersion: string, nodeEngineVersion: string) {
    super({
      status: 500,
      message: `The installed Node.js version "${nodeVersion}" does not satisfy the expected version "${nodeEngineVersion}" defined inside package.json file`,
      help: `Try upgrading your Node.js version to the engine specified ${nodeEngineVersion}. You can go to the Node.js download page (https://nodejs.org/en/download/) or use NVM (https://github.com/nvm-sh/nvm) to update your version.`
    })
  }
}
