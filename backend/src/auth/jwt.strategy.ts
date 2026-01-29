import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'RUMATE_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // payload itu yang kita isi saat sign token
    // nanti bisa dipake di request.user
    return payload;
  }
}
