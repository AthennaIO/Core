/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite } from '#src'

/*
|--------------------------------------------------------------------------
| Core testing
|--------------------------------------------------------------------------
|
| This property helps the @athenna/core package to test the implementation
| of the Ignite class. With this env as "true", Athenna will not resolve
| the application root path because the package is not inside a node_modu
| les folder when running locally and in pipelines.
|
*/

process.env.CORE_TESTING = 'false'

/*
|--------------------------------------------------------------------------
| Ignite
|--------------------------------------------------------------------------
|
| Here is where your application will bootstrap. Ignite class will be res
| ponsible to bootstrap your application partial or complete. Is not reco
| mmended to bootstrap the Athenna application completelly by calling the
| "fire" method, you should always let the type of application determine if
| the application should be fully bootstrapped or not.
|
*/

const ignite = await new Ignite().load(import.meta.url, { bootLogs: false })

/*
|--------------------------------------------------------------------------
| REPL Session
|--------------------------------------------------------------------------
|
| Bootstrap the repl application.
|
*/

await ignite.repl()
