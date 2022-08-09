export class UnauthorizedError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
  }
}
