
export interface IAnswers {
  engine: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  path: string;
  customize: boolean;
  style: string;
}

export interface IConfig {
  "host": string;
  "port": number;
  "user": string;
  "password": string;
  "database": string;
}
