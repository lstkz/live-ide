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
    require('./collections/Template'),
    require('./collections/Workspace'),
    require('./collections/BundleHash'),
    require('./collections/BundleCache'),
    require('./collections/WorkspaceParticipant'),
    // APPEND
  ],
  uri: config.mongodb.url,
  dbName: config.mongodb.dbName,
});
