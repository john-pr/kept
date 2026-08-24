import { useState } from "react";

/** Shared open-state pair for the Edit/Delete collection dialogs. */
export function useCollectionDialogs() {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return { editOpen, setEditOpen, deleteOpen, setDeleteOpen };
}
