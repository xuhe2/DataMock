export type RandomGenerator = () => number;

export function createSeededRandom(seed: number): RandomGenerator {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomNormal(random: RandomGenerator, mean = 0, sigma = 1): number {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = Math.max(random(), Number.EPSILON);
  const magnitude = Math.sqrt(-2 * Math.log(u1));
  const z0 = magnitude * Math.cos(2 * Math.PI * u2);
  return mean + z0 * sigma;
}
