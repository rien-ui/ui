#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const process = require("process");

// 명령줄 인자에서 name을 가져옵니다.
const [, , name] = process.argv;

if (!name) {
  console.error("Usage: create-react-pattern <name>");
  process.exit(1);
}

// 디렉토리 경로 설정
const baseDir = path.join(__dirname, "../packages/react", name);
const srcDir = path.join(baseDir, "src");

// 디렉토리를 생성하는 함수
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
};

// 파일을 생성하는 함수
const createFile = (filePath, content) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`File created: ${filePath}`);
  } else {
    console.log(`File already exists: ${filePath}`);
  }
};

// package.json 템플릿
const packageJsonContent = {
  name: `@rien-ui/react-${name}`,
  version: "0.1.0",
  license: "MIT",
  exports: {
    ".": {
      import: {
        types: "./dist/index.d.mts",
        default: "./dist/index.mjs",
      },
      require: {
        types: "./dist/index.d.ts",
        default: "./dist/index.js",
      },
    },
  },
  source: "./src/index.ts",
  main: "./dist/index.js",
  module: "./dist/index.mjs",
  types: "./dist/index.d.ts",
  files: ["dist", "README.md"],
  sideEffects: false,
  scripts: {
    clean: "rm -rf dist",
    version: "yarn version",
  },
  dependencies: {},
  devDependencies: {},
  peerDependencies: {
    "@types/react": "*",
    "@types/react-dom": "*",
    react: "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
    "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
  },
  peerDependenciesMeta: {
    "@types/react": {
      optional: true,
    },
    "@types/react-dom": {
      optional: true,
    },
  },
  // TODO: homepage, repository, bugs 추가
};

// README.md 템플릿
const readmeContent = `# react-${name}

## Installation

\`\`\`sh
$ yarn add @rien-ui/react-primitive
# or
$ npm install @rien-ui/react-primitive
\`\`\`

## Usage
This is an internal utility, not intended for public usage.\n`;

// tsx 파일 이름 변경
const toCamelCase = (str) =>
  str
    .split(/[\s-_]+/)
    .map(
      (word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // 첫 번째 단어 이후는 첫 글자만 대문자로 변환
    )
    .join("");

// 디렉토리와 파일 생성
createDirectory(baseDir);
createDirectory(srcDir);
createFile(path.join(baseDir, "package.json"), JSON.stringify(packageJsonContent, null, 2));
createFile(path.join(baseDir, "README.md"), readmeContent);
createFile(path.join(srcDir, `${toCamelCase(name)}.tsx`), "");
createFile(path.join(srcDir, `index.ts`), "");

console.log("Project structure created successfully!");
