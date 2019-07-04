#!/usr/bin/env node

import chalk from "chalk";
import { exec } from "child_process";
import * as program from "commander";
import * as fs from "fs";
import * as inquirer from "inquirer";
import * as symbols from "log-symbols";
import * as ora from "ora";
import { type } from "os";
import * as path from "path";
import { version } from "../package.json";
import { IAnswers } from "./libs/interface";
import MySql from "./libs/mysql";
import { changeName, changeType, optionalParam } from "./libs/tools";
let output = (process.env.HOME || process.env.USERPROFILE);
if (type() === "Windows_NT") {
  output += "\\output";
} else {
  output += "/output";
}
let style = "none";
let mysqlConfig = {
  host: "127,0,0,1",
  port: 3306,
  user: "root",
  password: "",
  database: "",
};
let openFolder = false;
async function main() {
  program.version(version, "-v ,--version");
  program.on("--help", () => {
    console.log("");
    console.log("  Examples:");
    console.log("");
    console.log(chalk.blueBright("    ig -h 127.0.0.1 -u root -x passw0rd -d database"));
    console.log("");
  });
  program
    .option("-h, --host [string]", "IP adress/Hostname for database server", "127.0.0.1")
    .option("-p, --port [number]", "Port number for database server", 3306)
    .option("-d, --database <string>", "Database name")
    .option("-u, --user [string]", "Username for database server", "root")
    .option("-x, --pass [string]", "Password for database server", "")
    .option("-o, --output [string]", "Where to place generated models", output)
    .option("-c, --case-file [string]", `Convert file names to specified case.
                                         [choices: "ipascal", "pascal","param","camel","none"]`, "none")
    .option("-O, --open", "Whether to open the target path", false)
    .parse(process.argv);

  if (process.argv.length <= 2) {
    const answers: IAnswers = await inquirer.prompt([
      // {
      //   type: "list",
      //   message: "Choose database engine:",
      //   name: "engine",
      //   choices: [
      //     "mysql",
      //     "mssql",
      //     "sqllite"
      //   ]
      // },
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
        validate(val) {
          if (val.length === 0) {
            return "database name must not be empty";
          }
          return true;
        }
      },
      {
        type: "input",
        message: "Path where generated models should be stored:",
        name: "path",
        default: output
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
          "ipascal",
          "pascal",
          "param",
          "camel"
        ],
        default: "ipascal",
        when(answer) {
          return answer.customize;
        }
      },
      {
        type: "confirm",
        message: "Open the file directory?",
        name: "open",
        default: false
      }]);
    if (answers) {
      mysqlConfig.host = answers.host;
      mysqlConfig.port = answers.port;
      mysqlConfig.user = answers.username;
      mysqlConfig.password = answers.password;
      mysqlConfig.database = answers.database;
      output = answers.path;
      style = answers.style;
      openFolder = answers.open;
    }
  } else {
    if (program.database === undefined) {
      console.log(symbols.error, "database can not be empty");
      return;
    }
    mysqlConfig = {
      host: program.host,
      port: program.port,
      user: program.user,
      password: program.pass,
      database: program.database,
    };
    output = program.output;
    style = program.caseFile;
    openFolder = program.open;
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
          const describe = await mysql.exec<any>("DESCRIBE " + tableKey);
          const outputPath = path.resolve(output);
          let genObj = `export interface ${changeName(tableKey, style)} {\n`;
          for (const de of describe) {
            genObj += `   ${[de.Field]}${optionalParam(de)}: ${changeType(de.Type)};\n`;
          }
          genObj += "}";
          try {
            if (!fs.existsSync(outputPath)) {
              fs.mkdirSync(outputPath);
            }
            fs.writeFileSync(`${outputPath}/${tableKey}.ts`, genObj);
          } catch (error) {
            console.log(symbols.error, error);
            process.exit();
          }
          te.succeed("table " + chalk.bgBlue(tableKey) + " has been processed").stop();
        }
        if (openFolder) {
          if (type() === "Windows_NT") {
            exec(`explorer.exe ${output}`);
          } else {
            exec(`open ${output.replace("\\", "\\")}`);
          }
        }
      } else {
        conn.fail("Cannot found the database table").stop();
      }
    } else {
      conn.fail("Unable to connect to the database").stop();
    }
  } catch {
    conn.fail("Unable to connect to the database").stop();
  }
}

main();
