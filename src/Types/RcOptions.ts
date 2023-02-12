/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface RcOptions {
  version?: boolean
  typescript?: boolean
  isInPackageJson?: boolean
  preloads?: string[]
  providers?: string[]
  commands?: string[]
  commandsManifest?: string[]
}
