import { Button } from './Button';

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-line-strong bg-raised px-4 py-3"
    >
      <span>{message}</span>
      <Button onClick={onDismiss}>Dismiss</Button>
    </div>
  );
}
