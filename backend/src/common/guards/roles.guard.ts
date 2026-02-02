import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // dari JwtAuthGuard

    if (!user) throw new ForbiddenException('No user in request');

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied (role tidak sesuai)');
    }

    return true;
  }
}
