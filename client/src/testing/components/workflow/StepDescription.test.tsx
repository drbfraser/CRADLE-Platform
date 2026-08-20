import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import moment from 'moment';

import StepDescription from 'src/shared/components/workflow/StepDescription';
import ProviderWrapper from 'src/testing/ProviderWrapper';

// StepDescription renders `description` as CommonMark via react-markdown v8.
// The package is used bare (no remarkPlugins/rehypePlugins/components override
// -- see StepDescription.tsx), and the lockfile only pulls in remark-parse +
// remark-rehype (no remark-gfm, no rehype-raw, no rehype-sanitize). That means
// the supported syntax is exactly CommonMark, and notably GFM extensions
// (tables, strikethrough, task lists, bare-URL autolinks) and raw HTML are
// NOT supported. This file exercises every CommonMark construct individually
// so a future plugin/version change that silently breaks one is caught, and
// pins down the "not supported" boundary so it can't silently expand either.

function renderDescription(description: string) {
  return render(<StepDescription description={description} />, {
    wrapper: ProviderWrapper,
  });
}

describe('StepDescription', () => {
  describe('fallback', () => {
    it('shows the default fallback text when there is no description', () => {
      const { container } = render(<StepDescription />, {
        wrapper: ProviderWrapper,
      });
      expect(container).toHaveTextContent('No description available.');
    });

    it('shows a custom fallback when provided', () => {
      const { container } = render(
        <StepDescription description={null} fallback="Nothing yet." />,
        { wrapper: ProviderWrapper }
      );
      expect(container).toHaveTextContent('Nothing yet.');
    });

    it('shows the fallback for an empty string description', () => {
      const { container } = renderDescription('');
      expect(container).toHaveTextContent('No description available.');
    });
  });

  describe('supported CommonMark syntax', () => {
    it('renders ATX headings 1-6', () => {
      for (let level = 1; level <= 6; level++) {
        const hashes = '#'.repeat(level);
        const { container, unmount } = renderDescription(
          `${hashes} Heading ${level}`
        );
        const heading = container.querySelector(`h${level}`);
        expect(heading).not.toBeNull();
        expect(heading).toHaveTextContent(`Heading ${level}`);
        unmount();
      }
    });

    it('renders Setext headings (=== and ---)', () => {
      const { container } = renderDescription('Title\n=====\n\nSubtitle\n---');
      expect(container.querySelector('h1')).toHaveTextContent('Title');
      expect(container.querySelector('h2')).toHaveTextContent('Subtitle');
    });

    it('renders **bold** and __bold__ as <strong>', () => {
      const { container } = renderDescription('**star** and __underscore__');
      const strongs = container.querySelectorAll('strong');
      expect(strongs).toHaveLength(2);
      expect(strongs[0]).toHaveTextContent('star');
      expect(strongs[1]).toHaveTextContent('underscore');
    });

    it('renders *italic* and _italic_ as <em>', () => {
      const { container } = renderDescription('*star* and _underscore_');
      const ems = container.querySelectorAll('em');
      expect(ems).toHaveLength(2);
      expect(ems[0]).toHaveTextContent('star');
      expect(ems[1]).toHaveTextContent('underscore');
    });

    it('renders ***bold italic*** as nested <em><strong>', () => {
      const { container } = renderDescription('***very important***');
      const em = container.querySelector('em');
      expect(em).not.toBeNull();
      expect(em?.querySelector('strong')).toHaveTextContent('very important');
    });

    it('treats a single newline as a soft break (a space), not a line break', () => {
      const { container } = renderDescription('Line one\nLine two');
      expect(container.querySelector('br')).toBeNull();
      expect(container).toHaveTextContent('Line one Line two');
    });

    it('renders a hard line break for two trailing spaces before a newline', () => {
      const { container } = renderDescription('Line one  \nLine two');
      expect(container.querySelector('br')).not.toBeNull();
    });

    it('renders a hard line break for a trailing backslash before a newline', () => {
      const { container } = renderDescription('Line one\\\nLine two');
      expect(container.querySelector('br')).not.toBeNull();
    });

    it('separates blank-line paragraphs into distinct <p> elements', () => {
      const { container } = renderDescription(
        'First paragraph.\n\nSecond paragraph.'
      );
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0]).toHaveTextContent('First paragraph.');
      expect(paragraphs[1]).toHaveTextContent('Second paragraph.');
    });

    it.each(['-', '*', '+'])(
      'renders an unordered list using "%s" markers',
      (marker) => {
        const { container } = renderDescription(
          `${marker} one\n${marker} two\n${marker} three`
        );
        const list = container.querySelector('ul');
        expect(list).not.toBeNull();
        expect(list?.querySelectorAll('li')).toHaveLength(3);
      }
    );

    it('renders an ordered list', () => {
      const { container } = renderDescription('1. one\n2. two\n3. three');
      const list = container.querySelector('ol');
      expect(list).not.toBeNull();
      expect(list?.querySelectorAll('li')).toHaveLength(3);
    });

    it('renders a nested list', () => {
      const { container } = renderDescription(
        '- parent\n  - child one\n  - child two'
      );
      const outer = container.querySelector('ul');
      const nested = outer?.querySelector('li ul');
      expect(nested).not.toBeNull();
      expect(nested?.querySelectorAll('li')).toHaveLength(2);
    });

    it('renders an inline link with the correct href and text', () => {
      const { container } = renderDescription('[Cradle](https://example.com)');
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveTextContent('Cradle');
    });

    it('renders a reference-style link', () => {
      const { container } = renderDescription(
        '[Cradle][ref]\n\n[ref]: https://example.com "Cradle site"'
      );
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('title', 'Cradle site');
    });

    it('renders an angle-bracket autolink', () => {
      const { container } = renderDescription('<https://example.com>');
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders an image with src and alt', () => {
      const { container } = renderDescription(
        '![a chart](https://example.com/chart.png)'
      );
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img).toHaveAttribute('src', 'https://example.com/chart.png');
      expect(img).toHaveAttribute('alt', 'a chart');
    });

    it('renders inline code as <code>', () => {
      const { container } = renderDescription('Use the `startDate` token.');
      const code = container.querySelector('code');
      expect(code).not.toBeNull();
      expect(code).toHaveTextContent('startDate');
    });

    it('renders a fenced code block with a language class', () => {
      const { container } = renderDescription('```js\nconst x = 1;\n```');
      const code = container.querySelector('pre code');
      expect(code).not.toBeNull();
      expect(code?.className).toContain('language-js');
      expect(code).toHaveTextContent('const x = 1;');
    });

    it('renders a 4-space indented code block', () => {
      const { container } = renderDescription('    const x = 1;');
      const code = container.querySelector('pre code');
      expect(code).not.toBeNull();
      expect(code).toHaveTextContent('const x = 1;');
    });

    it('renders a blockquote', () => {
      const { container } = renderDescription('> Take twice daily.');
      const quote = container.querySelector('blockquote');
      expect(quote).not.toBeNull();
      expect(quote).toHaveTextContent('Take twice daily.');
    });

    it.each(['---', '***', '___'])(
      'renders a thematic break for "%s"',
      (rule) => {
        const { container } = renderDescription(`Before\n\n${rule}\n\nAfter`);
        expect(container.querySelector('hr')).not.toBeNull();
      }
    );

    it('renders a backslash-escaped character literally, without applying emphasis', () => {
      const { container } = renderDescription('\\*not italic\\*');
      expect(container.querySelector('em')).toBeNull();
      expect(container).toHaveTextContent('*not italic*');
    });

    it('decodes an HTML entity', () => {
      const { container } = renderDescription('Cradle &amp; Friends');
      expect(container).toHaveTextContent('Cradle & Friends');
    });
  });

  describe('unsupported syntax (no remark-gfm / rehype-raw configured)', () => {
    it('does not render a GFM table as a <table>', () => {
      const { container } = renderDescription(
        '| A | B |\n| - | - |\n| 1 | 2 |'
      );
      expect(container.querySelector('table')).toBeNull();
    });

    it('does not render ~~strikethrough~~', () => {
      const { container } = renderDescription('~~done~~');
      expect(container.querySelector('del')).toBeNull();
      expect(container.querySelector('s')).toBeNull();
      expect(container).toHaveTextContent('~~done~~');
    });

    it('does not render a GFM task list checkbox', () => {
      const { container } = renderDescription('- [ ] todo item');
      expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    });

    it('does not autolink a bare URL', () => {
      const { container } = renderDescription(
        'Visit https://example.com for info.'
      );
      expect(container.querySelector('a')).toBeNull();
      expect(container).toHaveTextContent(
        'Visit https://example.com for info.'
      );
    });

    it('drops raw inline HTML tags without rendering them as elements', () => {
      const { container } = renderDescription('Some <b>bold</b> text.');
      expect(container.querySelector('b')).toBeNull();
      expect(container.querySelector('strong')).toBeNull();
    });

    it('neutralizes a javascript: URL href instead of passing it through', () => {
      const { container } = renderDescription(
        '[click me](javascript:alert(1))'
      );
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      // react-markdown's default uriTransformer doesn't strip the link --
      // it replaces disallowed-protocol hrefs with this inert placeholder.
      expect(link).toHaveAttribute('href', 'javascript:void(0)');
    });
  });

  describe('malformed or incomplete syntax', () => {
    it('renders an unclosed **bold marker as literal asterisks', () => {
      const { container } = renderDescription('**unclosed bold');
      expect(container.querySelector('strong')).toBeNull();
      expect(container).toHaveTextContent('**unclosed bold');
    });

    it('renders an unclosed _italic marker as a literal underscore', () => {
      const { container } = renderDescription('_unclosed italic');
      expect(container.querySelector('em')).toBeNull();
      expect(container).toHaveTextContent('_unclosed italic');
    });

    it('does not treat "#" as a heading without a following space', () => {
      const { container } = renderDescription('#NotAHeading');
      expect(container.querySelector('h1')).toBeNull();
      expect(container).toHaveTextContent('#NotAHeading');
    });

    it('renders an empty heading element for a bare "# " with no text', () => {
      const { container } = renderDescription('# ');
      const heading = container.querySelector('h1');
      expect(heading).not.toBeNull();
      expect(heading).toHaveTextContent('');
    });

    it('renders a link with empty text and an empty href for "[]()"', () => {
      const { container } = renderDescription('[]()');
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', '');
      expect(link).toHaveTextContent('');
    });

    it('renders a link with empty href when the destination is omitted', () => {
      const { container } = renderDescription('[click here]()');
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', '');
    });

    it('does not render an image with an unterminated destination', () => {
      const { container } = renderDescription('![broken image](');
      expect(container.querySelector('img')).toBeNull();
      expect(container).toHaveTextContent('![broken image](');
    });

    it('treats an unclosed code fence as extending to the end of the description', () => {
      const { container } = renderDescription('```\nunclosed fence\nmore text');
      const code = container.querySelector('pre code');
      expect(code).not.toBeNull();
      expect(code).toHaveTextContent('unclosed fence more text');
    });

    it('renders an empty list item for a marker with no text', () => {
      const { container } = renderDescription('- ');
      const item = container.querySelector('li');
      expect(item).not.toBeNull();
      expect(item).toHaveTextContent('');
    });

    it('does not render a link whose title quote is never closed', () => {
      const { container } = renderDescription(
        '[text](url "unterminated title)'
      );
      expect(container.querySelector('a')).toBeNull();
      expect(container).toHaveTextContent('[text](url "unterminated title)');
    });

    it('renders a line of bare asterisks as a thematic break, not empty emphasis', () => {
      // Unlike `***bold italic***`, four asterisks with no enclosed content
      // matches CommonMark's thematic-break rule instead of emphasis, since
      // there's no text for the emphasis markers to wrap.
      const { container } = renderDescription('****');
      expect(container.querySelector('hr')).not.toBeNull();
      expect(container.querySelector('em')).toBeNull();
      expect(container.querySelector('strong')).toBeNull();
    });

    it('renders nothing (not the fallback) for a whitespace-only description', () => {
      // The `!description` guard in StepDescription only catches falsy
      // values (null/undefined/''), so a description that's present but only
      // whitespace skips the fallback text entirely and silently renders an
      // empty block instead -- a real gap, not a guess.
      const { container } = renderDescription('   ');
      expect(container).not.toHaveTextContent('No description available.');
      expect(container.textContent?.trim()).toBe('');
    });
  });

  describe('interaction with the {{startDate...}} and variable token resolvers', () => {
    it('resolves an unresolved {{startDate}} token to a bracketed placeholder, not markdown syntax', () => {
      const { container } = renderDescription('Follow up on {{startDate+3d}}.');
      expect(container).toHaveTextContent('Follow up on [start date +3d].');
    });

    it('resolves {{startDate}} to a real date when startDate is provided', () => {
      const startDate = moment('2050-08-20T00:00:00Z').unix();
      const { container } = render(
        <StepDescription
          description="Follow up on **{{startDate+3d}}**."
          startDate={startDate}
        />,
        { wrapper: ProviderWrapper }
      );
      const expected = moment
        .unix(startDate)
        .add(3, 'days')
        .format('MMM D, YYYY');
      const strong = container.querySelector('strong');
      expect(strong).toHaveTextContent(expected);
    });

    it('substitutes an unresolved variable token as parenthesized placeholder text', () => {
      // No instanceId/stepId means the resolver query never fires, so every
      // tag resolves to its "not loaded" placeholder.
      const { container } = renderDescription(
        "Patient's age: {{patient.age}}."
      );
      expect(container).toHaveTextContent(
        "Patient's age: (patient age not loaded)."
      );
    });

    it('breaks link syntax when an unresolved variable placeholder is used as the link destination', () => {
      // Token resolution runs BEFORE markdown parsing (see StepDescription.tsx),
      // so `{{patient.age}}` inside a link destination first becomes the
      // placeholder `(patient age not loaded)` -- itself parenthesized. That
      // leaves `[the chart]((patient age not loaded))`, whose destination is
      // no longer a single balanced `(...)` pair, so CommonMark's link parser
      // gives up and the brackets render as literal text instead of an <a>.
      // This documents a real, surprising interaction rather than an assumed one.
      const { container } = renderDescription(
        'See [the chart]({{patient.age}}).'
      );
      expect(container.querySelector('a')).toBeNull();
      expect(container).toHaveTextContent(
        'See [the chart]((patient age not loaded)).'
      );
    });
  });
});
