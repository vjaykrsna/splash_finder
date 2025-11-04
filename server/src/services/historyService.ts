import { Types } from 'mongoose';
import { SearchRecord } from '../models/SearchRecord.js';

export interface HistoryItem {
  term: string;
  timestamp: string;
  resultCount: number;
}

export interface FetchHistoryInput {
  userId: string;
  limit?: number;
  cursor?: string;
}

export interface FetchHistoryResult {
  searches: HistoryItem[];
}

const DEFAULT_LIMIT = 20;

export const fetchUserHistory = async ({ userId, limit = DEFAULT_LIMIT, cursor }: FetchHistoryInput): Promise<FetchHistoryResult> => {
  const effectiveLimit = Number.isFinite(limit) && limit > 0 && limit <= 100 ? Math.floor(limit) : DEFAULT_LIMIT;

  const query: any = { userId: new Types.ObjectId(userId) };

  if (cursor) {
    // Assume cursor is a timestamp string, fetch after that
    const cursorDate = new Date(cursor);
    if (!isNaN(cursorDate.getTime())) {
      query.timestamp = { $lt: cursorDate };
    }
  }

  const records = await SearchRecord.find(query)
    .sort({ timestamp: -1 })
    .limit(effectiveLimit)
    .lean();

  const searches: HistoryItem[] = records.map(record => ({
    term: record.rawTerm,
    timestamp: record.timestamp.toISOString(),
    resultCount: record.resultCount
  }));

  return { searches };
};
