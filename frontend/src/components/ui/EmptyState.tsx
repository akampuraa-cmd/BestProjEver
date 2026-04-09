import { Inbox } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title = 'No data', message = 'Nothing to display yet.', action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox size={48} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-md">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
