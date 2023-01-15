/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { Folder, Module } from '@athenna/common'

export class CoreLoader {
  /**
   * Return all commands from artisan console application.
   *
   * @return {any[]}
   */
  static loadCommands() {
    return [
      import('#src/Commands/Repl'),
      import('#src/Commands/Serve'),
      import('#src/Commands/Make/Facade'),
      import('#src/Commands/Make/Service'),
      import('#src/Commands/Make/Provider'),
      import('#src/Commands/Make/Exception'),
      import('#src/Commands/Make/Repository'),
    ]
  }

  /**
   * Return all templates from artisan console application.
   *
   * @return {any[]}
   */
  static loadTemplates() {
    const dirname = Module.createDirname(import.meta.url)
    const templatesPath = join(dirname, '..', '..', 'templates')

    return new Folder(templatesPath).loadSync().getFilesByPattern('**/*.edge')
  }
}
