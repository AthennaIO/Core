/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Service } from '@athenna/ioc'

@Service({ alias: 'fixtures/annotated', camelAlias: 'annotated', type: 'transient' })
export class AnnotatedService {}
