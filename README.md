# table-to-interface

Generate the interface of the database tables for typescript projects.(Currently only mysql is supported)

## Usage

### Install

```bash
(sudo) npm i table-to-interface -g
```

### Options

```bash
  -v ,--version             output the version number
  -h, --host [string]       IP adress/Hostname for database server (default: "127.0.0.1")
  -p, --port [number]       Port number for database server (default: 3306)
  -d, --database <string>   Database name
  -u, --user [string]       Username for database server (default: "root")
  -x, --pass [string]       Password for database server (default: "")
  -o, --output [string]     Where to place generated models (default: "/users/current_user/output")
  -c, --case-file [string]  Convert file names to specified case.
                            [choices: "ipascal", "pascal","param","camel","none"] (default: "none")
  -O, --open                Whether to open the target path
```

> ipascal like `IHelloWorld`

```bash
ig -h 127.0.0.1 -u root -x passw0rd -d database
```

### Example
``` typescript
/**
 * Generated from table comment
 */
export interface IAdminMenu {
  /**
   * Generated from the id comment
   */
  id?: number;
  /**
   * Generated from the title comment
   */
  title?: string;
  /**
   * Generated from the path comment
   */
  path: string;
  /**
   * Generated from the path comment
   */
  icon: string;
  
  ... and more
}

```

Enjoy your time!!!
