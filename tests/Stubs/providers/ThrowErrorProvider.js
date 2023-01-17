import { ServiceProvider } from '@athenna/ioc'
import { PrettyException } from '#tests/Stubs/app/Exceptions/PrettyException'

export class ThrowErrorProvider extends ServiceProvider {
  register() {
    if (Env('THROW_ERROR_PROVIDER', false)) {
      process.env.PROVIDER_THROW_ERROR = 'true'
      throw new Error('Some error')
    }

    if (Env('THROW_EXCEPTION_PROVIDER', false)) {
      process.env.PROVIDER_THROW_EXCEPTION = 'true'
      throw new PrettyException()
    }
  }
}
