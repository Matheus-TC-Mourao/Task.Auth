import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @Trim()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  @Trim()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}
