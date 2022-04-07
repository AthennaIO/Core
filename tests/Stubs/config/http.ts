export default {
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
  | Log http requests
  |--------------------------------------------------------------------------
  |
  | This value defines if HttpKernel will register a Logger to log all the
  | server requests.
  |
  */

  log: Env('APP_DEBUG', true),
}
