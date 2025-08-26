import Editor from "@monaco-editor/react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";

interface QueryEditorProps {
  onChange: (value: string) => void;
  onSubmitShortcut: () => void;
  beforeMount: (monaco: typeof import("monaco-editor")) => void;
  key: string;
}

export function QueryEditor({
  onChange,
  onSubmitShortcut,
  beforeMount,
}: QueryEditorProps) {
  const darkModeSelector = useSelector(
    (state: RootState) => state.darkMode.enabled
  );

  function handleEditorDidMount(
    editor: import("monaco-editor").editor.IStandaloneCodeEditor,
    _monaco: typeof import("monaco-editor")
  ) {
    const domNode = editor.getDomNode();
    if (!domNode) return;

    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (editor.hasTextFocus()) {
          e.preventDefault();
          onSubmitShortcut();
        }
      }
    };

    domNode.addEventListener("keydown", keyHandler);

    editor.onDidDispose(() => {
      domNode.removeEventListener("keydown", keyHandler);
    });
  }

  return (
    <Editor
      height="10rem"
      defaultLanguage="sql"
      onChange={(value) => onChange(value ?? "")}
      beforeMount={beforeMount}
      onMount={handleEditorDidMount}
      theme={darkModeSelector ? "vs-dark" : "vs-light"}
      options={{
        minimap: { enabled: false },
        lineNumbers: "on",
        fontSize: 16,
        wordWrap: "off",
      }}
    />
  );
}
