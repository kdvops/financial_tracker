import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BearerAuthGuard } from './bearer-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'replace-me',
    }),
  ],
  providers: [BearerAuthGuard],
  exports: [JwtModule, BearerAuthGuard],
})
export class CommonAuthModule {}
