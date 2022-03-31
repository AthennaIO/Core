/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@secjs/utils'

export function getAppEnvironment(path: string): string {
  let env = new File(path)
    .loadSync()
    .getContentSync()
    .toString()
    .split('environment:')[1]
    .split(',')[0]
    .trim()

  if (env.includes('process.env.NODE_ENV')) {
    env = env.split('process.env.NODE_ENV')[1].replace('/||/g', '').trim()
  }

  return process.env.NODE_ENV || env
}
