/**
 * Health Check Tests
 * Simple tests that don't require database connection
 */

describe('Health Check Utility', () => {
  test('calculates sentiment percentages correctly', () => {
    const total = 100;
    const positive = 60;
    const negative = 25;
    const neutral = 15;
    
    const positivePercent = (positive / total) * 100;
    const negativePercent = (negative / total) * 100;
    const neutralPercent = (neutral / total) * 100;
    
    expect(positivePercent).toBe(60);
    expect(negativePercent).toBe(25);
    expect(neutralPercent).toBe(15);
    expect(positivePercent + negativePercent + neutralPercent).toBe(100);
  });

  test('determines sentiment label from score', () => {
    const getSentiment = (score: number): string => {
      if (score >= 0.05) return 'positive';
      if (score <= -0.05) return 'negative';
      return 'neutral';
    };
    
    expect(getSentiment(0.8)).toBe('positive');
    expect(getSentiment(0.05)).toBe('positive');
    expect(getSentiment(-0.8)).toBe('negative');
    expect(getSentiment(-0.05)).toBe('negative');
    expect(getSentiment(0.01)).toBe('neutral');
    expect(getSentiment(0.0)).toBe('neutral');
  });

  test('validates keyword format', () => {
    const isValidKeyword = (keyword: string): boolean => {
      return keyword.trim().length > 0 && keyword.length <= 50;
    };
    
    expect(isValidKeyword('Bitcoin')).toBe(true);
    expect(isValidKeyword('Tesla')).toBe(true);
    expect(isValidKeyword('')).toBe(false);
    expect(isValidKeyword('   ')).toBe(false);
    expect(isValidKeyword('a'.repeat(51))).toBe(false);
  });

  test('rounds numbers correctly for display', () => {
    const roundToTwoDecimals = (num: number): number => {
      return Math.round(num * 100) / 100;
    };
    
    expect(roundToTwoDecimals(0.12345)).toBe(0.12);
    expect(roundToTwoDecimals(0.876)).toBe(0.88);
    expect(roundToTwoDecimals(-0.456)).toBe(-0.46);
  });
});
