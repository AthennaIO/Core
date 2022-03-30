/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@secjs/utils'
import { ServiceProvider } from '@athenna/ioc'
import { getAppFiles } from 'src/Utils/getAppFiles'
import { ResolveClassExport } from 'src/Utils/ResolveClassExport'

export class MiddlewareProvider extends ServiceProvider {
  boot(): void {
    const middlewares = getAppFiles(Path.app('Http/Middlewares'))

    middlewares.forEach(File => {
      this.container.bind(
        `App/Middlewares/${File.name}`,
        ResolveClassExport.resolve(require(File.path)),
      )
    })
  }

  register(): void {}
}
