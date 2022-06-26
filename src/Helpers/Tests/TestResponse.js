export class TestResponse {
  /**
   * @type {import('@japa/assert').Assert}
   */
  #assert

  /**
   * @type {import('light-my-request').Response}
   */
  #response

  /**
   * @param {import('@japa/assert').Assert} assert
   * @param {import('light-my-request').Response} response
   */
  constructor(assert, response) {
    this.#assert = assert
    this.#response = response
  }

  /**
   * Assert the status code of the response.
   *
   * @param {number} number
   * @example
   *   response.assertStatusCode(200)
   */
  assertStatusCode(number) {
    this.#assert.deepEqual(this.#response.statusCode, number)
  }

  /**
   * Assert the status code is not the same of the response.
   *
   * @param {number} number
   * @example
   *   response.assertIsNotStatusCode(200)
   */
  assertIsNotStatusCode(number) {
    this.#assert.notDeepEqual(this.#response.statusCode, number)
  }

  /**
   * Assert body (array or object) to contain a subset of the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyContains({ id: 1 }) // passes
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyContains([{ id: 1 }, { id: 2 }]) // passes
   */
  assertBodyContains(values) {
    const body = this.#response.json()

    this.#assert.containsSubset(body, values)
  }

  /**
   * Assert body (array or object) to not contain a subset of the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyNotContains({ id: 1 }) // fails
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyNotContains([{ id: 3 }]) // passes
   */
  assertBodyNotContains(values) {
    const body = this.#response.json()

    this.#assert.notContainsSubset(body, values)
  }

  /**
   * Assert body to contain a key.
   *
   * @param {string} key
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyContainsKey('id') // passes
   */
  assertBodyContainsKey(key) {
    const body = this.#response.json()

    this.#assert.property(body, key)
  }

  /**
   * Assert body to not contain a key.
   *
   * @param {string} key
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyNotContainsKey('id') // fails
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyNotContainsKey('createdAt') // passes
   */
  assertBodyNotContainsKey(key) {
    const body = this.#response.json()

    this.#assert.notProperty(body, key)
  }

  /**
   * Assert body to contain all keys.
   *
   * @param {string[]} keys
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyContainsAllKeys(['id', 'post']) // passes
   */
  assertBodyContainsAllKeys(keys) {
    const body = this.#response.json()

    this.#assert.properties(body, keys)
  }

  /**
   * Assert body to not contain all keys.
   *
   * @param {string[]} keys
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyNotContainsAllKeys(['id']) // fails
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyNotContainsAllKeys(['createdAt']) // passes
   */
  assertBodyNotContainsAllKey(keys) {
    const body = this.#response.json()

    this.#assert.notAllProperties(body, keys)
  }

  /**
   * Assert body (array or object) to be deep equal to the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyDeepEqual({ id: 1 }) // fails
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // passes
   */
  assertBodyDeepEqual(values) {
    const body = this.#response.json()

    this.#assert.deepEqual(body, values)
  }

  /**
   * Assert body (array or object) to be not deep equal to the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyNotDeepEqual({ id: 1 }) // passes
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyNotDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // fails
   */
  assertBodyNotDeepEqual(values) {
    const body = this.#response.json()

    this.#assert.notDeepEqual(body, values)
  }

  /**
   * Assert body to be an array.
   *
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyIsArray() // fails
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyIsArray() // passes
   */
  assertBodyIsArray() {
    const body = this.#response.json()

    this.#assert.isArray(body)
  }

  /**
   * Assert body to not be an array.
   *
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyIsNotArray() // passes
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyIsNotArray() // fails
   */
  assertBodyIsNotArray() {
    const body = this.#response.json()

    this.#assert.isNotArray(body)
  }

  /**
   * Assert body to be an object.
   *
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyIsObject() // passes
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyIsObject() // fails
   */
  assertBodyIsObject() {
    const body = this.#response.json()

    this.#assert.isObject(body)
  }

  /**
   * Assert body to not be an object.
   *
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertBodyIsObject() // fails
   * @example
   *   const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertBodyIsObject() // passes
   */
  assertBodyIsNotObject() {
    const body = this.#response.json()

    this.#assert.isObject(body)
  }

  /**
   * Assert header (array or object) to contain a subset of the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const header = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderContains({ id: 1 }) // passes
   * @example
   *   const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertHeaderContains([{ id: 1 }, { id: 2 }]) // passes
   */
  assertHeaderContains(values) {
    const headers = this.#response.headers

    this.#assert.containsSubset(headers, values)
  }

  /**
   * Assert header (array or object) to not contain a subset of the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const header = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderContains({ id: 1 }) // passes
   * @example
   *   const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertHeaderContains([{ id: 1 }, { id: 2 }]) // passes
   */
  assertHeaderNotContains(values) {
    const headers = this.#response.headers

    this.#assert.notContainsSubset(headers, values)
  }

  /**
   * Assert header (array or object) to be deep equal to the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const header = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderDeepEqual({ id: 1 }) // fails
   * @example
   *   const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertHeaderDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // passes
   */
  assertHeaderDeepEqual(values) {
    const header = this.#response.headers

    this.#assert.deepEqual(header, values)
  }

  /**
   * Assert header (array or object) to be not deep equal to the expected value.
   *
   * @param {any|any[]} values
   * @example
   *   const header = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderNotDeepEqual({ id: 1 }) // passes
   * @example
   *   const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *   response.assertHeaderNotDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // fails
   */
  assertHeaderNotDeepEqual(values) {
    const headers = this.#response.headers

    this.#assert.notDeepEqual(headers, values)
  }

  /**
   * Assert header to contain a key.
   *
   * @param {string} key
   * @example
   *   const header = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderContainsKey('id') // passes
   */
  assertHeaderContainsKey(key) {
    const headers = this.#response.headers

    this.#assert.property(headers, key)
  }

  /**
   * Assert header to not contain a key.
   *
   * @param {string} key
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderNotContainsKey('id') // fails
   * @example
   *   const body = { id: 1, name: 'post 1' }
   *
   *   response.assertHeaderNotContainsKey('createdAt') // passes
   */
  assertHeaderNotContainsKey(key) {
    const headers = this.#response.headers

    this.#assert.notProperty(headers, key)
  }
}
