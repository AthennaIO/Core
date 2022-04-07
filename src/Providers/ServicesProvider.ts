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

export class ServicesProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return void
   */
  public async boot(): Promise<void> {
    let services = getAppFiles(Path.app('Services'))
    services = await Promise.all(services.map(File => import(File.path)))

    services.forEach(Module => {
      const Service = ResolveClassExport.resolve(Module)
      this.container.bind(`App/Services/${Service.name}`, Service)
    })
  }
}
