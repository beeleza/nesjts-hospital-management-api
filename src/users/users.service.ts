import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { UserEntity, UserType } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DoctorEntity } from 'src/doctors/entities/doctor.entity';
import { PatientEntity } from 'src/patients/entities/patient.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const isExisting = await this.findByEmail(createUserDto.email);
    if (isExisting) {
      throw new ConflictException('E-mail already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = savedUser;

    return {
      message: 'User created successfully',
      user: userWithoutPassword,
    };
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if(!user) {
      throw new NotFoundException('User id not found')
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.findByEmail(updateUserDto.email);
      if (emailExists) throw new ConflictException('E-mail already exists');
    }

    if (updateUserDto.password) {
      if (user.type === UserType.PATIENT) {
        throw new BadRequestException('Patients cannot have passwords');
      }
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return {
      message: 'User updated successfully',
      user: userWithoutPassword,
    };
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);

    return { message: 'User removed successfully' };
  }
}
