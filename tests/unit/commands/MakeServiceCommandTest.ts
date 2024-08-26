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

export default class MakeServiceCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAServiceFile({ assert, command }: Context) {
    const output = await command.run('make:service TestService')

    output.assertSucceeded()
    output.assertLogged('[ MAKING SERVICE ]')
    output.assertLogged('[  success  ] Service "TestService" successfully created.')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.services('TestService.ts')))
    assert.containsSubset(athenna.services, ['#src/services/TestService'])
  }

  @Test()
  public async shouldBeAbleToCreateAServiceFileWithADifferentDestPath({ assert, command }: Context) {
    const output = await command.run('make:service TestService', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING SERVICE ]')
    output.assertLogged('[  success  ] Service "TestService" successfully created.')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/services/TestService.ts')))
    assert.containsSubset(athenna.services, ['#tests/fixtures/storage/services/TestService'])
  }

  @Test()
  public async shouldThrowAnServiceWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:service TestService')
    const output = await command.run('make:service TestService')

    output.assertFailed()
    output.assertLogged('[ MAKING SERVICE ]')
    output.assertLogged('The file')
    output.assertLogged('TestService.ts')
    output.assertLogged('already exists')
  }
}
