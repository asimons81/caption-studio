import { atom } from 'jotai';

export const isUploadModalOpenAtom = atom<boolean>(false);

export const activeEditorTabAtom = atom<string>('captions');

export const timelineZoomAtom = atom<number>(1); // 1 = default, 2 = 2x zoom, etc.

export const isTranscribingAtom = atom<boolean>(false);

export const transcriptionProgressAtom = atom<number>(0);

export const isExportingAtom = atom<boolean>(false);

export const exportProgressAtom = atom<number>(0);
