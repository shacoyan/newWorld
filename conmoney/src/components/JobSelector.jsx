const JobSelector = ({ jobs, selectedJobId, onChange, recordedJobIds = [] }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const handleClick = (jobId) => {
    onChange(jobId);
  };

  return (
    <div style={containerStyle}>
      {jobs.map((job) => (
        <div
          key={job.id}
          className={`job-selector-card${selectedJobId === job.id ? ' is-selected' : ''}${recordedJobIds.includes(job.id) ? ' is-recorded' : ''}`}
          onClick={() => handleClick(job.id)}
        >
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: job.color, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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