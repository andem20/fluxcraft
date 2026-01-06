import * as wasm from "polars-wasm";

let providerDisposable: import("monaco-editor").IDisposable | undefined;

export function useSqlCompletions(
  dfSelector?: wasm.JsDataFrame,
  fluxcraftSelector?: any
) {
  return (monaco: typeof import("monaco-editor")) => {
    providerDisposable?.dispose();

    providerDisposable = monaco.languages.registerCompletionItemProvider(
      "sql",
      {
        provideCompletionItems: () => {
          const suggestionMap = new Map<string, any>();

          const add = (item: any) => {
            const key = `${item.kind}:${item.label}`;
            if (!suggestionMap.has(key)) {
              suggestionMap.set(key, item);
            }
          };

          if (fluxcraftSelector) {
            fluxcraftSelector.get_dataframe_names().forEach((table: string) => {
              add({
                label: table,
                kind: monaco.languages.CompletionItemKind.Struct,
                insertText: table,
                detail: "Table",
                documentation: `Table: ${table}`,
              });
            });
          }

          if (dfSelector) {
            dfSelector
              .get_headers?.()
              ?.forEach((header: wasm.ColumnHeaderJS) => {
                const headerName = header.get_name();
                add({
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
            add({
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
            "DATE_TRUNC",
            "JSON_VALUE",
          ].forEach((func) =>
            add({
              label: func,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${func}()`,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: "Function",
              documentation: `SQL function: ${func}`,
            })
          );

          return { suggestions: Array.from(suggestionMap.values()) };
        },
      }
    );
  };
}
