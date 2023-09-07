import { Test, type Context } from '@athenna/test'
import { BaseRestTest as InternalBaseRestTest } from '@athenna/core/testing/BaseRestTest'
import type { HttpOptions } from '#src/index'

export default class BaseRestTest extends InternalBaseRestTest {
  public restOptions: HttpOptions = {
    routePath: Path.fixtures('routes/http.ts')
  }

  @Test()
  public async shouldBeAbleToRunTestsExtendingBaseRestTestClass({ request }: Context) {
    const response = await request.get('/hello')

    response.assertStatusCode(200)
    response.assertBodyContains({ ok: true })
  }
}
