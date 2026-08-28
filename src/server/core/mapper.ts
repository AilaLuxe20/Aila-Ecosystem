import type { Entity, Page } from "./domain";

/**
 * Mapping between persistence entities and transport DTOs.
 *
 * Entities may carry fields a client must never see — internal flags, audit
 * columns, foreign keys. A mapper is the single place that decides what crosses
 * the boundary, so adding a sensitive column to a table cannot silently expose
 * it through an API.
 */

/** Converts a domain entity into its transport representation. */
export interface Mapper<TEntity, TDto> {
  /**
   * Maps one entity.
   *
   * @param entity - The domain entity.
   * @returns Its transport representation.
   */
  toDto(entity: TEntity): TDto;
}

/** Fields present on every DTO derived from an {@link Entity}. */
export interface BaseDto {
  readonly id: string;
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
  /** ISO 8601 timestamp. */
  readonly updatedAt: string;
}

/**
 * Shared mapper behaviour, including collection and page mapping.
 *
 * Subclasses implement {@link toDto} only; the rest follows from it.
 */
export abstract class BaseMapper<TEntity extends Entity, TDto extends BaseDto>
  implements Mapper<TEntity, TDto>
{
  /** @inheritdoc */
  abstract toDto(entity: TEntity): TDto;

  /**
   * Maps every entity in a list.
   *
   * @param entities - The entities to map.
   * @returns Their transport representations.
   */
  toDtoList(entities: readonly TEntity[]): TDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  /**
   * Maps a page of entities, preserving its paging metadata.
   *
   * @param page - The page to map.
   * @returns A page of DTOs.
   */
  toDtoPage(page: Page<TEntity>): Page<TDto> {
    return {
      items: this.toDtoList(page.items),
      totalItems: page.totalItems,
      page: page.page,
      pageSize: page.pageSize,
    };
  }

  /**
   * Maps the fields common to every entity.
   *
   * Call this from {@link toDto} and spread the result rather than repeating
   * the timestamp conversion in each subclass.
   *
   * @param entity - The domain entity.
   * @returns The shared DTO fields.
   */
  protected baseFields(entity: TEntity): BaseDto {
    return {
      id: entity.id,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
