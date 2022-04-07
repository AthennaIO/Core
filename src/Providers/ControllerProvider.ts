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
  /**
   * Bootstrap any application services.
   *
   * @return void
   */
  public async boot(): Promise<void> {
    let controllers = getAppFiles(Path.app('Http/Controllers'))
    controllers = await Promise.all(controllers.map(File => import(File.path)))

    controllers.forEach(Module => {
      const Controller = ResolveClassExport.resolve(Module)
      this.container.bind(`App/Controllers/${Controller.name}`, Controller)
    })
  }
}
