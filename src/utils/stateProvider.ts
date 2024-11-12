/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 GitHub, Inc. and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as core from '@actions/core';

import { Outputs, State } from './constants';

export interface IStateProvider {
  setState(key: string, value: string): void;
  getState(key: string): string;

  getCacheState(): string | undefined;
}

class StateProviderBase implements IStateProvider {
  getCacheState(): string | undefined {
    const cacheKey = this.getState(State.CacheMatchedKey);
    if (cacheKey) {
      core.debug(`Cache state/key: ${cacheKey}`);
      return cacheKey;
    }

    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  setState = (key: string, value: string) => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getState = (key: string) => '';
}

export class StateProvider extends StateProviderBase {
  setState = core.saveState;
  getState = core.getState;
}

export class NullStateProvider extends StateProviderBase {
  stateToOutputMap = new Map<string, string>([
    [State.CacheMatchedKey, Outputs.CacheMatchedKey],
    [State.CachePrimaryKey, Outputs.CachePrimaryKey],
  ]);

  setState = (key: string, value: string) => {
    core.setOutput(this.stateToOutputMap.get(key) as string, value);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getState = (key: string) => '';
}
