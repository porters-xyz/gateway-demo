import { atom } from "jotai";
import { IEndpoint, ISession } from "./types";
export const sessionAtom = atom<ISession>({});
export const appsAtom = atom([]);
export const endpointsAtom = atom<IEndpoint[]>([]);
