import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // User dari JWT Strategy

    // Cek apakah user ada dan role-nya super_admin
    if (!user || user.role !== 'super_admin') {
      throw new ForbiddenException('Access denied: Super Admin only');
    }
    return true;
  }
}