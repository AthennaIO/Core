/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Exec, Module } from '@athenna/common'
import { ServiceProvider } from '@athenna/ioc'

export class CoreProvider extends ServiceProvider {
  public async register() {
    const services = Config.get<string[]>('rc.services', [])

    await Exec.concurrently(services, async path => {
      const Service = await Module.resolve(
        `${path}?version=${Math.random()}`,
        Config.get('rc.meta'),
      )

      if (Reflect.hasMetadata('provider:registered', Service)) {
        return
      }

      const createCamelAlias = true
      const alias = `App/Services/${Service.name}`

      ioc.bind(alias, Service, createCamelAlias)
    })
  }
}
