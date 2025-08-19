import { DoctorEntity } from 'src/doctors/entities/doctor.entity';
import { PatientEntity } from 'src/patients/entities/patient.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum UserType {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  ADMIN = 'admin',
}

@Entity('tb_users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  cpf: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: UserType })
  type: UserType;

  @OneToOne(() => DoctorEntity, doctor => doctor.user)
  doctor?: DoctorEntity;

  @OneToOne(() => PatientEntity, patient => patient.user)
  patient?: PatientEntity;
}
