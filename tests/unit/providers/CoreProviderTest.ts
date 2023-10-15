/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CoreProvider } from '#src'
import { Test, type Context, AfterEach, BeforeEach } from '@athenna/test'

export default class CoreProviderTest {
  @BeforeEach()
  public async beforeEach() {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + '/'))
  }

  @AfterEach()
  public async afterEach() {
    ioc.reconstruct()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToRegisterServicesWithCoreProvider({ assert }: Context) {
    Config.set('rc.services', ['#tests/fixtures/services/ExportService'])

    await new CoreProvider().register()

    assert.isTrue(ioc.has('exportService'))
    assert.isTrue(ioc.has('App/Services/ExportService'))
  }

  @Test()
  public async shouldBeAbleToRegisterExportDefaultServicesWithCoreProvider({ assert }: Context) {
    Config.set('rc.services', ['#tests/fixtures/services/ExportDefaultService'])

    await new CoreProvider().register()

    assert.isTrue(ioc.has('exportDefaultService'))
    assert.isTrue(ioc.has('App/Services/ExportDefaultService'))
  }

  @Test()
  public async shouldBeAbleToRegisterAnnotatedServicesWithCoreProvider({ assert }: Context) {
    Config.set('rc.services', ['#tests/fixtures/services/AnnotatedService'])

    await new CoreProvider().register()

    assert.isTrue(ioc.has('annotated'))
    assert.isTrue(ioc.has('fixtures/annotated'))
  }

  @Test()
  public async shouldBeAbleToRegisterAnnotatedServicesWithoutConfigWithCoreProvider({ assert }: Context) {
    Config.set('rc.services', ['#tests/fixtures/services/AnnotatedZeroService'])

    await new CoreProvider().register()

    assert.isTrue(ioc.has('annotatedZeroService'))
    assert.isTrue(ioc.has('App/Services/AnnotatedZeroService'))
  }

  @Test()
  public async shouldBeAbleToRegisterServicesUsingAbsolutePathWithCoreProvider({ assert }: Context) {
    Config.set('rc.services', [Path.fixtures('services/ExportService.ts')])

    await new CoreProvider().register()

    assert.isTrue(ioc.has('exportService'))
    assert.isTrue(ioc.has('App/Services/ExportService'))
  }

  @Test()
  public async shouldBeAbleToRegisterServicesUsingRelativePathWithCoreProvider({ assert }: Context) {
    Config.set('rc.services', ['./tests/fixtures/services/ExportService.ts'])

    await new CoreProvider().register()

    assert.isTrue(ioc.has('exportService'))
    assert.isTrue(ioc.has('App/Services/ExportService'))
  }
}
