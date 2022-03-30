export default {
  /*
  |--------------------------------------------------------------------------
  | Default environment
  |--------------------------------------------------------------------------
  |
  | Default environment of the application.
  |
  */
  environment: process.env.NODE_ENV || 'production',

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
  name: Env('APP_NAME', 'Athenna') || require('../package.json').name,

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
  version: require('../package.json').version,

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
  | Application host
  |--------------------------------------------------------------------------
  |
  | This value is the HOST of your application and its used to access your
  | application.
  |
  */

  host: Env('HOST', '127.0.0.1'),

  /*
  |--------------------------------------------------------------------------
  | Application port
  |--------------------------------------------------------------------------
  |
  | This value is the PORT of your application and its used to access your
  | application.
  |
  */

  port: Env('PORT', 1335),

  /*
    |--------------------------------------------------------------------------
    | Application domain
    |--------------------------------------------------------------------------
    |
    | This value is the APP_DOMAIN of your application and its used to access your
    | application.
    |
    */

  domain: Env('APP_DOMAIN', 'http://localhost:1335'),

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
  | Default authorization strategy
  |--------------------------------------------------------------------------
  |
  | Default authorization strategy for the entire application.
  |
  */
  authorization: {
    defaultStrategy: 'jwt',
    jwt: {
      secret: Env('APP_KEY', ''),
      signOptions: { expiresIn: 18000 },
    },
    apiKey: Env('APP_KEY', '12345'),
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
    require('@athenna/http/src/Providers/HttpServerProvider'),
    require('@athenna/http/src/Providers/HttpRouteProvider'),
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
  preloads: ['./start/routes'],
}
