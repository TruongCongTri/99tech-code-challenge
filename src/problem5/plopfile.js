export default function (plop) {
  // MODULE PACKAGE GENERATOR
  plop.setGenerator('module', {
    description: 'Create an Enterprise Module (5 files)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the new module? (e.g., course, user, product_category):',
        validate: function (value) {
          if ((/.+/).test(value)) { return true; }
          return 'Module name cannot be empty';
        }
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.route.ts',
        templateFile: 'plop-templates/module/route.ts.hbs'
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.controller.ts',
        templateFile: 'plop-templates/module/controller.ts.hbs'
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.service.ts',
        templateFile: 'plop-templates/module/service.ts.hbs'
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.repository.ts',
        templateFile: 'plop-templates/module/repository.ts.hbs'
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.schema.ts',
        templateFile: 'plop-templates/module/schema.ts.hbs'
      }
      // Tùy chọn nâng cao: Bạn có thể thêm action 'modify' để tự động import route này vào src/modules/router.ts
    ]
  });

  // UTILS/HELPERS GENERATOR
  plop.setGenerator('common', {
    description: 'Create a file in the src/common/ directory',
    prompts: [
      {
        type: 'list',
        name: 'folder',
        message: 'Where do you want to create the file in common?',
        choices: ['utils', 'helpers', 'services', 'configs']
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the file? (e.g., format-date):'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/common/{{folder}}/{{dashCase name}}.{{singularize folder}}.ts',
        template: 'export const {{camelCase name}} = () => {\n  // Code here\n};\n'
      }
    ]
  });
  
  // HELPER changes the plural folder name to singular for the filename
  plop.setHelper('singularize', (text) => text.replace(/s$/, ''));
};