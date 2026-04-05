import React from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';

export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-bar">
      <HiMagnifyingGlass className="search-bar__icon" aria-hidden />
      <input
        type="search"
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
