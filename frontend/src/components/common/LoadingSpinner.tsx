import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => (
  <div
    className={className}
    style={{
      display: 'inline-block',
      width: 40,
      height: 40,
      border: '4px solid #ccc',
      borderTop: '4px solid #333',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      verticalAlign: 'middle',
    }}
  >
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}
    </style>
  </div>
);

export default LoadingSpinner;