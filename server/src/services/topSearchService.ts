import { SearchRecord } from '../models/SearchRecord.js';

export interface TopSearchTerm {
  term: string;
  count: number;
}

const DEFAULT_LIMIT = 5;

interface AggregatedTopSearch {
  _id: string;
  count: number;
}

export const fetchTopSearchTerms = async (limit: number = DEFAULT_LIMIT): Promise<TopSearchTerm[]> => {
  const effectiveLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const pipeline = [
    { $group: { _id: '$term', count: { $sum: 1 } } },
    { $sort: { count: -1 as const, _id: 1 as const } },
    { $limit: effectiveLimit }
  ];

  const results = (await SearchRecord.aggregate<AggregatedTopSearch>(pipeline)).filter(Boolean);

  return results.map((item: AggregatedTopSearch) => ({
    term: item._id,
    count: item.count
  }));
};
