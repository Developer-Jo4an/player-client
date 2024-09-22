const inquirer = require("inquirer");
const fs = require("fs").promises;
const path = require("path");
const generate = require("./generate");
const toCamelCase = require("../toCamelCase");

const getArgv = () => {
  const [cmd, cwd, ...props] = process.argv;
  return {
    cmd,
    cwd,
    ...props.reduce((res, itm) => {
      const [key, ...value] = itm.split("=");
      const k = key.replace(/^-+/g, "");
      const v = value.join("=");
      res[k] = v;
      res[toCamelCase(k)] = v;
      return res;
    }, {})
  };
};
const argv = getArgv();
const type = argv.type || "component";

const DATA = {
  page: {
    inquirers: [
      {
        type: 'input',
        name: 'name',
        message: 'Название страницы',
        default: '',
      }
    ],
    dir: "pages"
  },
  component: {
    dir: "components",
    inquirers: [
      {
        type: 'input',
        name: 'name',
        message: 'Название компонента',
        default: '',
      },
      {
        type: 'list',
        name: 'componentType',
        message: 'Тип компонента',
        choices: [
          {
            "name": "Класс",
            "value": "class"
          },
          {
            "name": "Функция",
            "value": "function"
          }
        ],
        default: (res) => /^[A-Z]/.test(res.name) ? 0 : 1
      }
    ]
  }
}[type];

async function main() {
  const info = await (doInquirer().then(data => generate({...data, type})));

  const saveTo = path.resolve(process.cwd(), DATA.dir);
  info.map(({name, content}) => write(path.resolve(saveTo, name), content));
}

function doInquirer() {
  return inquirer.prompt(DATA.inquirers);
}

async function write(name, content) {
  await fs.mkdir(path.dirname(name), {recursive: true});
  return fs.writeFile(name, content);
}

main();
