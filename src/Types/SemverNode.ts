/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type SemverNode = {
  major: number
  minor: number
  patch: number
  prerelease: (string | number)[]
  version: string
  toString(): string
}
