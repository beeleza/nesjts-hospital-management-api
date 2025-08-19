import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { UserType } from "../entities/user.entity";

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  password: string;

  @IsString()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  cpf: string;

  @IsString()
  phone: string;

  @IsEnum(UserType)
  type: UserType;
}
