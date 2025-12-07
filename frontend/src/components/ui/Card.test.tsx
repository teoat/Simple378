import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from './Card';

describe('Card', () => {
  it('renders Card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content')).toHaveClass('custom-class');
  });

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    const title = screen.getByText('Card Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
  });

  it('renders CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
      </Card>
    );
    const description = screen.getByText('Card description');
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe('P');
  });

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    );
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders complete card structure', () => {
    render(
      <Card className="test-card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Main content here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByText('Test Title').closest('.test-card')).toBeInTheDocument();
  });
});