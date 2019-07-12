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

export interface InformationSchemaTables {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  TABLE_COMMENT: string;
}
export interface InformationSchemaColumns {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  COLUMN_DEFAULT: string;
  IS_NULLABLE: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: number;
  NUMERIC_PRECISION: number;
  NUMERIC_SCALE: number;
  COLUMN_TYPE: string;
  COLUMN_KEY: string;
  COLUMN_COMMENT: string;
}
