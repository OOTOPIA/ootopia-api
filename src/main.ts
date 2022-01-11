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
import * as admin from 'firebase-admin';

async function bootstrap() {
  const expressApp = express();


  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app : expressApp }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  // Initialize Firebase

  var serviceAccount = require("../ootopia-beta-staging-firebase-adminsdk-lnkap-28e50ddaa1.json");
  //sertextes-firebase-adminsdk-jupxv-75dfc38494.json
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  expressApp.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  expressApp.use(Sentry.Handlers.tracingHandler());

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp)
  );

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
