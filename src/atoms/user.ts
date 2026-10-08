import { atom } from "jotai";

import type { User } from "@/lib/definitions";

export const userAtom = atom<User | null>(null);
