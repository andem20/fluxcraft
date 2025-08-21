import * as wasm from "polars-wasm";

export function useSqlCompletions(
  dfSelector?: wasm.DataFrameJS,
  fluxcraftSelector?: any
) {
  return (monaco: typeof import("monaco-editor")) => {
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: () => {
        const suggestions = [];

        if (fluxcraftSelector) {
          suggestions.push(
            ...fluxcraftSelector.get_dataframe_names().map((table: string) => ({
              label: table,
              kind: monaco.languages.CompletionItemKind.Struct,
              insertText: table,
              detail: "Table",
              documentation: `Table: ${table}`,
            }))
          );
        }

        if (dfSelector) {
          dfSelector.get_headers?.()?.forEach((header: wasm.ColumnHeaderJS) => {
            const headerName = header.get_name();
            suggestions.push({
              label: headerName,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: headerName.includes(" ")
                ? `"${headerName}"`
                : headerName,
              detail: `Column (${header.get_dtype()})`,
              documentation: `Column in dataframe: ${headerName}`,
            });
          });
        }

        [
          "SELECT",
          "FROM",
          "WHERE",
          "GROUP BY",
          "ORDER BY",
          "LIMIT",
          "INSERT",
          "UPDATE",
          "DELETE",
          "JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "CREATE TABLE",
          "DROP TABLE",
          "ALTER TABLE",
        ].forEach((word) =>
          suggestions.push({
            label: word,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: word,
            detail: "Keyword",
          })
        );

        [
          "COUNT",
          "AVG",
          "SUM",
          "MIN",
          "MAX",
          "NOW",
          "LOWER",
          "UPPER",
          "COALESCE",
          "UNNEST",
        ].forEach((func) =>
          suggestions.push({
            label: func,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `${func}()`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "Function",
            documentation: `SQL function: ${func}`,
          })
        );

        return { suggestions };
      },
    });
  };
}
