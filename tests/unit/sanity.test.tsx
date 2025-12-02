import { render, screen } from '@testing-library/react';
import React from 'react';

import HomePage from '../../app/page';
import { LanguageProvider } from '../../features/i18n';

describe('HomePage', () => {
  it('renders the placeholder hero', () => {
    render(
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>
    );
    expect(screen.getByText(/Unbiased insight/i)).toBeInTheDocument();
  });
});

