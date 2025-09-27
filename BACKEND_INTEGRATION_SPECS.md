# Especificaciones del Backend para el Sistema de Reservas

## 📋 Cambios Recomendados en el Backend

### 1. **CreateAppointmentDto Actualizado**

```typescript
// src/appointments/dto/create-appointment.dto.ts
import { IsString, IsArray, IsDateString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ServiceItemDto {
  @IsString()
  serviceId: string;

  @IsString()
  name: string;

  @IsNumber()
  duration: number; // duración en minutos

  @IsNumber()
  price: number; // precio en pesos argentinos
}

export class CreateAppointmentDto {
  @IsString()
  readonly userId: string; // ID del usuario que hace la reserva

  @IsString()
  readonly professionalId: string; // ID del profesional

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  readonly services: ServiceItemDto[]; // Array de servicios seleccionados

  @IsDateString()
  readonly date: string; // fecha en formato YYYY-MM-DD

  @IsString()
  readonly startTime: string; // hora de inicio en formato HH:mm

  @IsString()
  readonly endTime: string; // hora de fin en formato HH:mm

  @IsNumber()
  readonly totalDuration: number; // duración total en minutos

  @IsNumber()
  readonly totalPrice: number; // precio total

  @IsString()
  readonly paymentMethod: string; // "establishment", "online", etc.

  @IsOptional()
  @IsString()
  readonly notes?: string; // notas opcionales de la reserva

  @IsString()
  readonly status: string; // "pending", "confirmed", "cancelled"
}
```

### 2. **Esquema de MongoDB (Mongoose) Sugerido**

```typescript
// src/appointments/schemas/appointment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class ServiceItem {
  @Prop({ required: true })
  serviceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  duration: number; // en minutos

  @Prop({ required: true })
  price: number; // precio individual
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Professional' })
  professionalId: Types.ObjectId;

  @Prop({ required: true, type: [ServiceItem] })
  services: ServiceItem[];

  @Prop({ required: true })
  date: Date; // fecha de la cita

  @Prop({ required: true })
  startTime: string; // formato HH:mm

  @Prop({ required: true })
  endTime: string; // formato HH:mm

  @Prop({ required: true })
  totalDuration: number; // duración total en minutos

  @Prop({ required: true })
  totalPrice: number; // precio total

  @Prop({ required: true, default: 'establishment' })
  paymentMethod: string;

  @Prop()
  notes?: string; // opcional

  @Prop({ 
    required: true, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Índices para optimizar consultas
AppointmentSchema.index({ professionalId: 1, date: 1, startTime: 1 });
AppointmentSchema.index({ userId: 1, date: 1 });
AppointmentSchema.index({ status: 1 });
```

### 3. **Endpoints Requeridos en AppointmentsController**

```typescript
// src/appointments/appointments.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ✅ Crear nueva cita
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  // ✅ Obtener citas de un usuario
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.appointmentsService.findByUser(userId);
  }

  // ✅ Obtener citas de un profesional
  @Get('professional/:professionalId')
  findByProfessional(@Param('professionalId') professionalId: string) {
    return this.appointmentsService.findByProfessional(professionalId);
  }

  // ✅ IMPORTANTE: Obtener horarios disponibles de un profesional
  @Get('availability/:professionalId')
  getAvailableSlots(
    @Param('professionalId') professionalId: string,
    @Query('date') date: string // formato YYYY-MM-DD
  ) {
    return this.appointmentsService.getAvailableSlots(professionalId, date);
  }

  // ✅ Obtener una cita específica
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // ✅ Confirmar cita (para profesionales)
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.appointmentsService.updateStatus(id, 'confirmed');
  }

  // ✅ Cancelar cita
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.appointmentsService.updateStatus(id, 'cancelled');
  }

  // ✅ Completar cita
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.appointmentsService.updateStatus(id, 'completed');
  }

  // ✅ Eliminar cita (solo admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
```

