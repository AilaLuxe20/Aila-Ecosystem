"use client";

import { AlertTriangle } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogContentProps,
} from "./Dialog";
import type { Tone } from "./variants";

/**
 * Composed modal patterns.
 *
 * {@link Dialog} is the primitive; these are the two shapes that account for
 * most modal usage, packaged so they are not rebuilt on every screen.
 */

/** Props for {@link Modal}. */
export interface ModalProps {
  /** Whether the modal is visible. */
  readonly open: boolean;
  /** Called when the modal requests to close. */
  readonly onOpenChange: (open: boolean) => void;
  /** Heading text. */
  readonly title: string;
  /** Supporting text beneath the title. */
  readonly description?: string;
  /** Body content. */
  readonly children?: React.ReactNode;
  /** Actions rendered in the footer. */
  readonly footer?: React.ReactNode;
  /** Surface width. Defaults to `"md"`. */
  readonly size?: DialogContentProps["size"];
  /** Prevents closing via backdrop click or `Escape`. */
  readonly dismissible?: boolean;
}

/**
 * A controlled modal with a standard header, body, and footer.
 *
 * Set `dismissible={false}` for a modal the user must resolve deliberately —
 * it suppresses both the backdrop click and the `Escape` key, which are
 * otherwise easy to trigger by accident mid-task.
 *
 * @param props - Open state, content, footer, and sizing.
 * @returns The modal element.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: ModalProps): React.JSX.Element {
  const blockDismiss = useCallback(
    (event: Event) => {
      if (!dismissible) event.preventDefault();
    },
    [dismissible],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size={size}
        hideCloseButton={!dismissible}
        onEscapeKeyDown={blockDismiss}
        onPointerDownOutside={blockDismiss}
        onInteractOutside={blockDismiss}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {children ? <DialogBody>{children}</DialogBody> : null}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

/** Props for {@link ConfirmDialog}. */
export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Heading, phrased as the question being asked. */
  readonly title: string;
  /** Explains the consequence, especially anything irreversible. */
  readonly description: string;
  /** Label for the confirming action. Defaults to `"Confirm"`. */
  readonly confirmLabel?: string;
  /** Label for the cancelling action. Defaults to `"Cancel"`. */
  readonly cancelLabel?: string;
  /** Severity. `"danger"` renders a destructive confirm button. */
  readonly tone?: Extract<Tone, "brand" | "danger" | "warning">;
  /** Runs on confirm. The dialog stays open and busy until it settles. */
  readonly onConfirm: () => void | Promise<void>;
}

/**
 * A confirmation prompt for consequential actions.
 *
 * An async `onConfirm` keeps the dialog open and the button in a loading state
 * until it settles, so the user is not left wondering whether a slow delete
 * actually registered. The dialog closes only on success.
 *
 * @param props - Open state, copy, tone, and the confirm handler.
 * @returns The confirmation dialog.
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   tone="danger"
 *   title="Delete workspace?"
 *   description="This permanently removes all projects. It cannot be undone."
 *   confirmLabel="Delete"
 *   onConfirm={() => deleteWorkspace(id)}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "brand",
  onConfirm,
}: ConfirmDialogProps): React.JSX.Element {
  const [pending, setPending] = useState(false);

  const handleConfirm = useCallback(async () => {
    setPending(true);

    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }, [onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent size="sm" hideCloseButton>
        <DialogHeader className="pe-6">
          <div className="flex items-start gap-3">
            {tone !== "brand" ? (
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-4",
                  tone === "danger" ? "bg-danger/12 text-danger" : "bg-warning/12 text-warning",
                )}
              >
                <AlertTriangle />
              </span>
            ) : null}

            <div className="space-y-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>

          <Button
            variant={tone === "danger" ? "destructive" : "primary"}
            loading={pending}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
