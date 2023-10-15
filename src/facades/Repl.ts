/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import type { ReplImpl } from '#src/repl/ReplImpl'

export const Repl = Facade.createFor<ReplImpl>('Athenna/Core/Repl')
