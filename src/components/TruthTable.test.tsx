import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TruthTable } from './TruthTable';
import { parseExpression } from '../logic/parser';

describe('TruthTable Component', () => {
  it('should render a truth table for AB', () => {
    const ast = parseExpression('AB');
    render(<TruthTable ast={ast} title="Test Table" />);
    
    expect(screen.getByText('Test Table')).toBeInTheDocument();
    
    // Check headers - use regex for case-insensitivity because parser lowercases names
    // Be specific to avoid matching "Test Table" (contains 'a')
    expect(screen.getByRole('columnheader', { name: /a/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /b/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'OUT' })).toBeInTheDocument();
    
    // AB has 4 rows. 
    // We can count cells. 2 vars + 1 out = 3 cells per row. 4 rows + 1 header = 5 rows total.
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(5); // 1 header + 4 data rows
  });

  it('should show 1 for truthy results and 0 for falsy', () => {
     const ast = parseExpression('A');
     
     render(<TruthTable ast={ast} />);
     
     // For A, rows are:
     // A=0, OUT=0
     // A=1, OUT=1
     // Total '0' should be 2 (one for A, one for OUT in first row)
     // Total '1' should be 2 (one for A, one for OUT in second row)
     
     const zeros = screen.getAllByText('0');
     const ones = screen.getAllByText('1');
     
     expect(zeros).toHaveLength(2);
     expect(ones).toHaveLength(2);
  });

  it('should handle too many variables', () => {
    const ast = parseExpression('ABCDEF'); // 6 variables
    render(<TruthTable ast={ast} />);
    
    expect(screen.getByText(/Too many variables/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
