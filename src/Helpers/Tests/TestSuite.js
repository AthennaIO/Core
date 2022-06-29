import { Assert } from '@japa/assert'
import { TestContext } from '@japa/runner'
import { Ignite, TestRequest } from '#src/index'

export class TestSuite {
  static unitSuite(suite) {
    suite.setup(async () => {
      const application = await new Ignite().fire()

      TestContext.macro('request', () => {})
      TestContext.macro('application', application)

      return () => {}
    })
  }

  static cliEnd2EndSuite(suite) {
    suite.setup(async () => {
      const application = await new Ignite().fire()

      await application.bootArtisan()

      TestContext.macro('application', application)

      return async () => {}
    })
  }

  static httpEnd2EndSuite(suite) {
    suite.setup(async () => {
      const application = await new Ignite().fire()

      await application.bootHttpServer()

      TestContext.macro('request', new TestRequest(new Assert()))
      TestContext.macro('application', application)

      return async () => await application.shutdownHttpServer()
    })
  }
}
