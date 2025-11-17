import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { FileUpload } from '@common/types';

import type {
  CloudinaryDestroyData,
  CloudinaryError,
  CloudinaryUploadData,
  CloudinaryUploadResult,
} from '../types';

import { cloudinaryConfiguration } from '../configs';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(cloudinaryConfiguration.KEY)
    private config: ConfigType<typeof cloudinaryConfiguration>,
  ) {
    cloudinary.config({
      cloud_name: this.config.cloud_name,
      api_key: this.config.api_key,
      api_secret: this.config.api_secret,
      secure: this.config.secure,
    });
  }

  async upload(file: FileUpload, assetFolder: string): Promise<CloudinaryUploadResult> {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: assetFolder,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error?: CloudinaryError, result?: CloudinaryUploadData) => {
          if (error) {
            return reject(new Error(error.message));
          }
          if (!result || !result.asset_id) {
            return reject(new Error('Cloudinary upload failed: missing critical data (asset_id).'));
          }

          const mappedResult: CloudinaryUploadResult = {
            assetId: result.asset_id,
            publicId: result.public_id,
            format: result.format ?? '',
            resourceType: result.resource_type,
            createdAt: new Date(result.created_at),
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            assetFolder: result.folder ?? '',
            displayName: result.original_filename ?? result.public_id,
            secureUrl: result.secure_url,
          };
          resolve(mappedResult);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async delete(publicId: string, resourceType: string): Promise<void> {
    try {
      const result = (await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      })) as CloudinaryDestroyData;

      if (result?.result !== 'ok' && result?.result !== 'not found') {
        throw new Error(`Failed to delete from Cloudinary: ${result?.result ?? 'unknown_error'}`);
      }
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
