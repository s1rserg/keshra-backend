import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CallSignalDto {
  @IsNumber()
  @Type(() => Number)
  partnerId: number;

  @IsNotEmpty()
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
}
