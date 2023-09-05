#!/usr/bin/env node --input-type=module --experimental-import-meta-resolve

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

Config.set('rc.commands', {
  'make:exception': '#src/commands/MakeExceptionCommand',
  'make:facade': '#src/commands/MakeFacadeCommand',
  'make:provider': '#src/commands/MakeProviderCommand',
  'make:service': '#src/commands/MakeServiceCommand',
  'make:test': '#src/commands/MakeTestCommand',
  serve: {
    entrypoint: '#bin/http',
    path: '#src/commands/ServeCommand',
  },
  test: {
    entrypoint: '#bin/test',
    path: '#src/commands/TestCommand',
  },
  repl: {
    entrypoint: '#bin/repl',
    path: '#src/commands/ReplCommand',
  },
  greet: '#tests/stubs/commands/GreetCommand',
})

/*
|--------------------------------------------------------------------------
| Ignite
|--------------------------------------------------------------------------
|
| Here is where your application will bootstrap. Ignite class will be res
| ponsible to bootstrap your application partial or complete. Is not reco
| mmended to bootstrap the Athenna application completely by calling the
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
