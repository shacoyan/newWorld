import React from 'react';

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

  const getCardStyle = (jobId) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: selectedJobId === jobId ? '3px solid #1976d2' : '2px solid #e0e0e0',
    backgroundColor: selectedJobId === jobId ? '#e3f2fd' : '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: selectedJobId === jobId ? '0 2px 8px rgba(25, 118, 210, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
  });

  const colorDotStyle = (color) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  });

  const infoStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const nameStyle = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
  };

  const hourlyRateStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
  };

  const selectedBadgeStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1976d2',
    marginLeft: '8px',
  };

  const handleClick = (jobId) => {
    onChange(jobId);
  };

  return (
    <div style={containerStyle}>
      {allJobs.map((job) => (
        <div
          key={job.id ?? 'default'}
          style={getCardStyle(job.id)}
          onClick={() => handleClick(job.id)}
          onMouseEnter={(e) => {
            if (selectedJobId !== job.id) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#bdbdbd';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedJobId !== job.id) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }
          }}
        >
          <div style={colorDotStyle(job.color)} />
          <div style={infoStyle}>
            <span style={nameStyle}>
              {job.name}
              {selectedJobId === job.id && <span style={selectedBadgeStyle}>選択中</span>}
            </span>
            {job.hourlyRate !== null && (
              <span style={hourlyRateStyle}>
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
