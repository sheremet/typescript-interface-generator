#!/usr/bin/env node

import * as program from "commander";
import * as ora from "ora";
import * as symbols from "log-symbols";
import MySql from "./libs/mysql";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as inquirer from "inquirer";
import { changeType, changeName } from "./libs/tools";
import { IAnswers } from "./libs/interface";

let output = ".";
let style = "none";
let mysqlConfig = {
  "host": "127,0,0,1",
  "port": 3306,
  "user": "root",
  "password": "",
  "database": "",
};

async function main() {
  program.version(require(path.resolve("package.json")).version, "-v ,--version");
  program.on("--help", () => {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log(chalk.blueBright('    ig -h 127.0.0.1 -u root -x passw0rd -d database'));
    console.log('');
  })
  program
    .option("-h, --host [string]", "IP adress/Hostname for database server", "127.0.0.1")
    .option("-p, --port [number]", "Port number for database server", 3306)
    .option("-d, --database <string>", "Database name")
    .option("-u, --user [string]", "Username for database server", "root")
    .option("-x, --pass [string]", "Password for database server", "")
    .option("-o, --output [string]", "Where to place generated models", "output")
    .option("-c, --case-file [string]", "Convert file names to specified case. [choices: \"pascal\",\"param\",\"camel\",\"ipascal\",\"none\"]", "none")
    .parse(process.argv)

  if (process.argv.length <= 2) {
    const answers: IAnswers = await inquirer.prompt([
      {
        type: "rawlist",
        message: "Choose database engine:",
        name: "engine",
        choices: [
          "mysql",
          "mssql",
          "sqllite"
        ]
      },
      {
        type: "input",
        message: "Database adress:",
        name: "host",
        default: "localhost"
      },
      {
        type: "input",
        message: "Database port:",
        name: "port",
        default: 3306
      },
      {
        type: "input",
        message: "Database user name:",
        name: "username",
        default: "root"
      },
      {
        type: "password",
        message: "Database user password:",
        name: "password"
      },
      {
        type: "input",
        message: "Database name:",
        name: "database",
        validate: function (val) {
          if (val.length === 0) {
            return "database name must not be empty"
          }
          return true;
        }
      },
      {
        type: "input",
        message: "Path where generated models should be stored:",
        name: "path",
        default: "/root/code/output"
      },
      {
        type: "confirm",
        message: "Do you want to customize generated model?",
        name: "customize",
        default: false
      },
      {
        type: "list",
        message: "Choose a naming style:",
        name: "style",
        choices: [
          "pascal",
          "param",
          "camel"
        ],
        when: function (answers) {
          return answers["customize"];
        }
      }]);
    if (answers) {
      mysqlConfig.host = answers.host;
      mysqlConfig.port = answers.port;
      mysqlConfig.user = answers.username;
      mysqlConfig.password = answers.password;
      mysqlConfig.database = answers.database;
      output = answers.path
      style = answers.style;
    }
  } else {
    if (program.database === undefined) {
      console.log(symbols.error, "database can not be empty");
      return;
    }
    mysqlConfig = {
      "host": program.host,
      "port": program.port,
      "user": program.user,
      "password": program.pass,
      "database": program.database,
    };
    output = program.output
    style = program.caseFile;
  }
  await doSQL();
  process.exit();
}

async function doSQL() {
  const conn = ora("connection to database").start();
  try {
    const mysql = new MySql(mysqlConfig);
    if (await mysql.getConn()) {
      conn.succeed("Connected database").stop();
      const tables = await mysql.exec<any>("SHOW TABLES");
      if (tables) {
        for (const t of tables) {
          const tableKey = t["Tables_in_" + mysqlConfig.database];
          const te = ora("processing table " + chalk.bgGreen(tableKey)).start();
          const describe = await mysql.exec<any>("DESCRIBE " + tableKey)
          const outputPath = path.resolve(output);
          let genObj = `export interface ${changeName(tableKey, style)} {\n`;
          for (const de of describe) {
            genObj += `   ${[de.Field]}: ${changeType(de.Type)};\n`
          }
          genObj += "}";
          try {
            if (!fs.existsSync(outputPath)) {
              fs.mkdirSync(outputPath);
            }
            fs.writeFileSync(`${outputPath}/${tableKey}.ts`, genObj)
          } catch (error) {
            console.log(symbols.error, error);
            process.exit();
          }
          te.succeed("table " + chalk.bgBlue(tableKey) + " has been processed").stop();
        }
      }
    } else {
      conn.fail("Unable to connect to the database").stop();
    }
  } catch {
    conn.fail("Unable to connect to the database").stop();
  }
}

main();