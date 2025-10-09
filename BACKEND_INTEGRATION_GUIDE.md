# 🔧 Backend Integration Checklist - SoloClick

## 📋 **Endpoints Necesarios en el Backend NestJS**

### **1. POST /professionals** (Registro)
```typescript
// Endpoint para registrar nuevo profesional
@Post('professionals')
async create(@Body() createProfessionalDto: CreateProfessionalDto) {
  const professional = await this.professionalsService.create(createProfessionalDto);
  const token = this.authService.generateToken(professional);
  
  return {
    success: true,
    message: 'Profesional registrado exitosamente',
    user: {
      id: professional._id,
      name: professional.name,
      email: professional.email,
      userType: 'professional', // ⚠️ IMPORTANTE: Este campo es clave
      phone: professional.phone,
      city: professional.city,
      specialty: professional.specialty
    },
    token: token
  };
}
```

### **2. PUT /professionals/profile** (Completar perfil)
```typescript
@Put('professionals/profile')
@UseGuards(JwtAuthGuard)
async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
  const professionalId = req.user.id;
  
  const updated = await this.professionalsService.updateProfile(professionalId, {
    description: updateData.description,
    address: updateData.address,
    workingHours: updateData.workingHours,
    images: updateData.images,
    profileCompleted: true // ⚠️ Marcar como completado
  });
  
  return {
    success: true,
    message: 'Perfil actualizado exitosamente',
    professional: updated
  };
}
```

### **3. GET /professionals/profile** (Obtener perfil)
```typescript
@Get('professionals/profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Request() req) {
  const professionalId = req.user.id;
  const professional = await this.professionalsService.findById(professionalId);
  
  return {
    success: true,
    professional: professional
  };
}
```

## 🗃️ **Esquema MongoDB (Professional)**

```typescript
// professional.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Professional extends Document {
  // Datos básicos (Stage 1 - Registro)
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  specialty: string;

  // Datos extendidos (Stage 2 - Completar perfil)
  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop({
    type: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  })
  workingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  @Prop([String])
  images: string[];

  @Prop({ default: false })
  profileCompleted: boolean;

  // Metadatos automáticos
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
```

## 🔧 **DTOs Necesarios**

```typescript
// create-professional.dto.ts
export class CreateProfessionalDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  specialty: string;
}

// update-profile.dto.ts
export class UpdateProfileDto {
  @IsOptional()
  description?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  workingHours?: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  @IsOptional()
  images?: string[];
}
```

## 🚀 **Configuración de CORS**

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ⚠️ IMPORTANTE: Configurar CORS para permitir frontend
  app.enableCors({
    origin: 'http://localhost:5174', // Puerto del frontend Vite
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

## 🔑 **JWT Configuration**

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // ⚠️ Usar variable de entorno
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      userType: payload.userType 
    };
  }
}
```

## 📝 **Checklist de Implementación**

### **Backend (NestJS + MongoDB)**
- [ ] Professional schema/model creado
- [ ] ProfessionalsController con endpoints
- [ ] ProfessionalsService con lógica de negocio
- [ ] DTOs de validación
- [ ] JWT Authentication configurado
- [ ] CORS habilitado para localhost:5174
- [ ] MongoDB conexión funcionando

### **Frontend (React + TypeScript)**
- [x] authService.registerProfessional()
- [x] profileService.updateProfile()
- [x] CompleteProfilePage component
- [x] Rutas configuradas
- [ ] Remover simulación de desarrollo
- [ ] Testing con backend real

## 🧪 **Cómo Probar la Conexión**

1. **Verificar backend:** `curl http://localhost:3000/professionals`
2. **Verificar CORS:** Desde la consola del navegador en localhost:5174
3. **Test registro:** Usar formulario de registro profesional
4. **Test perfil:** Completar datos en /profile/complete
5. **Verificar MongoDB:** Comprobar que se guardaron los datos