/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Folder, Path } from '@secjs/utils'
import { ServiceProvider } from '@athenna/ioc'
import { ResolveClassExport } from 'src/Utils/ResolveClassExport'

export class ControllerProvider extends ServiceProvider {
  boot(): void {
    const controllers = new Folder(Path.app('Http/Controllers'))
      .loadSync()
      // Get all .js and .ts files but not the .d.ts.
      .getFilesByPattern('!(*.d)*.*(js|ts)')

    controllers.forEach(File => {
      this.container.bind(
        `App/Controllers/${File.name}`,
        ResolveClassExport.resolve(require(File.path)),
      )
    })
  }

  register(): void {}
}
