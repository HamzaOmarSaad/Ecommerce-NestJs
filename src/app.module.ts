import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { authModule } from './modules/authentication/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrderModule } from './modules/order/order.module';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedAuthModule } from './common/modules';
import { s3Service } from './common/utils/s3.service';
import { BrandModule } from './modules/brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env.prod'],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ///* .config dont work here */
    // MongooseModule.forRoot(process.env.DB_URI as string, {
    //   onConnectionCreate: (connection: Connection) => {
    //     connection.on('connected', () => console.log('connected'));
    //     connection.on('open', () => console.log('open'));
    //     connection.on('disconnected', () => console.log('disconnected'));
    //     connection.on('reconnected', () => console.log('reconnected'));
    //     connection.on('disconnecting', () => console.log('disconnecting'));

    //     return connection;
    //   },
    // }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('connected'));
          connection.on('open', () => console.log('open'));
          connection.on('disconnected', () => console.log('disconnected'));
          connection.on('reconnected', () => console.log('reconnected'));
          connection.on('disconnecting', () => console.log('disconnecting'));

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    SharedAuthModule,
    authModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrderModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [AppService, s3Service],
})
export class AppModule {}
