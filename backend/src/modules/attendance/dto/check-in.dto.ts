import { IsLatitude, IsLongitude, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
