import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('Home', () => {
  it('identifies the project and its current state', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: 'ChaseBrown' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Foundation ready')).toBeInTheDocument();
  });
});
