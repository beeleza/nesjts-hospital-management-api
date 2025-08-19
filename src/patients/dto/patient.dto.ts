import { AppointmentEntity } from "src/appointments/entities/appointment.entity";
import { UserEntity } from "src/users/entities/user.entity";


export class PatientDto {
  id: string;
  birth_date: Date;
  sex: string;
  address: string;
  user: UserEntity;
  appointments?: AppointmentEntity[];
}
