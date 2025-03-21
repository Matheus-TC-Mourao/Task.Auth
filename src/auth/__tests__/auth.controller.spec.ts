import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '.././auth.controller';
import { AuthService } from '.././auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 'user-uuid',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockLogger = {
    log: jest.fn(),
  };

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return the created user', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      authServiceMock.register.mockResolvedValue(mockUser);
      const result = await controller.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
    });

    it('should propagate an error when registration fails', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      authServiceMock.register.mockRejectedValue(
        new ConflictException('Email já cadastrado'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      authServiceMock.login.mockResolvedValue('jwt-token');

      const result = await controller.login(loginDto);

      expect(result).toEqual({ token: 'jwt-token' });
      expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
    });

    it('should propagate an error when login fails', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      authServiceMock.login.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
