import { A, L, O, U } from 'ts-toolbelt'

type _Events<
  L extends readonly [symbol, unknown][],
  R extends Record<symbol, unknown>
> = L.Length<L> extends 0
  ? R
  : L.Last<L> extends [infer K, infer V]
  ? _Events<L.Pop<L>, O.Merge<R, Record<A.Cast<K, symbol>, V>>>
  : never

type Events<T extends [symbol, unknown]> = _Events<U.ListOf<T>, {}>

type Handler<T> = (value: T) => any

type Handlers<T extends [symbol, unknown]> = Partial<{
  [K in keyof Events<T>]: Handler<Events<T>[K]>
}>

type Gen<T extends [symbol, unknown]> = Generator<T, any, boolean | undefined>

export default class IteratorToEmitter<T extends [symbol, unknown]> {
  #iterator: Gen<T>
  #handlers: Handlers<T>

  static create<T extends [symbol, unknown]>(iterator: Gen<T>) {
    return new IteratorToEmitter(iterator, {})
  }

  constructor(iterator: Gen<T>, handlers: Handlers<T>) {
    this.#iterator = iterator
    this.#handlers = handlers
  }

  handle<EventName extends keyof Events<T>>(
    eventName: EventName,
    handler: Handler<Events<T>[EventName]>
  ) {
    return new IteratorToEmitter(this.#iterator, {
      ...this.#handlers,
      [eventName]: handler,
    })
  }

  run() {
    let item = this.#iterator.next()
    while (!item.done) {
      item = this.#iterator.next(
        this.#emit(
          item.value[0] as keyof Events<T>,
          item.value[1] as Events<T>[keyof Events<T>]
        )
      )
    }
  }

  #emit<EventName extends keyof Events<T>>(
    eventName: EventName,
    value: Events<T>[EventName]
  ) {
    return this.#handlers[eventName]?.(value)
  }
}
