# rust-wasm-lib-first-lesson

## dev

```bash
$ make clean-all
$ make setup
$ pnpm dev
```

## build

```bash
$ pnpm build
$ pnpm preview
```

`@nap5/gnrng-id`は npmレジストリにパブリッシュできたのですが、インストールしてみるとWasmが梱包されておらず、実行時にエラーになることを確認できました。
`@nap5/gnrng-id`だけでなく、`@nap5/gnrng-id-wasm`も `npm,jsr` にパブリッシュしたほうがモノレポの今の名前空間の構成を活かせそうかなと。
そうすれば、`@nap5/gnrng-id`をPublishしたときに、`@nap5/gnrng-id-wasm`の依存あれば、そのまま梱包物にWasmが含まれるのでは？

`packages/crates/gnrng-id` の `pkg` を `@nap5/gnrng-id-wasm` としてパブリッシュするので、
パブリッシュに必要な資産は`packages/crates/gnrng-id`配下に置きたいです

これが実現できれば、使い勝手良い構成になりそうな印象でして、検討したいです

これを実現する可能性を分析して実現可能であれば、修正が必要になるファイルの一覧をリストアップしてください。
そのうえで、修正が必要なファイルに対して修正内容を含む全量をそれぞれ提案してください。

```bash
$ cat src/__tests__/index.test.ts
import { describe } from 'vitest'
import { Gnrng } from '@nap5/gnrng-id'

describe('xxx', () => {
  const rng = new Gnrng('batch-seed')
  const randomNumbers = rng.nextBatch(10) // 10k numbers at once
  // const diceRolls = rng.nextRangeBatch(1, 6, 1000) // 1k dice rolls

  console.log(randomNumbers)
})

aine 19:28:02 ~/wrksp$
$ npm run test

> test
> vitest --config ./vitest.config.ts


 DEV  v1.6.1 /home/aine/wrksp
      Coverage enabled with istanbul

 ❯ src/__tests__/index.test.ts (0)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/__tests__/index.test.ts [ src/__tests__/index.test.ts ]
Error: Cannot find package '@nap5/gnrng-id-wasm' imported from /home/aine/wrksp/node_modules/@nap5/gnrng-id/dist/index.js
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'ERR_MODULE_NOT_FOUND' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed (1)
      Tests  no tests
   Start at  19:30:25
   Duration  276ms (transform 33ms, setup 0ms, collect 0ms, tests 0ms, environment 0ms, prepare 82ms)


 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
```
