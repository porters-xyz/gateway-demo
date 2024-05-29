import { atom } from "jotai";

import { IEndpoint, ISession, IRuleType, IBill, INotification } from "./types";
export const sessionAtom = atom<ISession | null>(null);
export const appsAtom = atom([]);
export const endpointsAtom = atom<IEndpoint[]>([]);
export const ruleTypesAtom = atom<IRuleType[]>([]);
export const existingRuleValuesAtom = atom<string[]>([]);
export const billingHistoryAtom = atom<IBill[]>([]);
export const notificationAtom = atom<INotification | null>(null);
