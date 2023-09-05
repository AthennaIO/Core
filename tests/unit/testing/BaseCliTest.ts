import { ArtisanProvider } from '@athenna/artisan'
import { Test, type Context } from '@athenna/test'
import { BaseCliTest as InternalBaseCliTest } from '@athenna/core/testing/BaseCliTest'

export default class BaseCliTest extends InternalBaseCliTest {
  public artisanPath = Path.bin('artisan.ts')

  @Test()
  public async shouldBeAbleToRunTestsExtendingBaseCliTestClass({ command }: Context) {
    new ArtisanProvider().register()
    const output = await command.run('greet lenon')

    output.assertSucceeded()
    output.assertLogged('HELLO LENON!')
  }
}
