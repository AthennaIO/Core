/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@athenna/common'

export class FileHelper {
  /**
   * Get some file content and return the result as JSON.
   *
   * Will only work for files that are valid JSON.
   */
  public static getContentAsJson(path: string) {
    const file = new File(path, Buffer.from(''))

    return JSON.parse(file.getContentSync().toString())
  }
}
