import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @Trim()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
