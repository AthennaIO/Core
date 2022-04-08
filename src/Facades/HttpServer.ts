/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from 'src/Facade'
import { Http } from '@athenna/http'

export const HttpServer = Facade.createFor<Http>('Athenna/Core/HttpServer')
