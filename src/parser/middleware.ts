import { Keyword, Link, OrgData, OrgNode } from "uniorg";
import {
  isFileImage,
  isFileNameContainUuid,
  uniquifyFileName,
} from "./tools.js";
import { existsSync, renameSync } from "fs";
import { join } from "path";

function shouldRenameFile(filePath: string, dirPath: string): boolean {
  return (
    isFileImage(filePath) &&
    !isFileNameContainUuid(filePath) &&
    existsSync(join(dirPath, filePath))
  );
}

export const createLinkMiddleware =
  (dirPath: string) =>
  (orgData: Link): OrgNode => {
    const isNotLink = orgData.type !== "link";
    const isNotFile = orgData.linkType !== "file";

    if (isNotLink || isNotFile || !shouldRenameFile(orgData.path, dirPath)) {
      return orgData;
    }

    try {
      const newFileName = uniquifyFileName(orgData.path);
      renameSync(join(dirPath, orgData.path), join(dirPath, newFileName));
      orgData.path = newFileName;
      orgData.rawLink = newFileName;
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw e;
      }
    }
    return orgData;
  };

const previewImgKey = "preview_img";

export const createPreviewImageMiddleware =
  (dirPath: string) =>
  (k: Keyword): OrgNode => {
    if (k?.type !== "keyword" || k.key.toLocaleLowerCase() != previewImgKey) {
      return k;
    }

    const filePath = k.value;

    if (!shouldRenameFile(filePath, dirPath)) {
      return k;
    }

    try {
      const newFileName = uniquifyFileName(filePath);
      renameSync(join(dirPath, filePath), join(dirPath, newFileName));
      k.value = newFileName;
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw e;
      }
    }
    return k;
  };
