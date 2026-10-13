import React from 'react';

export function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{children}</span>;
}

export function Button({ children, variant = "primary", size, className = "", ...props }) {
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  return <button className={`btn btn-${variant} ${sizeClass} ${className}`} {...props}>{children}</button>;
}

export function Pill({ children, variant, tone, className = "" }) {
  // Support both `variant` and `tone` props — callers use either
  const pillClass = variant || tone || 'blue';
  return <span className={`pill pill-${pillClass} ${className}`}>{children}</span>;
}

export function Card({ children, className = "", ...props }) {
  return <section className={`card ${className}`} {...props}>{children}</section>;
}

export function Progress({ value, tone = "blue" }) {
  return (
    <div className="progress">
      <i className={`progress-${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
