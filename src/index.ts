#!/usr/bin/env node

import chalk from "chalk";
import { exec } from "child_process";
import * as program from "commander";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as inquirer from "inquirer";
import * as symbols from "log-symbols";
import * as ora from "ora";
import { type } from "os";
import * as path from "path";
import { version } from "../package.json";
import { IAnswers, InformationSchemaColumns, InformationSchemaTables } from "./libs/interface";
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
  host: "127.0.0.1",
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
    .option("-h, --host [string]", "IP adress/Hostname for database server", mysqlConfig.host)
    .option("-p, --port [number]", "Port number for database server", mysqlConfig.port)
    .option("-d, --database <string>", "Database name")
    .option("-u, --user [string]", "Username for database server", mysqlConfig.user)
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
        default: mysqlConfig.host
      },
      {
        type: "input",
        message: "Database port:",
        name: "port",
        default: mysqlConfig.port
      },
      {
        type: "input",
        message: "Database user name:",
        name: "username",
        default: mysqlConfig.user
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
  const conn = ora("connecting to database...").start();
  try {
    const schemaConfig = { ...mysqlConfig, database: "information_schema" };
    const mysql = new MySql(schemaConfig);
    await mysql.getConn().then(async () => {
      conn.succeed("Connected database").stop();
      const tables = await mysql.exec<InformationSchemaTables[]>(`
        SELECT TABLE_SCHEMA, TABLE_NAME,TABLE_COMMENT
        FROM information_schema.TABLES
        WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA = '${mysqlConfig.database}'`);
      if (tables && tables.length > 0) {
        for (const t of tables) {
          const columns = await mysql.exec<InformationSchemaColumns[]>(`
          SELECT TABLE_NAME,COLUMN_NAME,COLUMN_DEFAULT,IS_NULLABLE,
                 DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,NUMERIC_PRECISION,NUMERIC_SCALE,
                 CASE WHEN EXTRA like '%auto_increment%' THEN 1 ELSE 0 END IsIdentity,
                 COLUMN_TYPE, COLUMN_KEY,COLUMN_COMMENT
          FROM information_schema.COLUMNS
          WHERE TABLE_NAME = '${t.TABLE_NAME}' AND TABLE_SCHEMA = '${mysqlConfig.database}';`);
          const te = ora("processing table " + chalk.bgGreen(t.TABLE_NAME)).start();
          const outputPath = path.resolve(output);
          const source = fs.readFileSync(path.resolve(__dirname, "./templete.tpl")).toString();
          const compileData = {
            tableComment: t.TABLE_COMMENT ? t.TABLE_COMMENT : changeName(t.TABLE_NAME, style),
            tableName: changeName(t.TABLE_NAME, style),
            columns: []
          };
          for (const de of columns) {
            compileData.columns.push({
              comment: !de.COLUMN_COMMENT ? de.COLUMN_NAME : de.COLUMN_COMMENT,
              fields: de.COLUMN_NAME,
              optional: optionalParam(de.IS_NULLABLE),
              type: changeType(de.DATA_TYPE, de.COLUMN_TYPE)
            });
          }
          const result = handlebars.compile(source)(compileData);
          try {
            if (!fs.existsSync(outputPath)) {
              fs.mkdirSync(outputPath);
            }
            fs.writeFileSync(`${outputPath}/${t.TABLE_NAME}.ts`, result);
          } catch (error) {
            console.log(symbols.error, error);
            process.exit();
          }
          te.succeed("table " + chalk.bgBlue(t.TABLE_NAME) + " has been processed").stop();
          if (openFolder) {
            if (type() === "Windows_NT") {
              exec(`explorer.exe ${output}`);
            } else {
              exec(`open ${output.replace("\\", "\\")}`);
            }
          }
        }
      }
    }).catch((error) => {
      console.log(error);
      conn.fail(error.message).stop();
    });
  } catch (error) {
    console.log(error);
    conn.fail(error.message).stop();
  }
}
main();
