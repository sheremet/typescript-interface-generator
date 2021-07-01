export interface {{tableName}} {
{{#columns}}
  {{fields}}{{optional}}: {{type}};
{{/columns}}
}
