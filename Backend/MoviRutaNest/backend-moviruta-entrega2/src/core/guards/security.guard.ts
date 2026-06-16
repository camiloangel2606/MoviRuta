// src/common/guards/security.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SecurityGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Extraer el token que viene desde Angular
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó un token de autenticación');
    }

    // 2. Extraer la ruta limpia y el método HTTP (GET, POST, PATCH...)
    // Usamos request.route.path para evitar problemas si vienen IDs dinámicos en la URL
    const url = request.route.path; 
    const method = request.method;

    try {
      // 3. Despachar la validación al microservicio de Spring Boot (Puerto 8080)
      // Ajusta este endpoint según cómo se llame tu ruta de validación en Java
      const response = await axios.post('http://localhost:8080/api/permissions/validate', {
        url: url,
        method: method
      }, {
        headers: { Authorization: authHeader } // Pasamos el JWT para que Spring sepa quién es
      });

      // Si Spring Boot responde true (200 OK), dejamos pasar la petición en NestJS
      return response.data; 
    } catch (error) {
      // Si Spring Boot responde con error o no tiene permisos, bloqueamos en NestJS
      throw new UnauthorizedException('No tienes permisos para ejecutar esta acción');
    }
  }
}