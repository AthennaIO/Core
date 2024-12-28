/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class ServeCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToExecuteServeCommand({ command }: Context) {
    const output = await command.run('serve')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandUsingAImportAliasPathEntry({ command }: Context) {
    const output = await command.run('serve', {
      path: Path.fixtures('consoles/import-alias-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandUsingAnAbsolutePathEntry({ command }: Context) {
    const output = await command.run('serve', {
      path: Path.fixtures('consoles/absolute-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandUsingARelativePathEntry({ command }: Context) {
    const output = await command.run('serve', {
      path: Path.fixtures('consoles/relative-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandInWatchMode({ command }: Context) {
    const output = await command.run('serve --watch', {
      path: Path.fixtures('consoles/watch-mode.ts')
    })

    output.assertSucceeded()
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandInWatchModeWithLogs({ command }: Context) {
    const output = await command.run('serve --watch', {
      path: Path.fixtures('consoles/watch-mode-logs.ts')
    })

    output.assertSucceeded()
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandWithVite({ command }: Context) {
    const output = await command.run('serve --vite', {
      path: Path.fixtures('consoles/serve-vite.ts')
    })

    output.assertSucceeded()
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandWithViteWithLogs({ command }: Context) {
    const output = await command.run('serve --vite', {
      path: Path.fixtures('consoles/serve-vite-with-logs.ts')
    })

    output.assertSucceeded()
  }
}
