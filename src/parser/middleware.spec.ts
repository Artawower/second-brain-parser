import fs, { existsSync } from "fs";
import path from "path";
import { Keyword, Link } from "uniorg";
import {
  createLinkMiddleware,
  createPreviewImageMiddleware,
} from "./middleware";
import { v4 as uuid } from "uuid";

describe("Link middleware", () => {
  let trashFilePath: string;

  afterEach(() => {
    if (trashFilePath && existsSync(trashFilePath)) {
      fs.unlinkSync(trashFilePath);
    }
    trashFilePath = null;
  });

  it("Should rename file with randome name", () => {
    fs.writeFileSync(path.join(__dirname, "./test.jpg"), "");
    const orgLink: Link = {
      path: "./test.jpg",
      rawLink: "./test.jpg",
      type: "link",
      linkType: "file",
      format: "plain",
      children: [],
    };
    const previousPath = orgLink.path;
    const newLink = createLinkMiddleware(__dirname)(orgLink) as Link;
    trashFilePath = path.join(__dirname, newLink.path);
    expect(newLink.path).not.toBe(previousPath);
    expect(newLink.rawLink).not.toBe(previousPath);
  });

  it("Should not rename file that already has uuid inside name", () => {
    const filePath = `./${uuid()}.png`;
    trashFilePath = path.join(__dirname, filePath);
    fs.writeFileSync(trashFilePath, "");

    const orgLink: Link = {
      path: filePath,
      rawLink: filePath,
      type: "link",
      linkType: "file",
      format: "plain",
      children: [],
    };
    const newLink = createLinkMiddleware(__dirname)(orgLink) as Link;
    expect(newLink.path).toBe(filePath);
    expect(newLink.rawLink).toBe(filePath);
    expect(existsSync(path.join(__dirname, newLink.rawLink))).toBe(true);
  });

  it("Should rename preview image file with non unique name", () => {
    const filePath = "./test.jpg";
    fs.writeFileSync(path.join(__dirname, filePath), "");
    const keyword: Keyword = {
      affiliated: {},
      key: "PREVIEW_IMG",
      value: filePath,
      type: "keyword",
    };

    const previousPath = keyword.value;
    const newKeyword = createPreviewImageMiddleware(__dirname)(
      keyword
    ) as Keyword;

    trashFilePath = path.join(__dirname, newKeyword.value);
    expect(newKeyword.value).not.toBe(previousPath);
    expect(existsSync(path.join(__dirname, filePath))).toBe(false);
    expect(existsSync(path.join(__dirname, newKeyword.value))).toBe(true);
  });

  it("Should not rename preview image file that already has uuid inside name", () => {
    const filePath = `./${uuid()}.png`;
    trashFilePath = path.join(__dirname, filePath);
    fs.writeFileSync(trashFilePath, "");

    const keyword: Keyword = {
      affiliated: {},
      key: "PREVIEW_IMG",
      value: filePath,
      type: "keyword",
    };

    const newKeyword = createPreviewImageMiddleware(__dirname)(
      keyword
    ) as Keyword;

    expect(newKeyword.value).toBe(filePath);
    expect(existsSync(path.join(__dirname, newKeyword.value))).toBe(true);
    expect(existsSync(path.join(__dirname, filePath))).toBe(true);
  });

  it("Should not rename preview image file with incorrect keyword name", () => {
    const filePath = "./test.jpg";

    trashFilePath = path.join(__dirname, filePath);
    fs.writeFileSync(trashFilePath, "");

    const keyword: Keyword = {
      affiliated: {},
      key: "PREVIEW_IMAGE",
      value: filePath,
      type: "keyword",
    };

    const newKeyword = createPreviewImageMiddleware(__dirname)(
      keyword
    ) as Keyword;

    expect(newKeyword.value).toBe(keyword.value);
    expect(existsSync(path.join(__dirname, filePath))).toBe(true);
  });

  it("Should convert preview file name without case sensitive", () => {
    const filePath = "./test.jpg";
    fs.writeFileSync(path.join(__dirname, filePath), "");
    const keyword: Keyword = {
      affiliated: {},
      key: "preview_img",
      value: filePath,
      type: "keyword",
    };
    const previousPath = keyword.value;

    const newKeyword = createPreviewImageMiddleware(__dirname)(
      keyword
    ) as Keyword;

    expect(newKeyword.value).not.toBe(previousPath);
    expect(existsSync(path.join(__dirname, filePath))).toBe(false);
    expect(existsSync(path.join(__dirname, newKeyword.value))).toBe(true);
  });
});
