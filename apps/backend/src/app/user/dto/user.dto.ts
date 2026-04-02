export class UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  // S3 Avatar - store public S3 URL directly
  avatarUrl?: string; // Public S3 URL for avatar (e.g., "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/avatars/uuid.jpg")
}
