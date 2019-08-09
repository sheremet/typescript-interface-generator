import * as changeCase from "change-case";

export function changeType(dataType: string, columnType: string) {
  switch (dataType) {
    case "int":
    case "smallint":
    case "mediumint":
    case "bigint":
    case "float":
    case "double":
    case "decimal":
    case "year":
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
    case "date":
    case "time":
    case "char":
    case "varchar":
    case "text":
    case "tinytext":
    case "mediumtext":
    case "longtext":
    case "enum":
    case "geometry":
    case "point":
    case "linestring":
    case "polygon":
    case "multipoint":
    case "multilinestring":
    case "multipolygon":
    case "geometrycollection":
    case "geomcollection":
      return "string";

    case "datetime":
      return "Date";
    case "timestamp":
      return "Date";

    case "blob":
    case "tinyblob":
    case "mediumblob":
    case "longblob":
    case "binary":
    case "varbinary":
      return "Buffer";

    case "json":
      return "object";
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
  return isNullable === "NO" ? "" : "?";
}
