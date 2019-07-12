/**
 * {{tableComment}}
 */
export interface {{tableName}} {
{{#columns}}
  /**
   * {{comment}}
   */
  {{fields}}{{optional}}: {{type}};
{{/columns}}
}
