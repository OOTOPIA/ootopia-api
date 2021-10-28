import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';
import { AllExceptionsFilter } from './config/all-exception-filter';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger : true, }
  );

  Sentry.init({
    dsn: 'https://85374b7ba3a94b00bd99bb44f014acd0@o566687.ingest.sentry.io/5709807',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app : expressApp }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });

    // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  expressApp.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  expressApp.use(Sentry.Handlers.tracingHandler());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useStaticAssets(join(__dirname, '..', 'public'));
//  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  //app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({limit: '500mb', extended: true}));

  //TEMP: Check if is necessary to validate video webhook signature
  //app.use('/posts/video/webhook', bodyParser.raw({type: 'application/json'}));

  const config = new DocumentBuilder()
    .setTitle('Ootopia API')
    .setDescription('Ootopia API Doc')
    .setVersion('1.0')
    .addTag('general-config')
    .addTag('users')
    .addTag('posts')
    .addTag('interests-tags')
    .addTag('wallets')
    .addTag('wallet-transfers')
    .addTag('market-place')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  console.log('Port', process.env.PORT || 3000);
  await app.listen(process.env.PORT || 3000);

}
bootstrap();
