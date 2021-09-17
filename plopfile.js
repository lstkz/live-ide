const path = require('path');
const fs = require('fs');

module.exports = function generate(plop) {
  plop.setGenerator('module', {
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'choose feature name in PascalCase (e.g. ErrorModal)',
        basePath: '.',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: path.join(__dirname, 'app/src/components'),
        base: '.blueprints/module',
        templateFiles: '.blueprints/module/**/**',
      },
    ],
  });
  plop.setGenerator('feature', {
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'choose feature name in camelCase (e.g. myFeature)',
        basePath: '.',
      },
      {
        type: 'input',
        name: 'page',
        message: 'choose page name in dash-case (e.g. my-page)',
        basePath: '.',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: path.join(__dirname, 'app/src/features'),
        base: '.blueprints/feature',
        templateFiles: '.blueprints/feature/**/**',
      },
      {
        type: 'addMany',
        destination: path.join(__dirname, 'app/src/pages'),
        base: '.blueprints/page',
        templateFiles: '.blueprints/page/**/**',
      },
    ],
  });
  plop.setGenerator('feature2', {
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'choose feature name in camelCase (e.g. myFeature)',
        basePath: '.',
      },
      {
        type: 'input',
        name: 'page',
        message: 'choose page name in dash-case (e.g. my-page)',
        basePath: '.',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: path.join(__dirname, 'app/src/features'),
        base: '.blueprints/feature2',
        templateFiles: '.blueprints/feature2/**/**',
      },
      {
        type: 'addMany',
        destination: path.join(__dirname, 'app/src/pages'),
        base: '.blueprints/page2',
        templateFiles: '.blueprints/page2/**/**',
      },
    ],
  });

  plop.setActionType('addToDbFile', function (answers, config, plop) {
    const targetPath = path.join(__dirname, 'apps/api/src/db.ts');
    let content = fs.readFileSync(targetPath, 'utf8');
    content = content.replace(
      /( *)(\/\/ APPEND)/,
      `$1require('./collections/${answers.name}'),\n$1$2`
    );
    fs.writeFileSync(targetPath, content);
  });

  plop.setGenerator('collection', {
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'choose feature name in PascalCase (e.g. SolutionVote)',
        basePath: '.',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: path.join(__dirname, 'apps/api/src/collections'),
        base: '.blueprints/collection',
        templateFiles: '.blueprints/collection/**/**',
      },
      {
        type: 'addToDbFile',
      },
    ],
  });

  plop.setGenerator('contract', {
    prompts: [
      {
        type: 'input',
        name: 'ns',
        message: 'choose ns name in camelCase (e.g. user)',
        basePath: '.',
      },
      {
        type: 'input',
        name: 'name',
        message: 'choose contract name in camelCase (e.g. registerUser)',
        basePath: '.',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: path.join(__dirname, 'apps/api/src/contracts'),
        base: '.blueprints/contract',
        templateFiles: '.blueprints/contract/**/**',
      },
    ],
  });
};
