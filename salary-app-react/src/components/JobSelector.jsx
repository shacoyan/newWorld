const JobSelector = ({ jobs, selectedJobId, onChange }) => {
  const defaultOption = {
    id: null,
    name: '未指定（デフォルト）',
    hourlyRate: null,
    color: '#757575'
  };

  const allJobs = [defaultOption, ...jobs];

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
      {allJobs.map((job) => (
        <div
          key={job.id ?? 'default'}
          className={`job-selector-card${selectedJobId === job.id ? ' is-selected' : ''}`}
          onClick={() => handleClick(job.id)}
        >
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: job.color, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="job-selector-name">
              {job.name}
              {selectedJobId === job.id && <span className="job-selector-badge">選択中</span>}
            </span>
            {job.hourlyRate !== null && (
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
