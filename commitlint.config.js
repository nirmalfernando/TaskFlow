/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // new feature
        'fix',      // bug fix
        'chore',    // maintenance, tooling, dependencies
        'docs',     // documentation only
        'refactor', // code change that neither fixes a bug nor adds a feature
        'test',     // adding or correcting tests
        'perf',     // performance improvement
        'style',    // formatting, whitespace — no logic change
        'ci',       // CI/CD pipeline changes
        'build',    // build system or external dependency changes
        'revert',   // reverts a previous commit
      ],
    ],

    'scope-enum': [
      2,
      'always',
      [
        'auth',       // authentication & authorization
        'tasks',      // task management
        'user',       // user management
        'ai',         // AI / Gemini integration
        'server',     // general Express server setup
        'client',     // React frontend
        'db',         // Prisma schema, migrations, database config
        'config',     // environment & app configuration
        'middleware', // Express middlewares
        'routes',     // route definitions
        'ci',         // GitHub Actions / CI pipelines
        'deps',       // dependency updates
        'docs',       // documentation files
        'tests',      // test setup and utilities
      ],
    ],

    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],

    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-min-length': [2, 'always', 5],
    'subject-max-length': [2, 'always', 72],

    'type-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],

    'header-max-length': [2, 'always', 100],

    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },

  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)\((\w+)\):\s(.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
};
