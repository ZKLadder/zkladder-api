/* eslint-disable no-console */
const { run } = require('hardhat');
const args = require('minimist');
const { writeFileSync } = require('fs');
const { flattenContract } = require('../../scripts/flattenContract');
const { getContractById } = require('../../src/utils/contract');

jest.mock('../../src/utils/contract', () => ({
  getContractById: jest.fn(),
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('hardhat', () => ({
  run: jest.fn(() => { console.log('Flattened Solidity Source'); }),
}));

jest.mock('minimist', () => (jest.fn()));

jest.spyOn(global.console, 'log').mockImplementation(() => (jest.fn()));

const commandLineArgs = 'mock command line args';
process.argv = commandLineArgs;

describe('flattenContract tests', () => {
  test('correctly generates and logs source code when only given a templateId', async () => {
    args.mockReturnValueOnce({ templateId: '1' });
    getContractById.mockReturnValueOnce({ src: '/mock/src/file.sol' });

    await flattenContract();

    expect(args).toHaveBeenCalledWith(commandLineArgs);
    expect(getContractById).toHaveBeenCalledWith('1');
    expect(run).toHaveBeenCalledWith('flatten', '/mock/src/file.sol');
    expect(console.log).toHaveBeenCalledWith(`// SPDX-License-Identifier: ${'MIXED'}\n\n${'Flattened Solidity Source'}`);
  });

  test('correctly generates and logs source code when only given templateId and license', async () => {
    args.mockReturnValueOnce({ templateId: '1', license: 'MIT' });
    getContractById.mockReturnValueOnce({ src: '/mock/src/file.sol' });

    await flattenContract();

    expect(args).toHaveBeenCalledWith(commandLineArgs);
    expect(getContractById).toHaveBeenCalledWith('1');
    expect(run).toHaveBeenCalledWith('flatten', '/mock/src/file.sol');
    expect(console.log).toHaveBeenCalledWith(`// SPDX-License-Identifier: ${'MIT'}\n\n${'Flattened Solidity Source'}`);
  });

  test('correctly generates and writes source code to file when given targetFile', async () => {
    args.mockReturnValueOnce({ templateId: '1', license: 'MIT', targetFile: '/my/favorite/directory' });
    getContractById.mockReturnValueOnce({ src: '/mock/src/file.sol' });

    await flattenContract();

    expect(args).toHaveBeenCalledWith(commandLineArgs);
    expect(getContractById).toHaveBeenCalledWith('1');
    expect(run).toHaveBeenCalledWith('flatten', '/mock/src/file.sol');
    expect(writeFileSync).toHaveBeenCalledWith('/my/favorite/directory', `// SPDX-License-Identifier: ${'MIT'}\n\n${'Flattened Solidity Source'}`);
  });

  test('rethrows errors', async () => {
    args.mockReturnValueOnce({ templateId: '1', license: 'MIT', targetFile: '/my/favorite/directory' });
    getContractById.mockImplementationOnce(() => { throw new Error('Invalid templateID'); });

    expect(async () => { await flattenContract(); }).rejects.toThrow(new Error('Invalid templateID'));

    expect(args).toHaveBeenCalledWith(commandLineArgs);
    expect(getContractById).toHaveBeenCalledWith('1');
  });
});
