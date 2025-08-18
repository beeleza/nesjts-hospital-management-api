import { AppointmentEntity } from 'src/appointments/entities/appointment.entity';
import { ServiceEntity } from 'src/services/entities/service.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_doctors')
export class DoctorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: UserEntity;

  @Column({ unique: true })
  crm: string;

  @Column()
  specialty: string;

  @OneToMany(() => ServiceEntity, service => service.doctor)
  services: ServiceEntity[];

  @OneToMany(() => AppointmentEntity, appointment => appointment.doctor)
  appointments: AppointmentEntity[];
}
