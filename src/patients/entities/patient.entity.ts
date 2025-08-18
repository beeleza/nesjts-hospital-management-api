import { AppointmentEntity } from 'src/appointments/entities/appointment.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_patients')
export class PatientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: UserEntity;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column()
  sex: string;

  @Column()
  address: string;

  @OneToMany(() => AppointmentEntity, appointment => appointment.patient)
  appointments: AppointmentEntity[];
}
