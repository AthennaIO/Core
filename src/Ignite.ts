/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Importing global file to add Env function
 * and Config class to global module of Node.js
 */
import '@athenna/config/src/Utils/global'

import { Http } from '@athenna/http'
import { AthennaFactory } from 'src/Factories/AthennaFactory'

export class Ignite {
  private athennaFactory: AthennaFactory

  public constructor(fileName: string) {
    this.athennaFactory = new AthennaFactory(fileName)
  }

  // TODO
  // worker() {}
  // TODO
  // command() {}

  httpServer(): Http {
    return this.athennaFactory.http()
  }
}
