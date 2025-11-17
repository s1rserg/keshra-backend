import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({
    description: 'Avatar image file',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
