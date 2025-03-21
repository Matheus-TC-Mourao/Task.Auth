import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '.././auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-uuid',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue('jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('register', () => {
    it('should create a user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue(
        'hashedPassword',
      );
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      prismaMock.user.create.mockResolvedValue(mockUser);
      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        registerDto.password,
        expect.any(Number),
      );
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { ...registerDto, password: 'hashedPassword' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);

      const jwtSignSpy = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('jwt-token');

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const token = await authService.login(loginDto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtSignSpy).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(token).toEqual('jwt-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
