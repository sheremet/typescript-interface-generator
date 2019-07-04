
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
  open: boolean;
}

export interface IConfig {
  "host": string;
  "port": number;
  "user": string;
  "password": string;
  "database": string;
}

export interface IDescribe {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}
