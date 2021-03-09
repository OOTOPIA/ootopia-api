import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { BaseExceptionFilter } from '@nestjs/core';
  
  @Catch()
  export class AllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      console.log("all exceptions!!", exception);
      super.catch(exception, host);
    }
  }
  