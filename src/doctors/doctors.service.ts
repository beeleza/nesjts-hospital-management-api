import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Repository } from 'typeorm';
import { DoctorEntity } from './entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UserType } from 'src/users/entities/user.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorEntity)
    private readonly doctorRepository: Repository<DoctorEntity>,

    private readonly usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const user = await this.usersService.create({
      first_name: createDoctorDto.first_name,
      last_name: createDoctorDto.last_name,
      email: createDoctorDto.email,
      cpf: createDoctorDto.cpf,
      phone: createDoctorDto.phone,
      password: createDoctorDto.password,
      type: UserType.DOCTOR,
    });

    const doctor = await this.doctorRepository.create({
      id: user.user.id,
      crm: createDoctorDto.crm,
      specialty: createDoctorDto.specialty,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);

    return {
      message: 'Doctor created successfully',
      doctor: {
        ...user.user,
        ...savedDoctor,
      },
    };
  }

  async findAll() {
    return this.doctorRepository.find({
      relations: ['user', 'services', 'appointments'],
    });
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user', 'services', 'appointments'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    await this.usersService.update(id, {
      first_name: updateDoctorDto.first_name,
      last_name: updateDoctorDto.last_name,
      email: updateDoctorDto.email,
      cpf: updateDoctorDto.cpf,
      phone: updateDoctorDto.phone,
      password: updateDoctorDto.password,
    });

    await this.doctorRepository.update(id, {
      crm: updateDoctorDto.crm ?? doctor.crm,
      specialty: updateDoctorDto.specialty ?? doctor.specialty,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const doctor = await this.findOne(id);
    await this.doctorRepository.delete(id);
    await this.usersService.remove(id);
    return { message: 'Doctor removed successfully' };
  }
}
