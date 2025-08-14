/**
 * Returns a boolean value based on a specified probability ratio
 */
export function randomChance(failureRatio: number): boolean {
  // Validate input
  if (failureRatio < 0 || failureRatio > 1) {
    throw new Error("Failure ratio must be between 0 and 1");
  }

  // Edge cases for certainty
  if (failureRatio === 0) return false;
  if (failureRatio === 1) return true;

  // Use crypto API for better randomness
  const buffer = new Uint8Array(1);
  crypto.getRandomValues(buffer);

  // Convert to a value between 0 and 1
  const randomValue = buffer[0] / 255;

  // Return true if the random value is less than the failure ratio
  return randomValue > failureRatio;
}
