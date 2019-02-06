With yarn:
```
yarn add --dev babel-cli babel-preset-flow flow-bin
```

With npm:
```
npm install --save-dev babel-cli babel-preset-flow flow-bin babel-eslint eslint-plugin-flowtype babel-preset-env
```

Or better, install the npm dependencies from the package.json:
```
npm install
```

Plugin for VSCode: https://github.com/flowtype/flow-for-vscode

Manually via terminal:
```
yarn run flow
```

To add flow to mocha tests, you need to add this line:
```
import { describe, it } from 'mocha';
```