### 4. **Métodos Clave en AppointmentsService**

```typescript
// src/appointments/appointments.service.ts

export class AppointmentsService {
  
  // 🔥 MÉTODO MÁS IMPORTANTE: Verificar disponibilidad
  async getAvailableSlots(professionalId: string, date: string) {
    const appointmentDate = new Date(date);
    
    // Obtener todas las citas del profesional para esa fecha
    const existingAppointments = await this.appointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date: appointmentDate,
      status: { $in: ['pending', 'confirmed'] } // No incluir canceladas
    }).sort({ startTime: 1 });

    // Generar todos los slots posibles (cada 15 minutos de 12:00 a 17:00)
    const allSlots = this.generateTimeSlots();
    
    // Marcar como ocupados los horarios que tienen citas
    const availableSlots = allSlots.map(slot => {
      const isOccupied = existingAppointments.some(appointment => {
        const appointmentStart = appointment.startTime;
        const appointmentEnd = appointment.endTime;
        return slot.time >= appointmentStart && slot.time < appointmentEnd;
      });
      
      return {
        time: slot.time,
        available: !isOccupied
      };
    });

    return availableSlots;
  }

  private generateTimeSlots() {
    const slots = [];
    for (let hour = 12; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ time: timeString });
      }
    }
    return slots;
  }

  // Validar que no haya conflictos de horarios antes de crear
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { professionalId, date, startTime, endTime, status } = createAppointmentDto;
    
    // Verificar conflictos de horarios
    const conflictingAppointments = await this.appointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingAppointments.length > 0) {
      throw new BadRequestException('El horario seleccionado ya está ocupado');
    }

    // Crear la cita
    const appointment = new this.appointmentModel({
      ...createAppointmentDto,
      date: new Date(date),
      professionalId: new Types.ObjectId(professionalId),
      userId: new Types.ObjectId(createAppointmentDto.userId)
    });

    return appointment.save();
  }
}
```

### 5. **Variables de Entorno Sugeridas**

```env
# .env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/soloclick
JWT_SECRET=your_jwt_secret_here
PORT=3000

# Email para notificaciones (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 6. **Funcionalidades Adicionales Recomendadas**

#### 📧 **Notificaciones por Email**
```typescript
// Enviar confirmaciones automáticas
async sendAppointmentConfirmation(appointment: Appointment) {
  // Implementar envío de email al usuario y profesional
}
```

#### 📱 **Sistema de Recordatorios**
```typescript
// Enviar recordatorios 24h antes de la cita
async sendReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointments = await this.findAppointmentsForDate(tomorrow);
  // Enviar recordatorios...
}
```

#### 📊 **Estadísticas**
```typescript
// Endpoint para estadísticas del profesional
@Get('professional/:id/stats')
async getProfessionalStats(@Param('id') professionalId: string) {
  return {
    totalAppointments: await this.countByProfessional(professionalId),
    monthlyRevenue: await this.calculateMonthlyRevenue(professionalId),
    averageRating: await this.getAverageRating(professionalId)
  };
}
```

## 🚀 **Flujo de Integración Completo**

1. **Frontend envía datos** → `POST /appointments`
2. **Backend valida disponibilidad** → Verifica conflictos de horarios
3. **Backend crea la cita** → Estado "pending" por defecto
4. **Backend envía confirmación** → Email al usuario
5. **Profesional confirma** → `PATCH /appointments/:id/confirm`
6. **Sistema envía recordatorio** → 24h antes de la cita

## ✅ **Testing de la Integración**

Para probar que todo funciona:

1. **Crear cita desde el frontend**
2. **Verificar en MongoDB** que se guardó correctamente
3. **Probar conflictos de horarios** intentando reservar el mismo horario
4. **Verificar disponibilidad** en diferentes fechas

¿Te parece bien esta estructura? ¿Hay algo que quieras modificar o agregar?