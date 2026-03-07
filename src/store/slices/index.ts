/**
 * Shared type helper for Zustand slice creators.
 * Each slice file imports SliceCreator<T> from here to type their creator function.
 */
import type { StateCreator } from "zustand";
import type { EditorState } from "../editorStore";

export type SliceCreator<T> = StateCreator<EditorState, [], [], T>;
