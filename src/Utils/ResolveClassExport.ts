/**
 * @secjs/core
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'

export class ResolveClassExport {
  static resolve(module: any) {
    if (Is.Class(module)) {
      return module
    }

    if (Is.Object(module) && !module.default) {
      const firstProviderKey = Object.keys(module)[0]

      return module[firstProviderKey]
    }

    return module.default()
  }
}
