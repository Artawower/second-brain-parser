import { parse } from "uniorg-parse/lib/parser.js";
import { OrgData } from "uniorg";
import toVFile from "to-vfile";

import {
  Note,
  collectNote,
  NodeMiddleware,
  isOrgFile,
  createLinkMiddleware,
  createPreviewImageMiddleware,
} from "./parser/index.js";
import { readdirSync, Dirent, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { stringify } from "uniorg-stringify/lib/stringify.js";

const readOrgFileContent = (filePath: string): OrgData => {
  const orgFile = toVFile.readSync(filePath);
  // TODO: handle "no such file or directory error"
  return parse(orgFile as any);
};

const collectNoteFromFile = (
  filePath: string,
  middlewareChains?: NodeMiddleware[]
): Note => {
  const isFileExist = existsSync(filePath);
  if (!isFileExist) {
    console.warn(`${filePath} does not exist`);
    return null;
  }
  const orgContent = readOrgFileContent(filePath);
  const [note, updatedOrgData] = collectNote(orgContent, middlewareChains);
  // TODO: rewrite this code as external callback function or flag for safety parsing
  // add optional possibility for disabling file override functional
  writeFileSync(filePath, stringify(updatedOrgData));
  return note;
};

/*
 * Internal function for pretty printing the org content as nested tree
 */
const debugPrettyPrint = (o: { children: any[] }, level: number = 0) => {
  console.log(" ".repeat(level), o);
  if (!o.children) {
    return;
  }
  o.children.forEach((c) => debugPrettyPrint(c, level + 2));
};

const collectNotesFromDir = (dir: string): Note[] => {
  const files = readdirSync(dir, { withFileTypes: true });
  const notes = files.reduce((notes: Note[], dirent: Dirent) => {
    const isDir = dirent.isDirectory();
    const fileName = resolve(dir, dirent.name);
    const middlewares = [
      createLinkMiddleware(dir),
      createPreviewImageMiddleware(dir),
    ];

    if (!isOrgFile(fileName)) {
      return notes;
    }

    if (isDir) {
      return [...notes, ...collectNotesFromDir(fileName)];
    }

    const collectedNote = collectNoteFromFile(fileName, middlewares);
    if (collectedNote) {
      return [...notes, collectedNote];
    }
    return notes;
  }, []);

  return notes;
};

const collectOrgNotesFromDir = (dir: string): Note[] => {
  const notes = collectNotesFromDir(dir);
  return notes.filter((n) => n.id);
};

export {
  collectNoteFromFile,
  collectNotesFromDir,
  stringify,
  collectOrgNotesFromDir,
  createLinkMiddleware,
  createPreviewImageMiddleware,
  collectNote,
};

// const note = collectNoteFromFile('./miscellaneous/test1.org');

// console.log(stringify(note.content));
// debugPrettyPrint(readOrgFileContent('./miscellaneous/test1.org'));
// debugPrettyPrint(readOrgFileContent('./miscellaneous/test2.org'));
//
// console.log(readOrgFileContent('./miscellaneous/test1.org'));
// console.log(collectNotesFromDir('/Volumes/DARK SIDE/projects/pet/roam/moonbrain/miscellaneous'));
// console.log(JSON.stringify(collectNotesFromFile('./miscellaneous/test1.org'), null, 2));
// console.log(makeOrgTreeFromFile('./miscellaneous/test1.org'));

// console.log('🦄: [line 63][index.ts<2>] [35mstringify: ', stringify(note.content));

// TODO: master This logic should be moved to external npm package
// const notes = collectNotesFromDir(join(resolve(), 'miscellaneous'));
// const n = collectNoteFromFile(join(resolve(), 'miscellaneous', 'test2.org'), [
//   createLinkMiddleware(join(resolve(), 'miscellaneous')),
// ]);
// debugPrettyPrint(
//   readOrgFileContent('/Volumes/DARK SIDE/Yandex.Disk.localized/Dropbox/org-roam/it/typescript/custom-linter-rules.org')
// );

const n = collectNoteFromFile(
  "/Users/darkawower/Yandex.Disk.localized/Dropbox/org-roam/pet/second-brain-plan.org",
  [
    createLinkMiddleware(
      "/Users/darkawower/Yandex.Disk.localized/Dropbox/org-roam/pet"
    ),
    createPreviewImageMiddleware(
      "/Users/darkawower/Yandex.Disk.localized/Dropbox/org-roam/pet"
    ),
  ]
);

// console.log(JSON.stringify(n, null, 2));

// console.log(
//   debugPrettyPrint(
//     parse(`
// - [ ] checkbox 1
// - [ ]   checkbox 2`)
//   )
// );
// console.log(JSON.stringify(n, null, 2));
