import { atom } from "jotai";

export type ProfileStepData = {
  name: string;
  birthDate: string;
};

export type PostStepData = {
  content: string;
  date: string;
};

export type ReflectionStepData = {
  learned: string;
  nextStudy: string;
};

export const profileStepAtom = atom<ProfileStepData>({
  name: "",
  birthDate: "",
});

export const postStepAtom = atom<PostStepData>({
  content: "",
  date: "",
});

export const reflectionStepAtom = atom<ReflectionStepData>({
  learned: "",
  nextStudy: "",
});
