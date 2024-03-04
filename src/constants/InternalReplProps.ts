/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * All node:repl internal properties to remove
 * from list when using ".ls" command.
 */
export const INTERNAL_REPL_PROPS = [
  'global',
  'queueMicrotask',
  'clearImmediate',
  'setImmediate',
  'structuredClone',
  'clearInterval',
  'clearTimeout',
  'setInterval',
  'setTimeout',
  'atob',
  'btoa',
  'performance',
  'fetch',
  'navigator',
  'crypto',
  '__extends',
  '__assign',
  '__rest',
  '__decorate',
  '__param',
  '__metadata',
  '__awaiter',
  '__generator',
  '__exportStar',
  '__createBinding',
  '__values',
  '__read',
  '__spread',
  '__spreadArrays',
  '__spreadArray',
  '__await',
  '__asyncGenerator',
  '__asyncDelegator',
  '__asyncValues',
  '__makeTemplateObject',
  '__importStar',
  '__importDefault',
  '__classPrivateFieldGet',
  '__classPrivateFieldSet',
  '__classPrivateFieldIn'
]
