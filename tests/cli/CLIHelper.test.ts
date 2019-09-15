import { Configuration } from '../../lib/utils';

jest.mock(('../../tests/cli-config').replace(/\\/g, '/'), () => ({ dbName: 'foo_bar', entitiesDirs: ['.'] }));
const pkg = { 'mikro-orm': {} } as any;
jest.mock('../../tests/package.json', () => pkg, { virtual: true });
(global as any).process.cwd = () => '../../tests';
const log = jest.fn();
(global as any).console.log = log;

import chalk from 'chalk';
import { CLIHelper } from '../../lib/cli/CLIHelper';
import { MikroORM } from '../../lib';
import { SchemaCommandFactory } from '../../lib/cli/SchemaCommandFactory';

describe('CLIHelper', () => {

  test('configures yargs instance', async () => {
    const cli = await CLIHelper.configure() as any;
    expect(cli.$0).toBe('mikro-orm');
    expect(cli.getCommandInstance().getCommands()).toEqual(['cache:clear', 'generate-entities', 'schema:create', 'schema:drop', 'schema:update']);
  });

  test('configures yargs instance [ts-node]', async () => {
    const pathExistsMock = jest.spyOn(require('fs-extra'), 'pathExists');
    pathExistsMock.mockReturnValue(Promise.resolve(true));
    pkg['mikro-orm'].useTsNode = true;
    const tsNodeMock = jest.spyOn(require('ts-node'), 'register');
    const cli = await CLIHelper.configure() as any;
    expect(cli.$0).toBe('mikro-orm');
    expect(tsNodeMock).toHaveBeenCalled();
    expect(cli.getCommandInstance().getCommands()).toEqual(['cache:clear', 'generate-entities', 'schema:create', 'schema:drop', 'schema:update']);
    pathExistsMock.mockRestore();
  });

  test('gets ORM configuration [no cli-config]', async () => {
    await expect(CLIHelper.getConfiguration()).rejects.toThrowError(`cli-config not found in ['./cli-config']`);
  });

  test('gets ORM configuration [no package.json]', async () => {
    const pathExistsMock = jest.spyOn(require('fs-extra'), 'pathExists');
    pathExistsMock.mockImplementation(async path => path === '../../tests/cli-config');
    const conf = await CLIHelper.getConfiguration();
    expect(conf).toBeInstanceOf(Configuration);
    expect(conf.get('dbName')).toBe('foo_bar');
    expect(conf.get('entitiesDirs')).toEqual(['.']);
    pathExistsMock.mockRestore();
  });

  test('gets ORM configuration [from package.json]', async () => {
    const pathExistsMock = jest.spyOn(require('fs-extra'), 'pathExists');
    pathExistsMock.mockReturnValue(Promise.resolve(true));
    pkg['mikro-orm'].useTsNode = true;
    const conf = await CLIHelper.getConfiguration();
    expect(conf).toBeInstanceOf(Configuration);
    expect(conf.get('dbName')).toBe('foo_bar');
    expect(conf.get('entitiesDirs')).toEqual(['.']);
    pathExistsMock.mockRestore();
  });

  test('gets ORM instance', async () => {
    const pathExistsMock = jest.spyOn(require('fs-extra'), 'pathExists');
    pathExistsMock.mockReturnValue(Promise.resolve(true));
    delete pkg['mikro-orm'].useTsNode;
    const orm = await CLIHelper.getORM(false);
    expect(orm).toBeInstanceOf(MikroORM);
    expect(orm.config.get('tsNode')).toBe(false);
    await orm.close(true);
    pathExistsMock.mockRestore();
  });

  test('gets ORM instance [ts-node]', async () => {
    const pathExistsMock = jest.spyOn(require('fs-extra'), 'pathExists');
    pathExistsMock.mockReturnValue(Promise.resolve(true));
    pkg['mikro-orm'].useTsNode = true;
    await expect(CLIHelper.getORM()).rejects.toThrowError('No entities were discovered');
    const orm = await CLIHelper.getORM(false);
    expect(orm).toBeInstanceOf(MikroORM);
    expect(orm.config.get('tsNode')).toBe(true);
    await orm.close(true);
    pathExistsMock.mockRestore();
  });

  test('builder', async () => {
    const args = { option: jest.fn() };
    SchemaCommandFactory.configureSchemaCommand(args as any);
    expect(args.option.mock.calls.length).toBe(3);
    expect(args.option.mock.calls[0][0]).toBe('r');
    expect(args.option.mock.calls[0][1]).toMatchObject({ alias: 'run', type: 'boolean' });
    expect(args.option.mock.calls[1][0]).toBe('d');
    expect(args.option.mock.calls[1][1]).toMatchObject({ alias: 'dump', type: 'boolean' });
    expect(args.option.mock.calls[2][0]).toBe('no-fk');
    expect(args.option.mock.calls[2][1]).toMatchObject({ type: 'boolean' });
  });

  test('dump', async () => {
    CLIHelper.dump('test');
    CLIHelper.dump('select 1 + 1', new Configuration({} as any, false), 'sql');
    expect(log.mock.calls.length).toBe(2);
    expect(log.mock.calls[0][0]).toBe('test');

    if (chalk.enabled) {
      expect(log.mock.calls[1][0]).toMatch('[37m[1mselect[22m[39m [32m1[39m + [32m1[39m');
    }
  });

});