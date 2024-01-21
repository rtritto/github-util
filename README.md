# Install
`yarn add github-util@github:rtritto/github-util`


# Example
```ts
import { downloadRelease } from 'github-util'

await downloadRelease('darkreader', 'darkreader', 1, './output')
```