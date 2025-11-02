import { Schema, Types, model, type Document, type Model } from 'mongoose';

export interface UnsplashImageSnapshot {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  description?: string | null;
  photographer?: string | null;
}

export interface SearchRecordAttributes {
  userId: Types.ObjectId;
  term: string;
  rawTerm: string;
  resultCount: number;
  unsplashResponse?: UnsplashImageSnapshot[];
}

export interface SearchRecordDocument
  extends Document<unknown, any, SearchRecordAttributes>,
    SearchRecordAttributes {
  timestamp: Date;
  updatedAt: Date;
}

export interface SearchRecordModel extends Model<SearchRecordDocument> {
  recordSearch(payload: SearchRecordAttributes): Promise<SearchRecordDocument>;
}

const UnsplashSnapshotSchema = new Schema<UnsplashImageSnapshot>(
  {
    id: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    fullUrl: { type: String, required: true },
    description: { type: String, default: null },
    photographer: { type: String, default: null }
  },
  { _id: false }
);

const SearchRecordSchema = new Schema<SearchRecordDocument, SearchRecordModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'OAuthUser',
      required: true,
      index: true
    },
    term: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    rawTerm: {
      type: String,
      required: true,
      trim: true
    },
    resultCount: {
      type: Number,
      required: true,
      min: 0
    },
    unsplashResponse: {
      type: [UnsplashSnapshotSchema],
      default: undefined
    }
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: 'updatedAt' }
  }
);

SearchRecordSchema.index({ userId: 1, timestamp: -1 });
SearchRecordSchema.index({ term: 'text' }, { weights: { term: 1 } });

SearchRecordSchema.statics.recordSearch = async function recordSearch(
  payload: SearchRecordAttributes
): Promise<SearchRecordDocument> {
  const document = new this({
    userId: payload.userId,
    term: payload.term,
    rawTerm: payload.rawTerm,
    resultCount: payload.resultCount,
    unsplashResponse: payload.unsplashResponse
  });

  return await document.save();
};

export const SearchRecord = model<SearchRecordDocument, SearchRecordModel>('SearchRecord', SearchRecordSchema);
