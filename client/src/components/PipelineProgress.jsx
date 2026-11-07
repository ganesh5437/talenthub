import { PIPELINE, formatStatus } from '../utils/pipeline';

// Horizontal progress tracker for an application's pipeline stage.
const PipelineProgress = ({ status }) => {
  const rejected = status === 'REJECTED';
  const currentIdx = PIPELINE.indexOf(status);

  return (
    <div className="mt-4">
      <div className="flex gap-1">
        {PIPELINE.map((stage, i) => {
          let color = 'bg-slate-200';
          if (rejected) color = 'bg-red-200';
          else if (i <= currentIdx) color = status === 'HIRED' ? 'bg-emerald-500' : 'bg-indigo-500';
          return <div key={stage} title={formatStatus(stage)} className={`h-1.5 flex-1 rounded-full ${color}`} />;
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>Applied</span>
        <span>{rejected ? 'Rejected' : 'Hired'}</span>
      </div>
    </div>
  );
};

export default PipelineProgress;
