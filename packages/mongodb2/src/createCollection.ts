import { Db, IndexSpecification } from 'mongodb';
import { CustomDbCollection, DbCollection } from './types';
import { dbSessionStorage } from './dbSessionStorage';

function _pick(obj: any, fields: any[]) {
  const ret: any = {};
  fields.forEach(field => {
    ret[field] = obj[field];
  });
  return ret;
}

export function initCreateCollection(getDb: () => Db) {
  return function createCollection<T>(
    collectionName: string,
    indexes?: IndexSpecification[]
  ) {
    const _getCollection = () => {
      return getDb().collection<T>(collectionName);
    };

    const exec = (
      name: Exclude<keyof DbCollection<any>, keyof CustomDbCollection<any>>,
      n: number,
      args: any[]
    ) => {
      if (!args[n - 1]) {
        args[n - 1] = {};
      }
      args[n - 1]!.session = dbSessionStorage.getStore();
      const collection = _getCollection();
      const fn: any = collection[name].bind(collection);
      return fn(...args);
    };

    const ret: DbCollection<T> = {
      aggregate(...args) {
        return exec('aggregate', 2, args);
      },
      bulkWrite(...args) {
        return exec('bulkWrite', 2, args);
      },
      countDocuments(...args) {
        return exec('countDocuments', 2, args);
      },
      createIndex(...args) {
        return exec('createIndex', 2, args);
      },
      createIndexes(...args) {
        return exec('createIndexes', 2, args);
      },
      deleteMany(...args) {
        return exec('deleteMany', 2, args);
      },
      deleteOne(...args) {
        return exec('deleteOne', 2, args);
      },
      distinct(...args: any[]) {
        return exec('distinct', 3, args);
      },
      drop(...args) {
        return exec('drop', 1, args);
      },
      dropIndexes(...args) {
        return exec('dropIndexes', 1, args);
      },
      estimatedDocumentCount(...args) {
        return exec('estimatedDocumentCount', 2, args);
      },
      find(...args: any[]) {
        return exec('find', 2, args);
      },
      findOne(...args) {
        return exec('findOne', 2, args);
      },
      findOneAndDelete(...args) {
        return exec('findOneAndDelete', 2, args);
      },
      findOneAndReplace(...args) {
        return exec('findOneAndReplace', 3, args);
      },
      findOneAndUpdate(...args) {
        return exec('findOneAndUpdate', 3, args);
      },
      geoHaystackSearch(...args) {
        return exec('geoHaystackSearch', 3, args);
      },
      indexes(...args) {
        return exec('indexes', 1, args);
      },
      indexExists(...args) {
        return exec('indexExists', 2, args);
      },
      indexInformation(...args) {
        return exec('indexInformation', 1, args);
      },
      initializeOrderedBulkOp(...args) {
        return exec('initializeOrderedBulkOp', 1, args);
      },
      initializeUnorderedBulkOp(...args) {
        return exec('initializeUnorderedBulkOp', 1, args);
      },
      insertMany(...args) {
        return exec('insertMany', 2, args);
      },
      insertOne(...args) {
        return exec('insertOne', 2, args);
      },
      isCapped(...args) {
        return exec('isCapped', 1, args);
      },
      listIndexes(...args) {
        return exec('listIndexes', 1, args);
      },
      mapReduce(...args) {
        return exec('mapReduce', 3, args);
      },
      options(...args) {
        return exec('options', 1, args);
      },
      parallelCollectionScan(...args) {
        return exec('parallelCollectionScan', 1, args);
      },
      reIndex(...args) {
        return exec('reIndex', 1, args);
      },
      replaceOne(...args) {
        return exec('replaceOne', 3, args);
      },
      stats(...args) {
        return exec('stats', 1, args);
      },
      updateMany(...args) {
        return exec('updateMany', 3, args);
      },
      updateOne(...args) {
        return exec('updateOne', 3, args);
      },
      watch(...args: any[]) {
        return exec('watch', Array.isArray(args[0]) ? 2 : 1, args);
      },

      // custom methods
      findAll(query, options) {
        return this.find(query, options).toArray();
      },
      findById(id, options) {
        return this.findOne(
          {
            _id: id,
          } as any,
          options
        );
      },
      findByIdOrThrow(id, options) {
        return this.findOneOrThrow(
          {
            _id: id,
          } as any,
          options
        );
      },
      async findOneOrThrow(...args) {
        const ret = await exec('findOne', 2, args);
        if (!ret) {
          throw new Error(
            `Entity ${JSON.stringify(args[0])} not found in ${collectionName}`
          );
        }
        return ret;
      },
      deleteById(id, options) {
        return this.deleteOne(
          {
            _id: id as any,
          },
          options
        );
      },
      async update(model: any, fields, options) {
        if (model._id == null) {
          throw new Error('_id not defined');
        }
        await this.findOneAndUpdate(
          {
            _id: model._id,
          },
          {
            $set: _pick(model, fields),
          },
          options
        );
      },
    };

    (ret as any).initIndex = () => {
      if (!indexes || indexes.length === 0) {
        return;
      }
      return _getCollection().createIndexes(indexes);
    };
    (ret as any).createCollection = () => {
      return getDb()
        .createCollection(collectionName)
        .catch(() => {
          // ignore
        });
    };

    return ret;
  };
}
