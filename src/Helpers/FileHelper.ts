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
  public static getContentAsJson(path: string): Record<string, any> {
    const file = new File(path, Buffer.from(''))

    if (!file.fileExists) {
      return null
    }

    const json = file.getContentSync().toString()

    if (json.replace(/ /g, '').replace(/\n/g, '') === '') {
      return {}
    }

    return JSON.parse(json)
  }

  /**
   * Get the content of some file as JSON.
   */
  public static getContentOfFile(file: File): Record<string, any> {
    if (!file.fileExists) {
      return {}
    }

    const json = file.getContentSync().toString()

    if (json.replace(/ /g, '').replace(/\n/g, '') === '') {
      return {}
    }

    return JSON.parse(json)
  }
}
