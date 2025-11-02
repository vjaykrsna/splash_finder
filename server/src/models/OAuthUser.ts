import { Schema, model, type Document, type Model } from 'mongoose';

export type OAuthProvider = 'google' | 'facebook' | 'github';

export interface OAuthUserAttributes {
  provider: OAuthProvider;
  providerId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export interface OAuthUserDocument extends Document<unknown, any, OAuthUserAttributes>, OAuthUserAttributes {
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthUserModel extends Model<OAuthUserDocument> {
  findOrCreateFromProfile(profile: OAuthUserAttributes): Promise<OAuthUserDocument>;
}

const OAuthUserSchema = new Schema<OAuthUserDocument, OAuthUserModel>(
  {
    provider: {
      type: String,
      required: true,
      enum: ['google', 'facebook', 'github']
    },
    providerId: {
      type: String,
      required: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    avatarUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

OAuthUserSchema.index({ provider: 1, providerId: 1 }, { unique: true });
OAuthUserSchema.index({ email: 1 }, { unique: true, sparse: true });

OAuthUserSchema.pre('save', function preSave(next) {
  if (this.isModified('displayName')) {
    this.displayName = this.displayName.trim();
  }

  if (this.isModified('email') && this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});

OAuthUserSchema.statics.findOrCreateFromProfile = async function findOrCreateFromProfile(
  profile: OAuthUserAttributes
): Promise<OAuthUserDocument> {
  const normalizedProfile = {
    ...profile,
    displayName: profile.displayName.trim(),
    email: profile.email?.trim().toLowerCase()
  } satisfies OAuthUserAttributes;

  const existingUser = await this.findOne({
    provider: normalizedProfile.provider,
    providerId: normalizedProfile.providerId
  });

  if (existingUser) {
    if (
      (normalizedProfile.email && existingUser.email !== normalizedProfile.email) ||
      (normalizedProfile.avatarUrl && existingUser.avatarUrl !== normalizedProfile.avatarUrl) ||
      existingUser.displayName !== normalizedProfile.displayName
    ) {
      existingUser.set({
        email: normalizedProfile.email,
        avatarUrl: normalizedProfile.avatarUrl,
        displayName: normalizedProfile.displayName
      });
      await existingUser.save();
    }

    return existingUser;
  }

  return await this.create(normalizedProfile);
};

export const OAuthUser = model<OAuthUserDocument, OAuthUserModel>('OAuthUser', OAuthUserSchema);
