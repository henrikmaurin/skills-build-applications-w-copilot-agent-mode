import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  itemsKey: string;
  emptyMessage: string;
  renderItems: (items: T[]) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, itemsKey, emptyMessage, renderItems }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);
    getJson<Record<string, unknown>>(endpoint)
      .then((response) => {
        const result = response[itemsKey];
        if (!Array.isArray(result)) throw new Error('The server returned an invalid response');
        if (active) setItems(result as T[]);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unknown error');
      });
    return () => { active = false; };
  }, [endpoint, itemsKey]);

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
