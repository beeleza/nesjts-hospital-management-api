import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Repository } from 'typeorm';
import { PatientEntity } from './entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserType } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly usersService: UsersService,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const user = await this.usersService.create({
      first_name: createPatientDto.first_name,
      last_name: createPatientDto.last_name,
      email: createPatientDto.email,
      cpf: createPatientDto.cpf,
      phone: createPatientDto.phone,
      password: createPatientDto.password,
      type: UserType.PATIENT,
    });

    const patient = this.patientRepository.create({
      id: user.user.id,
      birth_date: createPatientDto.birth_date,
      sex: createPatientDto.sex,
      address: createPatientDto.address,
    });

    const savedPatient = await this.patientRepository.save(patient);

    return {
      message: 'Patient created successfully',
      patient: {
        ...user.user,
        ...savedPatient,
      },
    };
  }

  async findAll() {
    return this.patientRepository.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);

    await this.usersService.update(id, {
      first_name: updatePatientDto.first_name,
      last_name: updatePatientDto.last_name,
      email: updatePatientDto.email,
      cpf: updatePatientDto.cpf,
      phone: updatePatientDto.phone,
      password: updatePatientDto.password,
    });

    await this.patientRepository.update(id, {
      birth_date: updatePatientDto.birth_date ?? patient.birth_date,
      sex: updatePatientDto.sex ?? patient.sex,
      address: updatePatientDto.address ?? patient.address,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);
    await this.patientRepository.delete(id);
    await this.usersService.remove(id);
    return { message: 'Patient removed successfully' };
  }
}
