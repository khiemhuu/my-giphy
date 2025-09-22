import React, { useState } from 'react';
import './searchBox.css';
import { Search } from 'lucide-react';

export interface SearchBoxProps {
  onSearch: (search: string) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps): JSX.Element {
  const [search, setSearch] = useState('');

  const handleSearch = (): void => {
    onSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="searchBox">
      <input
        className="searchBox__input"
        type="text"
        placeholder="Search for a gif"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="searchBox__button" onClick={handleSearch}>
        <Search />
        Search
      </button>
    </div>
  );
}