/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exec, Folder, Path } from '@secjs/utils'
import { ServiceProvider as IocServiceProvider } from '@athenna/ioc'

export class ServiceProvider extends IocServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    const path = Path.services()

    if (!(await Folder.exists(path))) {
      return
    }

    const services = (await new Folder(path).load()).getFilesByPattern(
      '*/**/*.js',
    )

    const promises = services.map(({ href }) => {
      return Exec.getModule(import(href)).then(Service => {
        const alias = `App/Services/${Service.name}`

        this.container.singleton(alias, Service)
      })
    })

    await Promise.all(promises)
  }
}
