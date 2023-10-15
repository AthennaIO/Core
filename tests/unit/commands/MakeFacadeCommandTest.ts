/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeFacadeCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAFacadeFile({ assert, command }: Context) {
    const output = await command.run('make:facade TestFacade')

    output.assertSucceeded()
    output.assertLogged('[ MAKING FACADE ]')
    output.assertLogged('[  success  ] Facade "TestFacade" successfully created.')

    assert.isTrue(await File.exists(Path.facades('TestFacade.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateAFacadeFileWithADifferentDestPath({ assert, command }: Context) {
    const output = await command.run('make:facade TestFacade', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING FACADE ]')
    output.assertLogged('[  success  ] Facade "TestFacade" successfully created.')

    assert.isTrue(await File.exists(Path.fixtures('storage/facades/TestFacade.ts')))
  }

  @Test()
  public async shouldThrowAnFacadeWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:facade TestFacade')
    const output = await command.run('make:facade TestFacade')

    output.assertFailed()
    output.assertLogged('[ MAKING FACADE ]')
    output.assertLogged('The file')
    output.assertLogged('TestFacade.ts')
    output.assertLogged('already exists')
  }
}
