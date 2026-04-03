const JobSelector = ({ jobs, selectedJobId, onChange, recordedJobIds = [] }) => {
  return (
    <div className="job-selector-container">
      {jobs.map((job) => (
        <div
          key={job.id}
          className={`job-selector-card${selectedJobId === job.id ? ' is-selected' : ''}${recordedJobIds.includes(job.id) ? ' is-recorded' : ''}`}
          onClick={() => onChange(job.id)}
        >
          <div className="job-selector-dot" style={{ backgroundColor: job.color }} />
          <div className="job-selector-inner">
            <span className="job-selector-name">
              {job.name}
              {selectedJobId === job.id && <span className="job-selector-badge">編集中</span>}
              {recordedJobIds.includes(job.id) && <span className='job-selector-check'>✓</span>}
            </span>
            {job.hourlyRate > 0 && (
              <span className="job-selector-rate">
                ¥{job.hourlyRate.toLocaleString()}/h
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobSelector;

