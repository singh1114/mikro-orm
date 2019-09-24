import { EntityManager, FindOneOptions, FindOneOrFailOptions, FindOptions } from '../EntityManager';
import { EntityData, EntityName, IEntity, IEntityType, IPrimaryKey } from '../decorators';
import { QueryBuilder, QueryOrderMap } from '../query';
import { FilterQuery, IdentifiedReference, Reference } from '..';

export class EntityRepository<T extends IEntityType<T>> {

  constructor(private readonly em: EntityManager,
              protected readonly entityName: EntityName<T>) { }

  persist(entity: T | IEntity[], flush = this.em.config.get('autoFlush')): void | Promise<void> {
    return this.em.persist(entity, flush);
  }

  async persistAndFlush(entity: IEntity | IEntity[]): Promise<void> {
    await this.em.persistAndFlush(entity);
  }

  persistLater(entity: IEntity | IEntity[]): void {
    this.em.persistLater(entity);
  }

  createQueryBuilder(alias?: string): QueryBuilder {
    return this.em.createQueryBuilder(this.entityName, alias);
  }

  async findOne(where: FilterQuery<T> | IPrimaryKey, populate?: string[] | boolean, orderBy?: QueryOrderMap): Promise<T | null>; // tslint:disable-next-line:lines-between-class-members
  async findOne(where: FilterQuery<T> | IPrimaryKey, populate?: FindOneOptions, orderBy?: QueryOrderMap): Promise<T | null>; // tslint:disable-next-line:lines-between-class-members
  async findOne(where: FilterQuery<T> | IPrimaryKey, populate: string[] | boolean | FindOneOptions = [], orderBy?: QueryOrderMap): Promise<T | null> {
    return this.em.findOne<T>(this.entityName, where, populate as string[], orderBy);
  }

  async findOneOrFail(where: FilterQuery<T> | IPrimaryKey, populate?: string[] | boolean, orderBy?: QueryOrderMap): Promise<T>; // tslint:disable-next-line:lines-between-class-members
  async findOneOrFail(where: FilterQuery<T> | IPrimaryKey, populate?: FindOneOrFailOptions, orderBy?: QueryOrderMap): Promise<T>; // tslint:disable-next-line:lines-between-class-members
  async findOneOrFail(where: FilterQuery<T> | IPrimaryKey, populate: string[] | boolean | FindOneOrFailOptions = [], orderBy?: QueryOrderMap): Promise<T> {
    return this.em.findOneOrFail<T>(this.entityName, where, populate as string[], orderBy);
  }

  async find(where: FilterQuery<T> | IPrimaryKey, options?: FindOptions): Promise<T[]>; // tslint:disable-next-line:lines-between-class-members
  async find(where: FilterQuery<T> | IPrimaryKey, populate?: string[] | boolean, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<T[]>; // tslint:disable-next-line:lines-between-class-members
  async find(where: FilterQuery<T> | IPrimaryKey, populate: string[] | boolean | FindOptions = [], orderBy: QueryOrderMap = {}, limit?: number, offset?: number): Promise<T[]> {
    return this.em.find<T>(this.entityName, where as FilterQuery<T>, populate as string[], orderBy, limit, offset);
  }

  async findAndCount(where: FilterQuery<T> | IPrimaryKey, options?: FindOptions): Promise<[T[], number]>; // tslint:disable-next-line:lines-between-class-members
  async findAndCount(where: FilterQuery<T> | IPrimaryKey, populate?: string[] | boolean, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<[T[], number]>; // tslint:disable-next-line:lines-between-class-members
  async findAndCount(where: FilterQuery<T> | IPrimaryKey, populate: string[] | boolean | FindOptions = [], orderBy: QueryOrderMap = {}, limit?: number, offset?: number): Promise<[T[], number]> {
    return this.em.findAndCount<T>(this.entityName, where as FilterQuery<T>, populate as string[], orderBy, limit, offset);
  }

  async findAll(options?: FindOptions): Promise<T[]>; // tslint:disable-next-line:lines-between-class-members
  async findAll(populate?: string[] | boolean | true, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<T[]>; // tslint:disable-next-line:lines-between-class-members
  async findAll(populate: string[] | boolean | true | FindOptions = [], orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<T[]> {
    return this.em.find<T>(this.entityName, {}, populate as string[], orderBy, limit, offset);
  }

  remove(where: T | FilterQuery<T> | IPrimaryKey, flush = this.em.config.get('autoFlush')): void | Promise<number> {
    return this.em.remove(this.entityName, where, flush);
  }

  async removeAndFlush(entity: IEntity): Promise<void> {
    await this.em.removeAndFlush(entity);
  }

  removeLater(entity: IEntity): void {
    this.em.removeLater(entity);
  }

  async flush(): Promise<void> {
    return this.em.flush();
  }

  async nativeInsert(data: EntityData<T>): Promise<IPrimaryKey> {
    return this.em.nativeInsert(this.entityName, data);
  }

  async nativeUpdate(where: FilterQuery<T>, data: EntityData<T>): Promise<number> {
    return this.em.nativeUpdate(this.entityName, where, data);
  }

  async nativeDelete(where: FilterQuery<T> | any): Promise<number> {
    return this.em.nativeDelete(this.entityName, where);
  }

  map(result: EntityData<T>): T {
    return this.em.map(this.entityName, result);
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.em.aggregate(this.entityName, pipeline);
  }

  /**
   * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
   */
  getReference<PK extends keyof T>(id: IPrimaryKey, wrapped: true): IdentifiedReference<T, PK>; // tslint:disable-next-line:lines-between-class-members
  getReference(id: IPrimaryKey): T; // tslint:disable-next-line:lines-between-class-members
  getReference(id: IPrimaryKey, wrapped: false): T; // tslint:disable-next-line:lines-between-class-members
  getReference(id: IPrimaryKey, wrapped: true): Reference<T>; // tslint:disable-next-line:lines-between-class-members
  getReference(id: IPrimaryKey, wrapped: boolean): T | Reference<T>; // tslint:disable-next-line:lines-between-class-members
  getReference(id: IPrimaryKey, wrapped = false): T | Reference<T> {
    return this.em.getReference<T>(this.entityName, id, wrapped);
  }

  canPopulate(property: string): boolean {
    return this.em.canPopulate(this.entityName, property);
  }

  /**
   * Creates new instance of given entity and populates it with given data
   */
  create(data: EntityData<T>): T {
    return this.em.create<T>(this.entityName, data);
  }

  async count(where: FilterQuery<T> = {}): Promise<number> {
    return this.em.count(this.entityName, where);
  }

}
