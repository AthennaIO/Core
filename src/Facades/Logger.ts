/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from 'src/Facade'
import { Logger as ILogger } from '@athenna/logger'

export const Logger = Facade.createFor<ILogger>('Athenna/Core/Logger')
