/**
 * Feature: web-ui-ux-enhancement
 * Property 3: Search Suggestions Relevance
 * 
 * *For any* search query string, the returned suggestions should only include items
 * that contain the query string (case-insensitive) in their name, brand, or category.
 * 
 * **Validates: Requirements 4.1**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterSuggestions, SearchSuggestion } from '@/components/search/SearchBar';

// Generator for SearchSuggestion
const suggestionTypeArbitrary = fc.constantFrom('car' as const, 'brand' as const, 'category' as const);

const searchSuggestionArbitrary: fc.Arbitrary<SearchSuggestion> = fc.record({
  type: suggestionTypeArbitrary,
  label: fc.string({ minLength: 1, maxLength: 100 }),
  value: fc.string({ minLength: 1, maxLength: 100 }),
});

const suggestionsArrayArbitrary = fc.array(searchSuggestionArbitrary, { minLength: 0, maxLength: 20 });

describe('Property 3: Search Suggestions Relevance', () => {
  /**
   * Property: For any search query, all returned suggestions should contain
   * the query string in their label or value (case-insensitive).
   */
  it('should return only suggestions that match the query in label or value', () => {
    fc.assert(
      fc.property(
        suggestionsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }),
        (suggestions, query) => {
          const filtered = filterSuggestions(suggestions, query);
          const normalizedQuery = query.toLowerCase().trim();

          // All returned suggestions must contain the query in label or value
          return filtered.every(
            (suggestion) =>
              suggestion.label.toLowerCase().includes(normalizedQuery) ||
              suggestion.value.toLowerCase().includes(normalizedQuery)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Search should not exclude any suggestion that matches the query.
   */
  it('should include all suggestions that match the query', () => {
    fc.assert(
      fc.property(
        suggestionsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }),
        (suggestions, query) => {
          const filtered = filterSuggestions(suggestions, query);
          const normalizedQuery = query.toLowerCase().trim();

          // Find all suggestions that should match
          const expectedMatches = suggestions.filter(
            (s) =>
              s.label.toLowerCase().includes(normalizedQuery) ||
              s.value.toLowerCase().includes(normalizedQuery)
          );

          // Filtered results should have the same length as expected matches
          return filtered.length === expectedMatches.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty query should return no suggestions.
   */
  it('should return empty array when query is empty', () => {
    fc.assert(
      fc.property(suggestionsArrayArbitrary, (suggestions) => {
        const filteredEmpty = filterSuggestions(suggestions, '');
        const filteredWhitespace = filterSuggestions(suggestions, '   ');

        return filteredEmpty.length === 0 && filteredWhitespace.length === 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Search should be case-insensitive.
   */
  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        suggestionsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }),
        (suggestions, query) => {
          const lowerResult = filterSuggestions(suggestions, query.toLowerCase());
          const upperResult = filterSuggestions(suggestions, query.toUpperCase());
          const mixedResult = filterSuggestions(suggestions, query);

          // All should return the same number of results
          return (
            lowerResult.length === upperResult.length &&
            upperResult.length === mixedResult.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filtered results should preserve the original suggestion objects.
   */
  it('should preserve original suggestion objects in results', () => {
    fc.assert(
      fc.property(
        suggestionsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }),
        (suggestions, query) => {
          const filtered = filterSuggestions(suggestions, query);

          // Each filtered suggestion should be identical to one in the original array
          return filtered.every((filteredSuggestion) =>
            suggestions.some(
              (original) =>
                original.type === filteredSuggestion.type &&
                original.label === filteredSuggestion.label &&
                original.value === filteredSuggestion.value
            )
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filtering should be idempotent - filtering twice with same query
   * should produce the same result.
   */
  it('should be idempotent - filtering twice produces same result', () => {
    fc.assert(
      fc.property(
        suggestionsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }),
        (suggestions, query) => {
          const filteredOnce = filterSuggestions(suggestions, query);
          const filteredTwice = filterSuggestions(filteredOnce, query);

          // Both should have the same length and content
          if (filteredOnce.length !== filteredTwice.length) {
            return false;
          }

          return filteredOnce.every((s, i) =>
            s.type === filteredTwice[i].type &&
            s.label === filteredTwice[i].label &&
            s.value === filteredTwice[i].value
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Result count should never exceed input count.
   */
  it('should never return more suggestions than provided', () => {
    fc.assert(
      fc.property(
        suggestionsArrayArbitrary,
        fc.string({ minLength: 0, maxLength: 50 }),
        (suggestions, query) => {
          const filtered = filterSuggestions(suggestions, query);
          return filtered.length <= suggestions.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
