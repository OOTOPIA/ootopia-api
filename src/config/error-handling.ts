import { HttpException } from '@nestjs/common';
interface Error {
  status?: number;
  message?: string;
}

export class ErrorHandling {
  constructor(error: Error) {
    console.log("error", error);
    if (!error.status) {
      throw error;
    }

    throw new HttpException(
      {
        status: error.status,
        error: error.message,
      },
      error.status,
    );
  }
}