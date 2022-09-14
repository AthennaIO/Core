import { Log } from '@athenna/logger'
import { Server } from '@athenna/http'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default environment
  |--------------------------------------------------------------------------
  |
  | Default environment of the application.
  |
  */

  environment: Env('NODE_ENV', 'test'),

  /*
  |--------------------------------------------------------------------------
  | Application debug
  |--------------------------------------------------------------------------
  |
  | Set if the application will start in debug mode or not. If in debug mode,
  | the application will show sensitive logs and return sensitive data on errors.
  |
  */

  debug: Env('APP_DEBUG', 'false'),

  /*
  |--------------------------------------------------------------------------
  | Application Name
  |--------------------------------------------------------------------------
  |
  | This value is the name of your application and can used when you
  | need to place the application's name in a email, view or
  | other location.
  |
  */

  name: Env('APP_NAME', 'Athenna') || 'Athenna',

  /*
  |--------------------------------------------------------------------------
  | Application Version
  |--------------------------------------------------------------------------
  |
  | This value is the version of your application and can used when you
  | need to place the application's version in a route, view or
  | other location.
  |
  */

  version: '1.0.0',

  /*
  |--------------------------------------------------------------------------
  | Application Description
  |--------------------------------------------------------------------------
  |
  | This value is the description of your application and can used when you
  | need to place the application's description in swagger, view or
  | other location.
  |
  */

  description: Env('APP_DESCRIPTION', 'Athenna Framework'),

  /*
  |--------------------------------------------------------------------------
  | Application key
  |--------------------------------------------------------------------------
  |
  | This value is the application key used to make hashs and to authorize,
  | requests.
  |
  */

  appKey: Env('APP_KEY', '12345'),

  /*
  |--------------------------------------------------------------------------
  | Application source url
  |--------------------------------------------------------------------------
  |
  | This value is the application source url, usually a link to a git repo-
  | sitory.
  |
  */

  source: Env('APP_SOURCE', 'https://github.com'),

  /*
  |--------------------------------------------------------------------------
  | Documentation url
  |--------------------------------------------------------------------------
  |
  | This value is the application documentation url, usually a link to the
  | main documentation of the API.
  |
  */

  documentation: Env('APP_DOMAIN', 'http://localhost:1335'),

  /*
  |--------------------------------------------------------------------------
  | Default Locale
  |--------------------------------------------------------------------------
  |
  | Default locale to be used by Intl provider. You can always switch drivers
  | in runtime or use the official Intl middleware to detect the driver
  | based on HTTP headers/query string.
  |
  */

  locale: Env('APP_LOCALE', 'pt'),

  /*
  |--------------------------------------------------------------------------
  | Graceful shutdown callback
  |--------------------------------------------------------------------------
  |
  | Default graceful shutdown callback configured to listen to SIGINT and
  | SIGTERM events.
  |
  */

  gracefulShutdown: async () => {
    Log.warn('Athenna application gracefully shutting down.')

    await Server.close()
  },

  /*
  |--------------------------------------------------------------------------
  | Application providers
  |--------------------------------------------------------------------------
  |
  | The service providers listed here will be automatically loaded on the
  | ignite of your application. Feel free to add your own services to
  | this array to grant expanded functionality to your applications.
  |
  */

  providers: [
    import('#src/Providers/ServiceProvider'),
    import('#src/Providers/RepositoryProvider'),
    import('#tests/Stubs/providers/ThrowErrorProvider'),
    import('#tests/Stubs/providers/OnlyArtisanProvider'),
    import('@athenna/artisan/providers/ArtisanProvider'),
    import('@athenna/http/providers/HttpServerProvider'),
    import('@athenna/http/providers/HttpRouteProvider'),
    import('@athenna/logger/providers/LoggerProvider'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Application preloads
  |--------------------------------------------------------------------------
  |
  | The files listed here will be automatically loaded on the application
  | ignite of your application. Fell free to add your own preloads to this
  | array.
  |
  */

  preloads: ['../tests/Stubs/preload.js'],
}
