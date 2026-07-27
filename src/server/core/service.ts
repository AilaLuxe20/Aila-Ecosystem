import { AuthorizationError } from "@/lib/errors/app-error";
import { createLogger, type Logger } from "@/lib/logger/logger";
import { measure } from "@/lib/logger/performance";
import { canAccess } from "@/lib/auth/can-access";
import type { UserRole } from "@/types/auth";

import type { Actor } from "@/server/http/context";

import type { Entity, Page, QueryOptions } from "./domain";
import type { Repository } from "./repository";

/**
 * The service layer.
 *
 * Services own business rules and authorisation. Route handlers stay thin —
 * they translate HTTP to a service call and back — and repositories stay
 * ignorant of who is asking. Putting permission checks here rather than in the
 * handler means every caller is covered, including server actions and
 * background jobs that never touch an HTTP route.
 */

/** Shared service behaviour over a single aggregate. */
export abstract class BaseService<T extends Entity, TCreate, TUpdate> {
  /** Logger scoped to this service. */
  protected readonly logger: Logger;

  /**
   * @param repository - Persistence for this aggregate.
   * @param serviceName - Scope used for logging and error context.
   */
  constructor(
    protected readonly repository: Repository<T, TCreate, TUpdate>,
    protected readonly serviceName: string,
  ) {
    this.logger = createLogger(`service.${serviceName}`);
  }

  /**
   * Product key gating this service, checked against the permission matrix.
   *
   * Return `null` for services any authenticated user may reach.
   */
  protected abstract readonly product: string | null;

  /**
   * Asserts that an actor may use this service.
   *
   * @param actor - The calling actor.
   * @throws {AuthorizationError} When the actor's role lacks access.
   */
  protected assertAccess(actor: Actor): void {
    if (this.product === null) return;

    if (!canAccess(actor.role, this.product)) {
      throw new AuthorizationError({
        context: { product: this.product, role: actor.role, service: this.serviceName },
      });
    }
  }

  /**
   * Asserts that an actor holds one of the given roles.
   *
   * @param actor - The calling actor.
   * @param roles - Roles permitted to proceed.
   * @throws {AuthorizationError} When the actor's role is not listed.
   */
  protected assertRole(actor: Actor, roles: readonly UserRole[]): void {
    if (!roles.includes(actor.role)) {
      throw new AuthorizationError({
        context: { required: roles, actual: actor.role, service: this.serviceName },
      });
    }
  }

  /**
   * Reads one entity on behalf of an actor.
   *
   * @param actor - The calling actor.
   * @param id - Entity identifier.
   * @returns The entity, or `null` when absent.
   */
  async get(actor: Actor, id: string): Promise<T | null> {
    this.assertAccess(actor);
    return measure(`${this.serviceName}.get`, () => this.repository.findById(id), { id });
  }

  /**
   * Reads a page of entities on behalf of an actor.
   *
   * @param actor - The calling actor.
   * @param options - Filtering, sorting, and paging.
   * @returns The matching page.
   */
  async list(actor: Actor, options?: QueryOptions<T>): Promise<Page<T>> {
    this.assertAccess(actor);
    return measure(`${this.serviceName}.list`, () => this.repository.findMany(options));
  }

  /**
   * Creates an entity on behalf of an actor.
   *
   * @param actor - The calling actor.
   * @param input - Creation payload.
   * @returns The created entity.
   */
  async create(actor: Actor, input: TCreate): Promise<T> {
    this.assertAccess(actor);

    const entity = await measure(`${this.serviceName}.create`, () =>
      this.repository.create(input),
    );

    this.logger.info("Entity created.", { id: entity.id, actorId: actor.userId });
    return entity;
  }

  /**
   * Updates an entity on behalf of an actor.
   *
   * @param actor - The calling actor.
   * @param id - Entity identifier.
   * @param input - Fields to change.
   * @returns The updated entity.
   */
  async update(actor: Actor, id: string, input: TUpdate): Promise<T> {
    this.assertAccess(actor);

    const entity = await measure(
      `${this.serviceName}.update`,
      () => this.repository.update(id, input),
      { id },
    );

    this.logger.info("Entity updated.", { id, actorId: actor.userId });
    return entity;
  }

  /**
   * Removes an entity on behalf of an actor.
   *
   * @param actor - The calling actor.
   * @param id - Entity identifier.
   */
  async remove(actor: Actor, id: string): Promise<void> {
    this.assertAccess(actor);

    await measure(`${this.serviceName}.remove`, () => this.repository.delete(id), { id });
    this.logger.info("Entity removed.", { id, actorId: actor.userId });
  }
}
