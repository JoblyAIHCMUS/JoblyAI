import { minioClient } from "../../lib/storage";
import {Global, Module} from '@nestjs/common';

export const StorageProviders = [
  {
    provide: 'MINIO_CLIENT',
    useValue: minioClient,
    useFactory: async () => {
      // If any async setup is needed, do it here
      return minioClient;
    }
  },
];

@Global()
@Module({
  providers: [...StorageProviders],
  exports: [...StorageProviders],
})
export class StorageModule {}