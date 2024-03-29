import { atom } from "jotai";
import { ISession } from "./types";
export const sessionAtom = atom<ISession>({});
export const appsAtom = atom([]);
export const endpointsAtoms = atom([]);
