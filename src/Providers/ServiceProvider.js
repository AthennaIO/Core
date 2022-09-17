/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, Path } from '@secjs/utils'
import { ServiceProvider as IocServiceProvider } from '@athenna/ioc'

export class ServiceProvider extends IocServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    const path = Path.services()
    const subAlias = 'App/Services'

    const services = await Module.getAllFromWithAlias(path, subAlias)

    services.forEach(({ alias, module }) => {
      this.container.singleton(alias, module, true)
    })
  }
}
