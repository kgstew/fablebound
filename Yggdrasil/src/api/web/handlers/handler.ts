interface Handler<T> {
    validate(data: unknown): T
    handle(data: unknown): void
}

export { Handler }
