export default {
  /*
  |--------------------------------------------------------------------------
  | Application host
  |--------------------------------------------------------------------------
  |
  | This value is the HOST of your application, and it's used to access your
  | application.
  |
  */

  host: Env('HOST', '127.0.0.1'),

  /*
  |--------------------------------------------------------------------------
  | Application port
  |--------------------------------------------------------------------------
  |
  | This value is the PORT of your application, and it's used to access your
  | application.
  |
  */

  port: Env('PORT', 1335),

  /*
  |--------------------------------------------------------------------------
  | Application domain
  |--------------------------------------------------------------------------
  |
  | This value is the APP_DOMAIN of your application, and it's used to access your
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

  logRequests: Env('LOG_HTTP', true),

  /*
  |--------------------------------------------------------------------------
  | No cors
  |--------------------------------------------------------------------------
  |
  | This value defines if HttpKernel will set CORS plugin or not.
  |
  */

  noCors: false,

  /*
  |--------------------------------------------------------------------------
  | No tracer
  |--------------------------------------------------------------------------
  |
  | This value defines if HttpKernel will set rTracer plugin or not.
  |
  */

  noTracer: false,

  /*
  |--------------------------------------------------------------------------
  | No Rate Limit
  |--------------------------------------------------------------------------
  |
  | This value defines if HttpKernel will set Rate Limit plugin or not.
  |
  */

  noRateLimit: false,

  /*
  |--------------------------------------------------------------------------
  | No Error Handler
  |--------------------------------------------------------------------------
  |
  | This value defines if HttpKernel will set the default Athenna error handler
  | or not.
  |
  */

  noErrorHandler: false,

  /*
  |--------------------------------------------------------------------------
  | Cross-Origin Resource Sharing (CORS) Configuration
  |--------------------------------------------------------------------------
  |
  | Here you may configure your settings for cross-origin resource sharing
  | or "CORS". This determines what cross-origin operations may execute
  | in web browsers. You are free to adjust these settings as needed.
  |
  | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
  |
  */

  cors: {
    /*
    |--------------------------------------------------------------------------
    | Origin
    |--------------------------------------------------------------------------
    |
    | Configures the Access-Control-Allow-Origin CORS header. The value of origin
    | could be of different types:
    |
    |   Boolean - set origin to true to reflect the request origin, or set it
    |   too false to disable CORS.
    |
    |   String - set origin to a specific origin. For example if you set it to
    |   "http://example.com" only requests from "http://example.com" will be
    |   allowed. The special * value (default) allows any origin.
    |
    |   RegExp - set origin to a regular expression pattern that will be used to
    |   test the request origin. If it is a match, the request origin will be
    |   reflected. For example, the pattern /example\.com$/ will reflect any
    |   request that is coming from an origin ending with "example.com".
    |
    |   Array - set origin to an array of valid origins. Each origin can be a
    |   String or a RegExp. For example ["http://example1.com", /\.example2\.com$/]
    |   will accept any request from "http://example1.com" or from a subdomain of
    |   "example2.com".
    |
    |   Function - set origin to a function implementing some custom logic. The
    |   function takes the request origin as the first parameter and a callback
    |   as a second (which expects the signature err [Error | null], origin),
    |   where origin is a non-function value of the origin option. Async-await
    |   and promises are supported as well. The Fastify instance is bound to
    |   function call, and you may access via this.
    |
    */

    origin: ['*'],

    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    |
    | Configures the Access-Control-Allow-Methods CORS header. Expects a comma-
    | delimited string (ex: 'GET,PUT,POST') or an array (ex: ['GET', 'PUT', 'POST']).
    |
    */

    methods: ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    |
    | Configures the Access-Control-Allow-Headers CORS header. Expects a comma-
    | delimited string (ex: 'Content-Type,Authorization') or an array (ex:
    | ['Content-Type', 'Authorization']). If not specified, defaults to reflecting
    | the headers specified in the request's Access-Control-Request-Headers header.
    |
    */

    allowedHeaders: ['*'],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    |
    | Configures the Access-Control-Expose-Headers CORS header. Expects a comma-
    | delimited string (ex: 'Content-Range,X-Content-Range') or an array (ex:
    | ['Content-Range', 'X-Content-Range']). If not specified, no custom headers
    | are exposed.
    |
    */

    exposedHeaders: ['*'],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    |
    | Configures the Access-Control-Max-Age CORS header. In seconds. Set to an
    | integer to pass the header, otherwise it is omitted.
    |
    */

    maxAge: 0,

    /*
    |--------------------------------------------------------------------------
    | Credentials
    |--------------------------------------------------------------------------
    |
    | Configures the Access-Control-Allow-Credentials CORS header. Set to true
    | to pass the header, otherwise it is omitted.
    |
    */

    credentials: false,
  },

  /*
  |--------------------------------------------------------------------------
  | Tracer
  |--------------------------------------------------------------------------
  |
  | Here you may configure your settings for the rTracer plugin. The rTracer
  | plugin automatically generates a UUID V1 value as the id for each request
  | and stores it in AsyncLocalStorage (CLS core API). Allows to obtain the
  | generated request id anywhere in your routes later and use it for logging
  | or any other purposes.
  |
  | To learn more: https://github.com/puzpuzpuz/cls-rtracer
  |
  */

  tracer: {
    /*
    |--------------------------------------------------------------------------
    | Echo header
    |--------------------------------------------------------------------------
    |
    | Add request id to response header. If set to true, the middleware/plugin
    | will add request id to the specified header. Use headerName option to
    | specify header name.
    |
    */

    echoHeader: false,

    /*
    |--------------------------------------------------------------------------
    | Use header
    |--------------------------------------------------------------------------
    |
    | Respect request header flag. If set to true, the middleware/plugin will
    | always use a value from the specified header (if the value is present).
    |
    */

    useHeader: false,

    /*
    |--------------------------------------------------------------------------
    | Header name
    |--------------------------------------------------------------------------
    |
    | Request/response header name, case-insensitive. Used if useHeader or
    | echoHeader is set to true.
    |
    */

    headerName: 'X-Request-Id',

    /*
    |--------------------------------------------------------------------------
    | Use Fastify request id
    |--------------------------------------------------------------------------
    |
    | Use request id generated by Fastify instead of generating a new id.
    |
    */

    useFastifyRequestId: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Rate limit
  |--------------------------------------------------------------------------
  |
  | Ensure the fair usage of your http server by clients. It regulates the
  | number of times a user can request your application in a given time-frame.
  |
  */

  rateLimit: {
    /*
    |--------------------------------------------------------------------------
    | Global
    |--------------------------------------------------------------------------
    |
    | Indicates if the plugin should apply the rate limit setting to all routes
    | within the encapsulation scope.
    |
    */

    global: true,

    /*
    |--------------------------------------------------------------------------
    | Max
    |--------------------------------------------------------------------------
    |
    | The maximum number of requests a single client can perform inside a
    | timeWindow. It can be an async function with the signature async (request,
    | key) => {} where request is the Fastify request object and key is the value
    | generated by the keyGenerator. The function must return a number.
    |
    */

    max: 1000,

    /*
    |--------------------------------------------------------------------------
    | Ban
    |--------------------------------------------------------------------------
    |
    | The maximum number of 429 responses to return to a single client before
    | returning 403. When the ban limit is exceeded the context field will have
    | ban=true in the errorResponseBuilder. This parameter is an in-memory counter
    | and could not work properly in a distributed environment.
    |
    */

    ban: null,

    /*
    |--------------------------------------------------------------------------
    | Time Window
    |--------------------------------------------------------------------------
    |
    | The duration of the time window. It can be expressed in milliseconds or
    | as a string (in the ms format).
    |
    */

    timeWindow: 1000 * 60,

    /*
    |--------------------------------------------------------------------------
    | Cache
    |--------------------------------------------------------------------------
    |
    | This plugin internally uses a lru cache to handle the clients, you can
    | change the size of the cache with this option.
    |
    */

    cache: 5000,

    /*
    |--------------------------------------------------------------------------
    | Allow List
    |--------------------------------------------------------------------------
    |
    | Array of string of ips to exclude from rate limiting. It can be a sync
    | function with the signature (request, key) => {} where request is the
    | Fastify request object and key is the value generated by the keyGenerator.
    | If the function return a truthy value, the request will be excluded from
    | the rate limit.
    |
    */

    allowList: [],

    /*
    |--------------------------------------------------------------------------
    | Continue Exceeding
    |--------------------------------------------------------------------------
    |
    | Renew user limitation when user sends a request to the server when still
    | limited.
    |
    */

    continueExceeding: false,

    /*
    |--------------------------------------------------------------------------
    | Enable Draft Spec
    |--------------------------------------------------------------------------
    |
    | If true it will change the HTTP rate limit headers following the IEFT
    | draft document.
    |
    */

    enableDraftSpec: false,
  },
}
