import { ServiceProvider } from '@athenna/ioc'
import { TestService } from '#tests/Stubs/app/Services/TestService'

export class OnlyArtisanProvider extends ServiceProvider {
  get bootstrapIn() {
    return ['artisan']
  }

  register() {
    this.container.singleton('Athenna/Artisan/Test', TestService)
  }
}
