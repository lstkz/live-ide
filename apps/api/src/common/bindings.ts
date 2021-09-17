import * as R from 'remeda';
import fs from 'fs';
import Path from 'path';
import {
  BaseBinding,
  CreateEventBindingOptions,
  CreateRpcBindingOptions,
  CreateTaskBindingOptions,
} from '../lib';

function walk(dir: string) {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = Path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.push(...walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

let bindings: any[] = null!;

export function getBindings(type: 'rpc'): CreateRpcBindingOptions[];
export function getBindings(type: 'event'): CreateEventBindingOptions<any>[];
export function getBindings(type: 'task'): CreateTaskBindingOptions<any>[];
export function getBindings(
  type: 'rpc' | 'event' | 'task'
):
  | CreateRpcBindingOptions[]
  | CreateEventBindingOptions<any>[]
  | CreateTaskBindingOptions<any>[] {
  if (!bindings) {
    bindings = R.flatMap(walk(Path.join(__dirname, '../contracts')), file =>
      require(file)
    );
  }
  return R.pipe(
    bindings,
    R.flatMap(obj => Object.values(obj) as BaseBinding<string, any>[]),
    R.filter(x => x.isBinding && x.type === type),
    R.map(x => x.options)
  );
}
