import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Controller('org')
@UseGuards(AuthGuard)
export class OrgController {}
