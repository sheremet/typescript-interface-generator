import * as mysql from "mysql";
import { IConfig } from "./interface";

class MySql {
  private pool: mysql.Pool;
  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
    this.init();
  }
  init() {
    this.pool = mysql.createPool({
      ...this.config, queryFormat
    });
  }
  async getConn(): Promise<boolean> {
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err) => {
        if (err) { reject(false); }
        resolve(true);
      });
    });
  }
  async exec<T>(sql: string, params?: object): Promise<T> {
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err || !conn) {
          return reject(err);
        }
        conn.query(sql, params, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
        conn.release();
      });
    });
  }
}
export default MySql;

function queryFormat(query: string, values: object) {
  if (!values) {
    return query;
  }
  return query.replace(/\:(\w+)/g, function (txt: string, key: string) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
}
