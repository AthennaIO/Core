/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { ServiceProvider } from '@athenna/ioc'

export class CoreProvider extends ServiceProvider {
  public async register() {
    const services = Config.get<string[]>('rc.services', [])

    await ioc.loadModules(services, {
      addCamelAlias: true,
      metaUrl: Config.get('rc.meta')
    })
  }
}
