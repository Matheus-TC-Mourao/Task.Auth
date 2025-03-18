import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @Trim()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}
