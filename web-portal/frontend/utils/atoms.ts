import { atom } from "jotai";
import { IEndpoint, ISession, IRuleType, IToken } from "./types";
export const sessionAtom = atom<ISession | null>({});
export const appsAtom = atom([]);
export const endpointsAtom = atom<IEndpoint[]>([]);
export const ruleTypesAtom = atom<IRuleType[]>([]);
export const existingRuleValuesAtom = atom<string[]>([]);
export const billingHistoryAtom = atom([]);
export const tokenDataAtom = atom<IToken[]>([]);
