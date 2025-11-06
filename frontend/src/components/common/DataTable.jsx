import { useState } from 'react';

/**
 * Reusable DataTable Component
 * รองรับ pagination, sorting, และ custom actions
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  onRowClick = null,
  emptyMessage = 'ไม่พบข้อมูล',
  className = '',
  rowClassName = null,
  disableHover = false,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;

    const comparison = aValue > bValue ? 1 : -1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-border-default">
        <thead className="bg-bg-light-cream">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:text-primary-gold' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortConfig.key === column.key && (
                    <span className="text-primary-gold">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border-default">
          {sortedData.map((row, rowIndex) => {
            const customRowClass = rowClassName ? rowClassName(row) : '';
            return (
              <tr
                key={row._id || rowIndex}
                className={`${!disableHover ? 'hover:bg-bg-cream' : ''} transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${customRowClass}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
