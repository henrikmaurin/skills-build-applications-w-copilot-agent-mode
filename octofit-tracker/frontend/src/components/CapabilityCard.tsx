import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  loadItems: () => Promise<T[]>;
  emptyMessage: string;
  renderItems: (items: T[]) => ReactNode;
};

export function CapabilityCard<T>({ title, description, loadItems, emptyMessage, renderItems }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);
    loadItems()
      .then((result) => {
        if (!Array.isArray(result)) throw new Error('The server returned an invalid response');
        if (active) setItems(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unknown error');
      });
    return () => { active = false; };
  }, [loadItems]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {error
      ? <p role="alert">Unable to load {title}: {error}</p>
      : items === null
        ? <p role="status">Loading {title.toLowerCase()}...</p>
        : items.length === 0
          ? <p role="status">{emptyMessage}</p>
          : renderItems(items)}
  </div></section>;
}
