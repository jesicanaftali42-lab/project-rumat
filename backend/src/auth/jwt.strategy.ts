import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      // ✅ FIX: pastikan gak undefined
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'RUMATE_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
