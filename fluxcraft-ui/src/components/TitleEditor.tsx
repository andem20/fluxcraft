import { TextField } from "@mui/material";
import { useState } from "react";

export function TitleEditor({
  initialTitle,
  onCommit,
  setIsEditing,
}: {
  id: number;
  initialTitle: string;
  onCommit: (title: string) => void;
  setIsEditing: (v: boolean) => void;
}) {
  const [value, setValue] = useState(initialTitle);

  return (
    <TextField
      variant="standard"
      placeholder="Cell title"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => {
        setIsEditing(true);
        e.stopPropagation();
      }}
      onBlur={() => {
        setIsEditing(false);
        onCommit(value);
      }}
      onChange={(e) => setValue(e.target.value)}
      slotProps={{
        input: {
          disableUnderline: true,
          sx: { fontSize: "1.2rem" },
        },
      }}
      fullWidth
    />
  );
}
