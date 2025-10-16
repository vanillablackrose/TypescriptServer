export function errorMiddleware(err, req, res, next) {
    if (err instanceof NotFoundError) {
        res.status(404).send({ error: err.message });
    }
    else if (err instanceof UnauthorizedError) {
        res.status(401).send({ error: err.message });
    }
    else if (err instanceof PermissionError) {
        res.status(403).send({ error: err.message });
    }
    else if (err instanceof ValidationError) {
        res.status(400).send({ error: err.message });
    }
    else {
        res.status(500).send({ error: err.message });
    }
}
export class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}
export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
    }
}
export class ValidationError extends Error {
    constructor(message) {
        super(message);
    }
}
export class PermissionError extends Error {
    constructor(message) {
        super(message);
    }
}
