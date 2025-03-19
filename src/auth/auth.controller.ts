import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log('info', 'Registrando novo usuário');

    const user = await this.authService.register(registerDto);

    this.logger.log('info', `Usuário registrado com sucesso: ${user.id}`);
    return user;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log('info', 'Logando usuário');

    const token = await this.authService.login(loginDto);

    if (!token) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.logger.log('info', 'Usuário logado com sucesso');
    return { token };
  }
}
