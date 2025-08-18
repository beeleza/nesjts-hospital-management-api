import { AppointmentEntity } from 'src/appointments/entities/appointment.entity';
import { DoctorEntity } from 'src/doctors/entities/doctor.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_services')
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => DoctorEntity, (doctor) => doctor.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: DoctorEntity;

  @OneToMany(() => AppointmentEntity, appointment => appointment.service)
  appointments: AppointmentEntity[];
}
