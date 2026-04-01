import React from 'react';

interface RadioGroupProps {
  name: string;
  value: string | null;
  onChange: (val: string | null) => void;
  options: string[];
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ name, value, onChange, options }) => {
  const handleClick = (option: string) => {
    // 既選択を再クリックで選択解除(nullに)
    if (value === option) {
      onChange(null);
    } else {
      onChange(option);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            type="button"
            name={name}
            onClick={() => handleClick(option)}
            className={`px-4 py-2 rounded-md border-2 border-ie-red transition-colors duration-200 ${
              isSelected
                ? 'bg-ie-red text-white'
                : 'bg-transparent text-ie-cream hover:bg-ie-red/20'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};
