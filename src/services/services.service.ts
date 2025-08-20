import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Repository } from 'typeorm';
import { ServiceEntity } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DoctorEntity } from 'src/doctors/entities/doctor.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,

    @InjectRepository(DoctorEntity)
    private readonly doctorRepository: Repository<DoctorEntity>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceEntity> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: createServiceDto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const service = this.serviceRepository.create({
      ...createServiceDto,
      doctor,
    });

    return await this.serviceRepository.save(service);
  }

  async findAll(): Promise<ServiceEntity[]> {
    return this.serviceRepository.find({
      relations: ['doctor'],
    });
  }

  async findOne(id: string): Promise<ServiceEntity | null> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if(!service) throw new NotFoundException('Service id not found');
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceEntity | null> {
    const service = await this.serviceRepository.findOne({ where: { id } });

    if(!service) {
      throw new NotFoundException('Service id not found')
    }

    await this.serviceRepository.update(id, updateServiceDto);

    return await this.findOne(id);
  }
  
  async remove(id: string) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if(!service) throw new NotFoundException('Service id not found');
    await this.serviceRepository.delete(id);
    return {
      message: 'Service deleted successfully'
    }
  }
}
