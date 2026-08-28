/**
 * Decide whether a streamed assistant reply should be written to the database.
 *
 * Persistence is the commit. The client `done` event is only a notification.
 * That way a completed generation is not lost if the browser disconnects
 * between the DB write and the final SSE event.
 *
 * A. Normal completion — persist once, then notify `done`.
 * B. Client abort before provider `[DONE]` — do not persist (partial).
 * C. Client abort after provider `[DONE]` — persist once; still notify `done`
 *    if the stream is writable. The UI reconciles from the server if notify
 *    does not arrive.
 * D. Network disconnect after persistence — do not persist again. The turn
 *    is already in the database; the client reloads that conversation.
 * E. Provider failure — do not persist.
 *
 * The Message model has no cancelled flag, so partial assistant turns are
 * never stored. Persist is invoked at most once per request.
 */

export type StreamPersistReason =
  | "aborted"
  | "empty"
  | "provider_error"
  | "incomplete";

export type StreamPersistDecision =
  | { persist: true; reply: string }
  | { persist: false; reason: StreamPersistReason };

export function decideStreamPersistence(options: {
  aborted: boolean;
  providerError: boolean;
  streamCompleted: boolean;
  accumulated: string;
}): StreamPersistDecision {
  if (options.providerError) {
    return { persist: false, reason: "provider_error" };
  }

  const reply = options.accumulated.trim();

  if (options.streamCompleted && reply) {
    return { persist: true, reply };
  }

  if (options.aborted) {
    return { persist: false, reason: "aborted" };
  }

  if (!options.streamCompleted) {
    return { persist: false, reason: "incomplete" };
  }

  return { persist: false, reason: "empty" };
}
