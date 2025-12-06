import { FC } from 'react';
import { Archive, Mail, Copy, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface ActionButtonsProps {
  onArchive: () => void;
  onEmail: () => void;
  onCopy: () => void;
  onContinue: () => void;
}

export const ActionButtons: FC<ActionButtonsProps> = ({
  onArchive,
  onEmail,
  onCopy,
  onContinue,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-end items-center mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex gap-2 w-full sm:w-auto">
         <Button variant="outline" onClick={onCopy} className="flex-1 sm:flex-none">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
         </Button>
         <Button variant="outline" onClick={onEmail} className="flex-1 sm:flex-none">
            <Mail className="w-4 h-4 mr-2" />
            Email
         </Button>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="secondary" onClick={onArchive} className="flex-1 sm:flex-none bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 border-none text-slate-800 dark:text-slate-200">
            <Archive className="w-4 h-4 mr-2" />
            Archive Case
        </Button>
        <Button onClick={onContinue} className="flex-1 sm:flex-none">
            Next Case
            <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
