import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsUUID()
  @IsNotEmpty()
  doctor_id: string;

  @IsUUID()
  @IsNotEmpty()
  service_id: string;

  @IsDateString()
  @IsNotEmpty()
  date_time: Date;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsOptional()
  notes?: string;
}
