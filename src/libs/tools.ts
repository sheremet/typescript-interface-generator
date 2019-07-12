import * as changeCase from "change-case";

export function changeType(dataType: string, columnType: string) {
  switch (dataType) {
    case "int":
      return "number";
    case "bit":
      if (columnType === "bit(1)") {
        return "boolean";
      } else {
        return "number";
      }
    case "tinyint":
      if (columnType === "tinyint(1)") {
        return "boolean";
      } else {
        return "number";
      }
    case "smallint":
      return "number";
    case "mediumint":
      return "number";
    case "bigint":
      return "string";
    case "float":
      return "number";
    case "double":
      return "number";
    case "decimal":
      return "string";
    case "date":
      return "string";
    case "datetime":
      return "Date";
    case "timestamp":
      return "Date";
    case "time":
      return "string";
    case "year":
      return "number";
    case "char":
      return "string";
    case "varchar":
      return "string";
    case "blob":
      return "Buffer";
    case "text":
      return "string";
    case "tinyblob":
      return "Buffer";
    case "tinytext":
      return "string";
    case "mediumblob":
      return "Buffer";
    case "mediumtext":
      return "string";
    case "longblob":
      return "Buffer";
    case "longtext":
      return "string";
    case "enum":
      return "string";
    case "json":
      return "object";
    case "binary":
      return "Buffer";
    case "varbinary":
      return "Buffer";
    case "geometry":
      return "string";
    case "point":
      return "string";
    case "linestring":
      return "string";
    case "polygon":
      return "string";
    case "multipoint":
      return "string";
    case "multilinestring":
      return "string";
    case "multipolygon":
      return "string";
    case "geometrycollection":
    case "geomcollection":
      return "string";
    default:
      return "unknown";
  }
}

export function changeName(name: string, style: string) {
  switch (style) {
    case "camel": return changeCase.camel(name);
    case "param": return changeCase.param(name);
    case "pascal": return changeCase.pascal(name);
    case "ipascal": return "I" + changeCase.pascal(name);
  }
  return name;
}

export function optionalParam(isNullable: string) {
  return isNullable === "NO" ? "?" : "";
}
