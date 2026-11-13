import React from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { Button, Toggle } from './ui';

export const RowActions: React.FC<{
  active?: boolean;
  onToggle?: (v: boolean) => void;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ active, onToggle, onUp, onDown, onEdit, onDelete }) => (
  <div className="flex items-center gap-1 shrink-0">
    {onToggle && <Toggle checked={!!active} onChange={onToggle} />}
    <Button variant="ghost" size="sm" onClick={onUp} aria-label="উপরে">
      <ArrowUp className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={onDown} aria-label="নিচে">
      <ArrowDown className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={onEdit} aria-label="এডিট">
      <Pencil className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={onDelete} aria-label="মুছুন">
      <Trash2 className="w-4 h-4 text-red-500" />
    </Button>
  </div>
);
