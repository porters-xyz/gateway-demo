import { customAlphabet } from "nanoid";
export const NANO_ID_LENGTH = 10; // https://zelark.github.io/nano-id-cc/
export const PORTR_ADDRESS = '0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944';
export const NANO_ID_ALPHABETS = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';
export const nanoid = () => customAlphabet(NANO_ID_ALPHABETS, NANO_ID_LENGTH);
