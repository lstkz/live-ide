import {
  FilterQuery,
  MongoCountPreferences,
  FindOneOptions,
  FindOneAndDeleteOption,
  FindOneAndUpdateOption,
  UpdateQuery,
  FindOneAndReplaceOption,
  CollectionInsertOneOptions,
  InsertOneWriteOpResult,
  Cursor,
  FindAndModifyWriteOpResultObject,
  IndexSpecification,
  DeleteWriteOpResultObject,
  CommonOptions,
  InsertWriteOpResult,
  CollectionInsertManyOptions,
  OptionalId,
  WithId,
  ClientSession,
  CollectionAggregationOptions,
  BulkWriteOperation,
  CollectionBulkWriteOptions,
  BulkWriteOpResultObject,
  IndexOptions,
  MongoDistinctPreferences,
  GeoHaystackSearchOptions,
  OrderedBulkOperation,
  UnorderedBulkOperation,
  ReadPreferenceOrMode,
  CommandCursor,
  CollectionMapFunction,
  CollectionReduceFunction,
  MapReduceOptions,
  ParallelCollectionScanOptions,
  ReplaceOneOptions,
  ReplaceWriteOpResult,
  CollStats,
  UpdateManyOptions,
  UpdateWriteOpResult,
  UpdateOneOptions,
  ChangeStreamOptions,
  ChangeStream,
  AggregationCursor,
} from 'mongodb';
export { ObjectID } from 'mongodb';

type ExtractId<T> = T extends { _id: infer U } ? U : never;

type FlattenIfArray<T> = T extends ReadonlyArray<infer R> ? R : T;

export interface CustomDbCollection<TSchema> {
  findAll<T = TSchema>(
    query: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T[]>;
  findById<T = TSchema>(
    id: ExtractId<T>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T | null>;
  findByIdOrThrow<T = TSchema>(
    id: ExtractId<T>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T>;
  findOneOrThrow<T = TSchema>(
    filter: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T>;
  deleteById<T = TSchema>(
    id: ExtractId<T>,
    options?: CommonOptions
  ): Promise<DeleteWriteOpResultObject>;
  update(
    model: TSchema,
    fields: Array<keyof TSchema>,
    options?: CommonOptions
  ): Promise<void>;
}

export interface DbCollection<TSchema> extends CustomDbCollection<TSchema> {
  aggregate<T = TSchema>(
    pipeline?: object[],
    options?: CollectionAggregationOptions
  ): AggregationCursor<T>;
  bulkWrite(
    operations: Array<BulkWriteOperation<TSchema>>,
    options?: CollectionBulkWriteOptions
  ): Promise<BulkWriteOpResultObject>;
  countDocuments(
    query?: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ): Promise<number>;
  createIndex(
    fieldOrSpec: string | any,
    options?: IndexOptions
  ): Promise<string>;
  createIndexes(
    indexSpecs: IndexSpecification[],
    options?: { session?: ClientSession }
  ): Promise<any>;
  deleteMany(
    filter: FilterQuery<TSchema>,
    options?: CommonOptions
  ): Promise<DeleteWriteOpResultObject>;
  deleteOne(
    filter: FilterQuery<TSchema>,
    options?: CommonOptions
  ): Promise<DeleteWriteOpResultObject>;
  distinct<Key extends keyof WithId<TSchema>>(
    key: Key,
    query?: FilterQuery<TSchema>,
    options?: MongoDistinctPreferences
  ): Promise<Array<FlattenIfArray<WithId<TSchema>[Key]>>>;
  distinct(
    key: string,
    query?: FilterQuery<TSchema>,
    options?: MongoDistinctPreferences
  ): Promise<any[]>;
  drop(options?: { session: ClientSession }): Promise<any>;
  dropIndexes(options?: {
    session?: ClientSession;
    maxTimeMS?: number;
  }): Promise<any>;
  estimatedDocumentCount(
    query?: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ): Promise<number>;
  find<T = TSchema>(query?: FilterQuery<TSchema>): Cursor<T>;
  find<T = TSchema>(
    query: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Cursor<T>;
  findOne<T = TSchema>(
    filter: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T | null>;
  findOneAndDelete(
    filter: FilterQuery<TSchema>,
    options?: FindOneAndDeleteOption<TSchema>
  ): Promise<FindAndModifyWriteOpResultObject<TSchema>>;
  findOneAndReplace(
    filter: FilterQuery<TSchema>,
    replacement: object,
    options?: FindOneAndReplaceOption<TSchema>
  ): Promise<FindAndModifyWriteOpResultObject<TSchema>>;
  findOneAndUpdate(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | TSchema,
    options?: FindOneAndUpdateOption<TSchema>
  ): Promise<FindAndModifyWriteOpResultObject<TSchema>>;
  geoHaystackSearch(
    x: number,
    y: number,
    options?: GeoHaystackSearchOptions
  ): Promise<any>;
  indexes(options?: { session: ClientSession }): Promise<any>;
  indexExists(
    indexes: string | string[],
    options?: { session: ClientSession }
  ): Promise<boolean>;
  indexInformation(options?: {
    full: boolean;
    session: ClientSession;
  }): Promise<any>;
  initializeOrderedBulkOp(options?: CommonOptions): OrderedBulkOperation;
  initializeUnorderedBulkOp(options?: CommonOptions): UnorderedBulkOperation;
  insertMany(
    docs: Array<OptionalId<TSchema>>,
    options?: CollectionInsertManyOptions
  ): Promise<InsertWriteOpResult<WithId<TSchema>>>;
  insertOne(
    docs: OptionalId<TSchema>,
    options?: CollectionInsertOneOptions
  ): Promise<InsertOneWriteOpResult<WithId<TSchema>>>;
  isCapped(options?: { session: ClientSession }): Promise<any>;
  listIndexes(options?: {
    batchSize?: number;
    readPreference?: ReadPreferenceOrMode;
    session?: ClientSession;
  }): CommandCursor;
  mapReduce<TKey, TValue>(
    map: CollectionMapFunction<TSchema> | string,
    reduce: CollectionReduceFunction<TKey, TValue> | string,
    options?: MapReduceOptions
  ): Promise<any>;
  options(options?: { session: ClientSession }): Promise<any>;
  parallelCollectionScan(
    options?: ParallelCollectionScanOptions
  ): Promise<Array<Cursor<any>>>;
  reIndex(options?: { session: ClientSession }): Promise<any>;
  replaceOne(
    filter: FilterQuery<TSchema>,
    doc: TSchema,
    options?: ReplaceOneOptions
  ): Promise<ReplaceWriteOpResult>;
  stats(options?: {
    scale: number;
    session?: ClientSession;
  }): Promise<CollStats>;
  updateMany(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateManyOptions
  ): Promise<UpdateWriteOpResult>;
  updateOne(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateOneOptions
  ): Promise<UpdateWriteOpResult>;
  watch<T = TSchema>(
    pipeline?: object[],
    options?: ChangeStreamOptions & { session?: ClientSession }
  ): ChangeStream<T>;
  watch<T = TSchema>(
    options?: ChangeStreamOptions & { session?: ClientSession }
  ): ChangeStream<T>;
}
