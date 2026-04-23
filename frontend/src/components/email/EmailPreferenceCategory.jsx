import React from 'react';
import EmailPreferenceToggle from './EmailPreferenceToggle';

const EmailPreferenceCategory = ({
  icon,
  title,
  description,
  enabled,
  disabled = false,
  onToggle,
  children,
}) => {
  return (
    <div
      className={`
        bg-white border rounded-xl p-5 shadow-sm transition-all
        ${enabled && !disabled ? 'border-teal-200' : 'border-stone-200'}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-xl
              ${enabled && !disabled ? 'bg-teal-50 text-teal-700' : 'bg-stone-100 text-stone-500'}
            `}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-stone-900">{title}</h3>
            {description && (
              <p className="text-sm text-stone-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        <EmailPreferenceToggle
          enabled={enabled}
          disabled={disabled}
          onChange={onToggle}
        />
      </div>

      {children && enabled && !disabled && (
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default EmailPreferenceCategory;
