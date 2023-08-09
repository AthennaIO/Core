/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Options } from '@athenna/common'
import type { ServiceOptions } from '#src/types/ServiceOptions'

/**
 * Create a service inside the service provider.
 */
export function Service(options?: ServiceOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      alias: `App/Services/${target.name}`,
      type: 'transient',
    })

    const alias = options.alias
    const createCamelAlias = true

    if (ioc.hasDependency(alias)) {
      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    Reflect.defineMetadata('provider:registered', true, target)
  }
}
