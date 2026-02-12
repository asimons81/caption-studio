import { atomWithStorage } from 'jotai/utils';

export const autoTranscribeOnImportAtom = atomWithStorage<boolean>(
  'caption-studio:autoTranscribeOnImport',
  true
);

