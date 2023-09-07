#!/usr/bin/env node

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

process.env.CORE_TESTING = 'true'

Config.set('rc.commands.test', {
  path: '#src/commands/TestCommand',
  entrypoint: '#tests/fixtures/tests/main'
})
Config.set('rc.commands.repl', {
  path: '#src/commands/ReplCommand',
  entrypoint: '#tests/fixtures/bootstrap/repl'
})
Config.set('rc.commands.serve', {
  path: '#src/commands/ServeCommand',
  entrypoint: '#tests/fixtures/bootstrap/main'
})
Config.set('rc.commands.build', {
  path: '#src/commands/BuildCommand',
  tsconfig: './tests/fixtures/tsconfig.json',
  metaFiles: ['app/hello.edge', 'LICENSE.md', '.env']
})

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
| Artisan
|--------------------------------------------------------------------------
|
| Bootstrap the Artisan application setting the Node.js argv and custom op
| tions.
|
*/

await ignite.artisan(process.argv, { displayName: 'Artisan' })
