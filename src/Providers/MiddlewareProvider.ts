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

export class MiddlewareProvider extends ServiceProvider {
  boot(): void {
    const middlewares = new Folder(Path.app('Http/Middlewares'))
      .loadSync()
      // Get all .js and .ts files but not the .d.ts.
      .getFilesByPattern('!(*.d)*.*(js|ts)')

    middlewares.forEach(File => {
      this.container.bind(
        `App/Middlewares/${File.name}`,
        ResolveClassExport.resolve(require(File.path)),
      )
    })
  }

  register(): void {}
}
