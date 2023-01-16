/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@athenna/common'

export class PreloadHelper {
  /**
   * Preload a file by importing it.
   *
   * @param filePath {string}
   * @return {Promise<void>}
   */
  static async preload(filePath) {
    if (!(await File.exists(filePath))) {
      return
    }

    const { href } = new File(filePath)

    return import(href)
  }
}
