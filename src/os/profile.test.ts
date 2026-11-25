import { describe, expect, it } from 'vitest';
import { contactLinks } from './profile';

describe('contact links', () => {
  it('lists only the details that have been filled in, each with a working link', () => {
    const links = contactLinks({ email: 'hello@suriya.example', github: '', linkedin: 'https://www.linkedin.com/in/suriya-example' });

    expect(links).toEqual([
      { label: 'E-mail', text: 'hello@suriya.example', href: 'mailto:hello@suriya.example' },
      { label: 'LinkedIn', text: 'linkedin.com/in/suriya-example', href: 'https://www.linkedin.com/in/suriya-example' },
    ]);
  });
});
