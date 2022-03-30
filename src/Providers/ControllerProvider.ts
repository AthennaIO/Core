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

export class ControllerProvider extends ServiceProvider {
  boot(): void {
    const controllers = getAppFiles(Path.app('Http/Controllers'))

    controllers.forEach(File => {
      this.container.bind(
        `App/Controllers/${File.name}`,
        ResolveClassExport.resolve(require(File.path)),
      )
    })
  }

  register(): void {}
}
