import * as _ from "lodash";
import * as changeCase from "change-case";

const toNums = ["float", "double", "decimal"];
const toString = ["text", "date", "datetime", "timestamp", "json"];
export const changeType = (type: string) => {
  const lower_type = type.toLowerCase();
  if (lower_type.includes("int") || toNums.includes(type)) {
    return "number";
  }
  if (lower_type.includes("char") || toString.includes(type)) {
    return "string";
  }
  return type.toString();
}

export function changeName(name: string, style: string) {
  switch (style) {
    case "camel": return changeCase.camel(name);
    case "param": return changeCase.param(name);
    case "pascal": return changeCase.pascal(name);
    case "ipascal": return "I" + changeCase.pascal(name)
  }
  return name;
}