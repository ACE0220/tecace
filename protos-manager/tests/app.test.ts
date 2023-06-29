import { describe, it, expect } from '@jest/globals';
import { protosLoader } from '../dist/cjs/index';
describe('proto test', () => {
  it('test get package, expect return include acemall_user', () => {
    const packages = protosLoader.getPackages();
    console.log(packages);
    console.log(protosLoader.getProtos());
    expect(packages?.includes('acemall_user.user')).toBe(true);
  });
});
