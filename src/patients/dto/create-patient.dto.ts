import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from 'src/users/entities/user.entity';

export class CreatePatientDto {
  @IsDateString()
  birth_date: Date;

  @IsString()
  @IsNotEmpty()
  sex: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  // dados do usuário
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserType)
  type: UserType;
}
