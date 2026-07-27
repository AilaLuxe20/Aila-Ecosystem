import { NotFoundError } from "@/lib/errors/app-error";

import type { Entity, Page, QueryOptions } from "./domain";

/**
 * The persistence contract.
 *
 * Services depend on this interface rather than on a concrete database client,
 * which is what keeps business logic testable and the storage engine
 * replaceable.
 */

/** Read and write operations over an aggregate. */
export interface Repository<T extends Entity, TCreate, TUpdate> {
  /**
   * Finds one entity by identifier.
   *
   * @param id - Entity identifier.
   * @returns The entity, or `null` when absent.
   */
  findById(id: string): Promise<T | null>;

  /**
   * Finds a page of entities.
   *
   * @param options - Filtering, sorting, and paging.
   * @returns The matching page.
   */
  findMany(options?: QueryOptions<T>): Promise<Page<T>>;

  /**
   * Counts entities matching the filters.
   *
   * @param options - Filtering options.
   * @returns The match count.
   */
  count(options?: QueryOptions<T>): Promise<number>;

  /**
   * Persists a new entity.
   *
   * @param input - Creation payload.
   * @returns The created entity.
   */
  create(input: TCreate): Promise<T>;

  /**
   * Applies a partial update.
   *
   * @param id - Entity identifier.
   * @param input - Fields to change.
   * @returns The updated entity.
   */
  update(id: string, input: TUpdate): Promise<T>;

  /**
   * Removes an entity.
   *
   * @param id - Entity identifier.
   */
  delete(id: string): Promise<void>;
}

/**
 * Shared repository behaviour.
 *
 * Concrete repositories implement the abstract members against their storage
 * engine; everything expressible in terms of those members lives here so it is
 * written once.
 */
export abstract class BaseRepository<T extends Entity, TCreate, TUpdate>
  implements Repository<T, TCreate, TUpdate>
{
  /** Human-readable name used in error messages. */
  protected abstract readonly entityName: string;

  /** @inheritdoc */
  abstract findById(id: string): Promise<T | null>;

  /** @inheritdoc */
  abstract findMany(options?: QueryOptions<T>): Promise<Page<T>>;

  /** @inheritdoc */
  abstract count(options?: QueryOptions<T>): Promise<number>;

  /** @inheritdoc */
  abstract create(input: TCreate): Promise<T>;

  /** @inheritdoc */
  abstract update(id: string, input: TUpdate): Promise<T>;

  /** @inheritdoc */
  abstract delete(id: string): Promise<void>;

  /**
   * Finds an entity, throwing when it does not exist.
   *
   * Prefer this in service code: it removes the null check at every call site
   * and produces a consistent 404 rather than an ad-hoc one.
   *
   * @param id - Entity identifier.
   * @returns The entity.
   * @throws {NotFoundError} When no entity has that identifier.
   */
  async findByIdOrThrow(id: string): Promise<T> {
    const entity = await this.findById(id);

    if (!entity) {
      throw new NotFoundError(this.entityName, { context: { id } });
    }

    return entity;
  }

  /**
   * Reports whether an entity exists.
   *
   * @param id - Entity identifier.
   * @returns True when the entity exists.
   */
  async exists(id: string): Promise<boolean> {
    return (await this.findById(id)) !== null;
  }

  /**
   * Finds the first entity matching the options.
   *
   * @param options - Filtering and sorting.
   * @returns The first match, or `null`.
   */
  async findFirst(options?: QueryOptions<T>): Promise<T | null> {
    const page = await this.findMany({
      ...options,
      page: { page: 1, pageSize: 1 },
    });

    return page.items[0] ?? null;
  }
}
