import { atom } from 'jotai';
import type { CaptionPreset } from '../types/caption';

export const userPresetsAtom = atom<CaptionPreset[]>([]);
