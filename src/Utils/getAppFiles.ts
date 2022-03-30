/**
 * @secjs/core
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { existsSync } from 'fs'
import { File, Folder } from '@secjs/utils'

export function getAppFiles(path: string): File[] {
  if (!existsSync(path)) return []

  return (
    new Folder(path)
      .loadSync()
      // Get all .js and .ts files but not the .d.ts.
      .getFilesByPattern('!(*.d)*.*(js|ts)')
  )
}
