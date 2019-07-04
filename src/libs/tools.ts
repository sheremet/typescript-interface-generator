import * as changeCase from "change-case";
import * as _ from "lodash";
import { IDescribe } from "./interface";

const toNums = ["float", "double", "decimal"];
const toString = ["text", "date", "datetime", "timestamp", "json"];

export function changeType(type: string) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("int") || toNums.includes(type)) {
    return "number";
  }
  if (lowerType.includes("char") || toString.includes(type)) {
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

export function optionalParam(describe: IDescribe) {
  return describe.Extra === "auto_increment" || describe.Null === "YES" ? "?" : "";
}
