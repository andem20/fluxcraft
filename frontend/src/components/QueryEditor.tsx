import Editor from "@monaco-editor/react";

interface QueryEditorProps {
  onChange: (value: string) => void;
  onSubmitShortcut: () => void;
  beforeMount: (monaco: typeof import("monaco-editor")) => void;
}

export function QueryEditor({
  onChange,
  onSubmitShortcut,
  beforeMount,
}: QueryEditorProps) {
  function handleEditorDidMount(
    editor: import("monaco-editor").editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      onSubmitShortcut
    );
  }

  return (
    <Editor
      height="15rem"
      defaultLanguage="sql"
      onChange={(value) => onChange(value ?? "")}
      beforeMount={beforeMount}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        lineNumbers: "on",
        fontSize: 16,
        wordWrap: "off",
      }}
    />
  );
}
