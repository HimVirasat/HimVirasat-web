export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
