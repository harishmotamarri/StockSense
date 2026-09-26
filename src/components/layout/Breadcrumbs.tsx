import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export function Breadcrumbs() {
  const { currentPath, navigate } = useNavigation();

  const parts = currentPath.split('/').filter(Boolean);

  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'dashboard')) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Dashboard</span>
      </div>
    );
  }

  const formatSegment = (seg: string) => {
    if (seg.startsWith('PRD-') || seg.startsWith('REC-') || seg.startsWith('DO-') || seg.startsWith('TRF-') || seg.startsWith('ADJ-') || seg.startsWith('WH-')) {
      return seg;
    }
    return seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const subPath = `/${parts.slice(0, index + 1).join('/')}`;

        return (
          <React.Fragment key={subPath}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{formatSegment(part)}</span>
            ) : (
              <button
                onClick={() => navigate(subPath)}
                className="hover:text-slate-900 transition hover:underline"
              >
                {formatSegment(part)}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
