import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Not, Repository } from 'typeorm';
import {
  AppointmentEntity,
  AppointmentStatus,
} from './entities/appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    // Verificar se já existe um agendamento no mesmo horário para o médico
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: createAppointmentDto.doctor_id },
        date_time: createAppointmentDto.date_time,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        'There is already an appointment for this doctor at the selected time',
      );
    }

    const appointment = this.appointmentRepository.create({
      patient: { id: createAppointmentDto.patient_id },
      doctor: { id: createAppointmentDto.doctor_id },
      service: { id: createAppointmentDto.service_id },
      date_time: createAppointmentDto.date_time,
      status: createAppointmentDto.status || AppointmentStatus.SCHEDULED,
      notes: createAppointmentDto.notes,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository.find({
      relations: ['patient', 'doctor', 'service'],
      order: { date_time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'service'],
    });
    if (!appointment) {
      throw new NotFoundException('Appintment id not found');
    }
    return appointment;
  }

  async findByPatient(patientId: string): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'service'],
      order: { date_time: 'ASC' },
    });
  }

  async findByDoctor(doctorId: string): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'service'],
      order: { date_time: 'ASC' },
    });
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);

    // Se estiver alterando médico ou horário, verificar conflitos
    if (updateAppointmentDto.doctor_id || updateAppointmentDto.date_time) {
      const doctorId = updateAppointmentDto.doctor_id || appointment.doctor.id;
      const dateTime = updateAppointmentDto.date_time || appointment.date_time;

      const existingAppointment = await this.appointmentRepository.findOne({
        where: {
          doctor: { id: doctorId },
          date_time: dateTime,
          status: AppointmentStatus.SCHEDULED,
          id: Not(id), // Excluir o próprio agendamento da verificação
        },
      });

      if (existingAppointment) {
        throw new ConflictException(
          'There is already an appointment for this doctor at the selected time',
        );
      }
    }

    const updatedAppointment = this.appointmentRepository.merge(appointment, {
      ...(updateAppointmentDto.patient_id && {
        patient: { id: updateAppointmentDto.patient_id },
      }),
      ...(updateAppointmentDto.doctor_id && {
        doctor: { id: updateAppointmentDto.doctor_id },
      }),
      ...(updateAppointmentDto.service_id && {
        service: { id: updateAppointmentDto.service_id },
      }),
      ...(updateAppointmentDto.date_time && {
        date_time: updateAppointmentDto.date_time,
      }),
      ...(updateAppointmentDto.status && {
        status: updateAppointmentDto.status,
      }),
      ...(updateAppointmentDto.notes !== undefined && {
        notes: updateAppointmentDto.notes,
      }),
    });

    return await this.appointmentRepository.save(updatedAppointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.SCHEDULED) {
      appointment.status = AppointmentStatus.CANCELED;
      await this.appointmentRepository.save(appointment);
    } else {
      await this.appointmentRepository.remove(appointment);
    }
  }

  async cancelAppointment(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new ConflictException(
        'You can only cancel appointments with SCHEDULED status',
      );
    }

    appointment.status = AppointmentStatus.CANCELED;
    return await this.appointmentRepository.save(appointment);
  }

  async completeAppointment(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new ConflictException(
        'It is only possible to complete appointments with SCHEDULED status',
      );
    }

    appointment.status = AppointmentStatus.COMPLETED;
    return await this.appointmentRepository.save(appointment);
  }

  async getAppointmentsByStatus(
    status: AppointmentStatus,
  ): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository.find({
      where: { status },
      relations: ['patient', 'doctor', 'service'],
      order: { date_time: 'ASC' },
    });
  }
}
