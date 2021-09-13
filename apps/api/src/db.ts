import { initDb } from 'mongodb2';
import { config } from 'config';

export const {
  createCollection,
  connect,
  withTransaction,
  getAllCollection,
  disconnect,
} = initDb({
  collections: () => [
    
    // APPEND
  ],
  uri: config.mongodb.url,
  dbName: config.mongodb.dbName,
});
