import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

function flipHorizontalPure(position: 'left' | 'right', isRtl: boolean): 'left' | 'right' {
  if (!isRtl) return position;
  return position === 'left' ? 'right' : 'left';
}

function toLogicalPositionPure(position: 'left' | 'right', isRtl: boolean): 'start' | 'end' {
  if (position === 'left') {
    return isRtl ? 'end' : 'start';
  }
  return isRtl ? 'start' : 'end';
}

function toPhysicalPositionPure(position: 'start' | 'end', isRtl: boolean): 'left' | 'right' {
  if (position === 'start') {
    return isRtl ? 'right' : 'left';
  }
  return isRtl ? 'left' : 'right';
}

function getTextAlignPure(align: 'start' | 'end' | 'center', isRtl: boolean): 'left' | 'right' | 'center' {
  if (align === 'center') return 'center';
  return toPhysicalPositionPure(align, isRtl);
}

function shouldFlipIconPure(iconName: string, isRtl: boolean): boolean {
  const flipIcons = ['arrow-left', 'arrow-right', 'chevron-left', 'chevron-right'];
  return isRtl && flipIcons.some(name => iconName.toLowerCase().includes(name));
}

function getRTLArrowKeyPure(key: 'ArrowLeft' | 'ArrowRight', isRtl: boolean): 'ArrowLeft' | 'ArrowRight' {
  if (!isRtl) return key;
  return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
}

function formatArabicNumberPure(num: number, isArabic: boolean): string {
  if (!isArabic) return num.toString();
  const arabicNumerals = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
  return num.toString().replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
}

const directionArb = fc.boolean();
const horizontalPositionArb = fc.constantFrom('left' as const, 'right' as const);
const logicalPositionArb = fc.constantFrom('start' as const, 'end' as const);
const textAlignArb = fc.constantFrom('start' as const, 'end' as const, 'center' as const);
const arrowKeyArb = fc.constantFrom('ArrowLeft' as const, 'ArrowRight' as const);
const directionalIconArb = fc.constantFrom('arrow-left', 'arrow-right', 'chevron-left', 'chevron-right');
const nonDirectionalIconArb = fc.constantFrom('home', 'settings', 'user', 'search');

describe('Property 26: RTL Layout Support', () => {
  describe('Position Flipping', () => {
    it('should flip horizontal positions in RTL mode', () => {
      fc.assert(
        fc.property(directionArb, horizontalPositionArb, (isRtl, position) => {
          const result = flipHorizontalPure(position, isRtl);
          if (isRtl) {
            expect(result).toBe(position === 'left' ? 'right' : 'left');
          } else {
            expect(result).toBe(position);
          }
        })
      );
    });

    it('should convert physical to logical positions correctly', () => {
      fc.assert(
        fc.property(directionArb, horizontalPositionArb, (isRtl, position) => {
          const logical = toLogicalPositionPure(position, isRtl);
          if (isRtl) {
            expect(logical).toBe(position === 'left' ? 'end' : 'start');
          } else {
            expect(logical).toBe(position === 'left' ? 'start' : 'end');
          }
        })
      );
    });

    it('should convert logical to physical positions correctly', () => {
      fc.assert(
        fc.property(directionArb, logicalPositionArb, (isRtl, position) => {
          const physical = toPhysicalPositionPure(position, isRtl);
          if (isRtl) {
            expect(physical).toBe(position === 'start' ? 'right' : 'left');
          } else {
            expect(physical).toBe(position === 'start' ? 'left' : 'right');
          }
        })
      );
    });

    it('should maintain round-trip conversion', () => {
      fc.assert(
        fc.property(directionArb, horizontalPositionArb, (isRtl, position) => {
          const logical = toLogicalPositionPure(position, isRtl);
          const backToPhysical = toPhysicalPositionPure(logical, isRtl);
          expect(backToPhysical).toBe(position);
        })
      );
    });
  });

  describe('Text Alignment', () => {
    it('should convert logical text alignment to physical correctly', () => {
      fc.assert(
        fc.property(directionArb, textAlignArb, (isRtl, align) => {
          const result = getTextAlignPure(align, isRtl);
          if (align === 'center') {
            expect(result).toBe('center');
          } else if (isRtl) {
            expect(result).toBe(align === 'start' ? 'right' : 'left');
          } else {
            expect(result).toBe(align === 'start' ? 'left' : 'right');
          }
        })
      );
    });
  });

  describe('Icon Flipping', () => {
    it('should flip directional icons in RTL mode', () => {
      fc.assert(
        fc.property(directionArb, directionalIconArb, (isRtl, iconName) => {
          const shouldFlip = shouldFlipIconPure(iconName, isRtl);
          expect(shouldFlip).toBe(isRtl);
        })
      );
    });

    it('should NOT flip non-directional icons', () => {
      fc.assert(
        fc.property(directionArb, nonDirectionalIconArb, (isRtl, iconName) => {
          const shouldFlip = shouldFlipIconPure(iconName, isRtl);
          expect(shouldFlip).toBe(false);
        })
      );
    });
  });

  describe('Keyboard Navigation', () => {
    it('should swap arrow keys in RTL mode', () => {
      fc.assert(
        fc.property(directionArb, arrowKeyArb, (isRtl, key) => {
          const result = getRTLArrowKeyPure(key, isRtl);
          if (isRtl) {
            expect(result).toBe(key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft');
          } else {
            expect(result).toBe(key);
          }
        })
      );
    });
  });

  describe('Arabic Number Formatting', () => {
    it('should format numbers with Arabic-Indic numerals when Arabic', () => {
      fc.assert(
        fc.property(directionArb, fc.integer({ min: 0, max: 9 }), (isArabic, digit) => {
          const result = formatArabicNumberPure(digit, isArabic);
          if (isArabic) {
            const arabicNumerals = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
            expect(result).toBe(arabicNumerals[digit]);
          } else {
            expect(result).toBe(digit.toString());
          }
        })
      );
    });

    it('should format multi-digit numbers correctly', () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 9999 }), (num) => {
          const arabicResult = formatArabicNumberPure(num, true);
          const englishResult = formatArabicNumberPure(num, false);
          expect(englishResult).toBe(num.toString());
          expect(arabicResult.length).toBe(num.toString().length);
          expect(arabicResult).not.toMatch(/[0-9]/);
        })
      );
    });
  });

  describe('Symmetry Properties', () => {
    it('should preserve symmetry when flipping twice', () => {
      fc.assert(
        fc.property(horizontalPositionArb, (position) => {
          const flippedOnce = flipHorizontalPure(position, true);
          const flippedTwice = flipHorizontalPure(flippedOnce, true);
          expect(flippedTwice).toBe(position);
        })
      );
    });
  });
});
