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

export default class MakeProviderCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAProviderFile({ assert, command }: Context) {
    const output = await command.run('make:provider TestProvider')

    output.assertSucceeded()
    output.assertLogged('[ MAKING PROVIDER ]')
    output.assertLogged('[  success  ] Provider "TestProvider" successfully created.')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.providers('TestProvider.ts')))
    assert.containsSubset(athenna.providers, ['#providers/TestProvider'])
  }

  @Test()
  public async shouldBeAbleToCreateAProviderFileWithADifferentDestPath({ assert, command }: Context) {
    const output = await command.run('make:provider TestProvider', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING PROVIDER ]')
    output.assertLogged('[  success  ] Provider "TestProvider" successfully created.')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/providers/TestProvider.ts')))
    assert.containsSubset(athenna.providers, ['#tests/fixtures/storage/providers/TestProvider'])
  }

  @Test()
  public async shouldThrowAnProviderWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:provider TestProvider')
    const output = await command.run('make:provider TestProvider')

    output.assertFailed()
    output.assertLogged('[ MAKING PROVIDER ]')
    output.assertLogged('The file')
    output.assertLogged('TestProvider.ts')
    output.assertLogged('already exists')
  }
}
