import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from './entities/service.entity';
import { DoctorEntity } from 'src/doctors/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity, DoctorEntity]), ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule {}
