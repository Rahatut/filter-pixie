import { FILTERS, type FilterId } from '../types/filters';

interface FilterButtonsProps {
  selectedFilter: FilterId | null;
  onSelectFilter: (filterId: FilterId) => void;
  disabled?: boolean;
}

export function FilterButtons({ selectedFilter, onSelectFilter, disabled }: FilterButtonsProps) {
  return (
    <div className="filter-buttons" role="group" aria-label="Choose a filter">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
          onClick={() => !disabled && onSelectFilter(filter.id)}
          disabled={disabled}
          aria-pressed={selectedFilter === filter.id}
        >
          <span className="filter-btn-name">{filter.name}</span>
        </button>
      ))}
    </div>
  );
}