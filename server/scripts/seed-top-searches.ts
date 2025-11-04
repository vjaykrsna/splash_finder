import mongoose from 'mongoose';
import { SearchRecord } from '../src/models/SearchRecord.js';
import { OAuthUser } from '../src/models/OAuthUser.js';
import { env } from '../src/config/env.js';

const seedTopSearches = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);

    // Create a dummy user
    const user = await OAuthUser.create({
      provider: 'google',
      providerId: 'seed-user',
      displayName: 'Seed User',
      email: 'seed@example.com'
    });

    const searches = [
      { term: 'sunset', rawTerm: 'Sunset', resultCount: 10 },
      { term: 'sunset', rawTerm: 'Sunset', resultCount: 8 },
      { term: 'mountains', rawTerm: 'Mountains', resultCount: 12 },
      { term: 'mountains', rawTerm: 'Mountains', resultCount: 9 },
      { term: 'ocean', rawTerm: 'Ocean', resultCount: 15 },
      { term: 'ocean', rawTerm: 'Ocean', resultCount: 11 },
      { term: 'forest', rawTerm: 'Forest', resultCount: 7 },
      { term: 'forest', rawTerm: 'Forest', resultCount: 6 },
      { term: 'desert', rawTerm: 'Desert', resultCount: 5 },
      { term: 'canyon', rawTerm: 'Canyon', resultCount: 4 }
    ];

    const records = searches.map(search => ({
      userId: user._id,
      ...search,
      timestamp: new Date()
    }));

    await SearchRecord.insertMany(records);

    console.log('Seeded top searches data');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedTopSearches();
