export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors: string[] = []
  ) {
    super(message);
    this.name = 'AppError';
  }
}
