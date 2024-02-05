import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from '../../config/redis.config';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        load: [redisConfig]
      }
    ),
    RedisModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [redisConfig]
        }),

      ],
      useFactory: (configService: ConfigService) => {

        return {
          url: configService.get('redisConf.redisUrl'),
          name: 'redis-db'
        }

      },
      inject: [ConfigService],
    }),
    JwtModule.register({
      secret: 'asasAsdsd1223',
      signOptions: { expiresIn: '60s' }
    })
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule { }
