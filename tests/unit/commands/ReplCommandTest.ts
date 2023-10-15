/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class ReplCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToExecuteReplCommand({ command }: Context) {
    const output = await command.run('repl')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/repl!')
  }

  @Test()
  public async shouldBeAbleToExecuteReplCommandWithADifferentEnv({ command }: Context) {
    const output = await command.run('repl --env=test-hello')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/repl!')
    output.assertLogged('test-hello\ntest-hello')
  }

  @Test()
  public async shouldBeAbleToExecuteReplCommandUsingAImportAliasPathEntry({ command }: Context) {
    const output = await command.run('repl', {
      path: Path.fixtures('consoles/import-alias-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/repl!')
  }

  @Test()
  public async shouldBeAbleToExecuteReplCommandUsingAnAbsolutePathEntry({ command }: Context) {
    const output = await command.run('repl', {
      path: Path.fixtures('consoles/absolute-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/repl!')
  }

  @Test()
  public async shouldBeAbleToExecuteReplCommandUsingARelativePathEntry({ command }: Context) {
    const output = await command.run('repl', {
      path: Path.fixtures('consoles/relative-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/repl!')
  }
}
