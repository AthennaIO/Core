/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger as ILogger } from '@athenna/logger'

export const Logger = ioc.safeUse<ILogger>('Athenna/Core/Logger')
