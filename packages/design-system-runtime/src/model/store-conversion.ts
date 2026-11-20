import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { consumptionDocumentationForFiles, stripGeneratedReadmeTail } from "./documentation";
import { DESIGN_SYSTEM_PATHS, explainUnsafeMirrorPath, fileExtension, GENERATED_TOKENS_CSS_PATH, isGeneratedApiPath, isTextFilePath, isValidDesignSystemPath, storagePointerForFile } from "./file-policy";
import { classifyDesignSystemFile } from "./file-table";
import { estimateEmbeddedJsonBytes } from "./record-codec";
import { BLOB_STORAGE_LIMITS, storageCatalogFromManifest, storageRecordForFile } from "./storage";
import { appendStoredFilesGuidance, componentFileReferences, CSS_FILE_REFERENCE_PATTERN, parseStoredSystemMetadata, resolveLocalFileReference, stringOrUndefined } from "./store-compose";
import { addConversionUpload, blobAbsoluteUrl, blobIdFromReference, chooseStoredConversionRoute, DESIGN_SYSTEM_COLLECTIONS, FAILED_CONVERSION_UPLOAD_MESSAGE, fileContentBytesModelStoredFileCodec, fileKindDescription, formatStoredFileKilobytes, generatedReadmeTail, isPendingBlobId, makeRemoteFileRecord, makeStoredSystemMetadata, MAX_CARRIED_FILES_METADATA, MAX_FILES_PER_COLLECTION, MAX_INLINE_DATA_URI_BUDGET_FRACTION, MAX_SYNC_COLLECTION_BYTES, MAX_SYNC_DOCUMENT_BYTES, mergeReadmeWithGeneratedTail, normalizeKnownUpload, parseJsonObjectOrNull, rawDocumentPathForFile, storedContentByteLength, storedContentType, storedFileEncoder, storedFileKind, storedPathBasename, SYSTEM_COLLECTION, SYSTEM_META_DOCUMENT_PATH, SYSTEM_TOKENS_DOCUMENT_PATH } from "./stored-file-codec";
import { generatedTokensCssForFiles, parseTokens, tokensJsonWithManifestName } from "./tokens";

var collectionOverflowConversionMessage: (collection: string) => string;
var collectionFileOverflowMessage: (collection: string) => string;
var BLOB_FILE_COUNT_OVERFLOW_MESSAGE: string;
var MAX_CARRIED_FILE_REFERRERS: number;
function planSystemStoreConversion(
  title: string,
  files: Model.FileTable,
  conversionOptions: Storage.ConversionOptions = {},
): Storage.ConversionPlan {
  let documents = new Map<string, Storage.DatabaseRecord>(),
    uploads: Storage.ConversionUpload[] = [],
    carried = [
      ...(conversionOptions.precarried ?? []).map((file) => ({
        ...file,
      })),
    ],
    catalog = storageCatalogFromManifest(
      files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
    );
  documents.set(
    SYSTEM_META_DOCUMENT_PATH,
    makeStoredSystemMetadata(title, files, conversionOptions.meta),
  );
  let setFileRecord = (path: string, record: Storage.DatabaseRecord) =>
      void documents.set(
        rawDocumentPathForFile(path),
        record,
      ),
    bytesForPath = (path: string, content: string) =>
      conversionOptions.binaries?.get(path)?.bytes ??
      fileContentBytesModelStoredFileCodec(content, path),
    digestForPath = (path: string, readBytes: () => Uint8Array) =>
      conversionOptions.binaries?.get(path)?.sha256 ??
      (conversionOptions.sha256 !== undefined ? conversionOptions.sha256(readBytes()) : undefined),
    binarySize = (path: string) =>
      conversionOptions.binaries?.get(path)?.bytes?.length,
    omitFile = (path: string, reason: string) =>
      void carried.push({
        path: path,
        reason: reason,
        form: "omitted",
      }),
    knownByDigest = new Map<string, Storage.KnownUpload>(),
    useOrQueueBlob = (
      path: string,
      content: string,
      contentType: string,
      detachedBinary?: Storage.BinaryFile,
    ): boolean => {
      let knownUpload = conversionOptions.known?.get(path);
      if (knownUpload === null) {
        omitFile(path, FAILED_CONVERSION_UPLOAD_MESSAGE);
        return false;
      }
      let readBytes = () => detachedBinary?.bytes ?? bytesForPath(path, content),
        computeDigest = () =>
          detachedBinary?.sha256 ??
          (detachedBinary !== undefined && conversionOptions.sha256 !== undefined
            ? conversionOptions.sha256(detachedBinary.bytes)
            : digestForPath(path, readBytes)),
        normalizedUpload =
          knownUpload === undefined
            ? null
            : normalizeKnownUpload(knownUpload);
      if (normalizedUpload !== null) {
        let digest = normalizedUpload.sha256 ?? computeDigest(),
          blobInfo = {
            bytes:
              normalizedUpload.bytes ??
              detachedBinary?.bytes.length ??
              binarySize(path) ??
              storedContentByteLength(content, path),
            contentType: normalizedUpload.contentType ?? contentType,
            sha256: digest,
            storedSha256: normalizedUpload.storedSha256,
            ...conversionOptions.stamp,
            id: normalizedUpload.id,
          };
        setFileRecord(
          path,
          makeRemoteFileRecord(
            path,
            blobAbsoluteUrl(normalizedUpload.id),
            {
              ...blobInfo,
              name: storedPathBasename(path),
            },
          ),
        );
        if (digest !== undefined) {
          knownByDigest.set(digest + "|" + blobInfo.contentType, blobInfo);
        }
        return true;
      }
      addConversionUpload(
        uploads,
        path,
        contentType,
        readBytes(),
        computeDigest(),
      );
      return true;
    },
    convertFile = (path: string, content: string): void => {
      let route = chooseStoredConversionRoute(
        path,
        content,
        binarySize(path),
      );
      if (route.to === "inline") {
        setFileRecord(path, {
          path: path,
          kind: storedFileKind(path),
          data: content,
        });
      } else if (route.to === "data-uri") {
        setFileRecord(path, {
          path: path,
          kind: storedFileKind(path),
          data: content,
        });
        carried.push({
          path: path,
          reason: route.carried,
          form: "data-uri",
        });
      } else if (route.to === "omit") {
        omitFile(path, route.carried);
      } else if (
        useOrQueueBlob(path, content, route.contentType) &&
        route.carried !== undefined
      ) {
        carried.push({
          path: path,
          reason: route.carried,
          form: "blob",
        });
      }
    };
  for (let path of Object.keys(files).sort()) {
    if (
      path === DESIGN_SYSTEM_PATHS.manifest ||
      path === DESIGN_SYSTEM_PATHS.readme
    ) {
      continue;
    }
    let content = files[path],
      pathProblem = explainUnsafeMirrorPath(path);
    if (pathProblem !== null) {
      omitFile(path, "its name " + pathProblem + ", so it was left out");
      continue;
    }
    if (path === DESIGN_SYSTEM_PATHS.tokens) {
      let route = chooseStoredConversionRoute(path, content),
        tokenRecord =
          route.to === "inline"
            ? parseJsonObjectOrNull(
                tokensJsonWithManifestName(files),
              )
            : null;
      if (tokenRecord !== null) {
        documents.set(SYSTEM_TOKENS_DOCUMENT_PATH, tokenRecord);
      } else if (route.to === "inline") {
        setFileRecord(path, {
          path: path,
          kind: "text",
          data: content,
        });
        carried.push({
          path: path,
          reason:
            "it is not a JSON object, so it is kept as text and the page shows no tokens",
          form: "text-doc",
        });
      } else if (
        route.to === "blob" &&
        useOrQueueBlob(path, content, route.contentType!)
      ) {
        carried.push({
          path: path,
          reason:
            (route.carried ?? "it is stored as a file") +
            "; the page shows no tokens",
          form: "blob",
        });
      } else if (route.to === "omit") {
        omitFile(path, route.carried);
      }
      continue;
    }
    let pointer = storagePointerForFile(path, content);
    if (pointer === null || pointer.store === "file") {
      convertFile(path, content);
    } else if (isPendingBlobId(pointer.id)) {
      if (
        conversionOptions.known?.has(path) === true ||
        conversionOptions.binaries?.get(path)?.bytes !== undefined
      ) {
        useOrQueueBlob(
          path,
          content,
          storedContentType(path) ??
            storageRecordForFile(files, catalog, path)!.type,
        );
      } else {
        omitFile(
          path,
          "its stored copy was never uploaded (it names a placeholder, not a file), so it was left out",
        );
      }
    } else {
      let storedRecord = storageRecordForFile(files, catalog, path)!;
      setFileRecord(
        path,
        makeRemoteFileRecord(
          path,
          blobAbsoluteUrl(pointer.id),
          {
            bytes: storedRecord.bytes,
            contentType: storedRecord.type,
            sha256: storedRecord.sha256,
            storedSha256: storedRecord.storedSha256,
            name: storedRecord.name,
            addedAt: storedRecord.addedAt,
            via: storedRecord.via,
          },
        ),
      );
    }
  }
  for (let [path, detachedBinary] of [...(conversionOptions.detached ?? [])].sort(
    ([leftPath], [rightPath]): number =>
      leftPath < rightPath ? -1 : leftPath > rightPath ? 1 : 0,
  )) {
    if (
      !isValidDesignSystemPath(path) ||
      Object.hasOwn(files, path) ||
      path === DESIGN_SYSTEM_PATHS.readme ||
      path === DESIGN_SYSTEM_PATHS.manifest ||
      path === DESIGN_SYSTEM_PATHS.tokens
    ) {
      continue;
    }
    let pathProblem = explainUnsafeMirrorPath(path);
    if (pathProblem !== null) {
      omitFile(path, "its name " + pathProblem + ", so it was left out");
      continue;
    }
    useOrQueueBlob(
      path,
      "",
      storedContentType(path) ?? "text/plain",
      detachedBinary,
    );
  }
  if (conversionOptions.derived !== false) {
    let documentation = consumptionDocumentationForFiles(files),
      readmeText = mergeReadmeWithGeneratedTail(
        files[DESIGN_SYSTEM_PATHS.readme] ?? "",
        generatedReadmeTail(documentation.readme),
      );
    if (readmeText !== "") {
      convertFile(DESIGN_SYSTEM_PATHS.readme, readmeText);
    }
    for (let [path, content] of documentation.files) {
      convertFile(path, content);
    }
    let tokensCss = generatedTokensCssForFiles(files);
    if (tokensCss !== null) {
      convertFile(GENERATED_TOKENS_CSS_PATH, tokensCss);
    }
  }
  for (let upload of [...uploads]) {
    let knownBlob =
      upload.sha256 === undefined
        ? undefined
        : knownByDigest.get(upload.sha256 + "|" + upload.contentType);
    if (knownBlob === undefined) {
      continue;
    }
    uploads.splice(uploads.indexOf(upload), 1);
    for (let path of upload.paths) {
      setFileRecord(
        path,
        makeRemoteFileRecord(
          path,
          blobAbsoluteUrl(knownBlob.id),
          {
            ...knownBlob,
            bytes: upload.byteLength,
            name: storedPathBasename(path),
          },
        ),
      );
    }
  }
  let plan = enforceConversionBudgets(
      {
        title: title,
        docs: documents,
        uploads: uploads,
        carried: carried,
      },
      conversionOptions.sha256,
    ),
    knownUploads = conversionOptions.known;
  if (
    knownUploads !== undefined &&
    plan.uploads.some((upload) =>
      upload.paths.some((path) => knownUploads.has(path)),
    )
  ) {
    return applyKnownConversionUploads(
      plan,
      knownUploads,
      conversionOptions.stamp ?? {},
    );
  } else {
    return appendStoredFilesGuidance(plan);
  }
}
function applyKnownConversionUploads(
  plan: Storage.ConversionPlan,
  knownUploads: ReadonlyMap<string, Storage.KnownUploadInput | null>,
  stamp: Storage.UploadStamp = {},
): Storage.ConversionPlan {
  let documents = new Map(plan.docs),
    uploads: Storage.ConversionUpload[] = [],
    carried = [...plan.carried];
  for (let value of plan.uploads) {
    let knownPath = value.paths.find((path) => knownUploads.has(path)),
      knownUpload = knownPath === undefined ? undefined : knownUploads.get(knownPath),
      normalizedUpload =
        knownUpload === undefined || knownUpload === null
          ? null
          : normalizeKnownUpload(knownUpload);
    if (knownUpload === undefined || (knownUpload !== null && normalizedUpload === null)) {
      uploads.push(value);
    } else {
      for (let path of value.paths) {
        if (normalizedUpload === null) {
          carried.push({
            path: path,
            reason: FAILED_CONVERSION_UPLOAD_MESSAGE,
            form: "omitted",
          });
        } else {
          documents.set(
            rawDocumentPathForFile(path),
            makeRemoteFileRecord(
              path,
              blobAbsoluteUrl(normalizedUpload.id),
              {
                bytes: normalizedUpload.bytes ?? value.byteLength,
                contentType: normalizedUpload.contentType ?? value.contentType,
                sha256: normalizedUpload.sha256 ?? value.sha256,
                storedSha256: normalizedUpload.storedSha256,
                name: storedPathBasename(path),
                ...stamp,
              },
            ),
          );
        }
      }
    }
  }
  return appendStoredFilesGuidance(
    enforceConversionBudgets({
      title: plan.title,
      docs: documents,
      uploads: uploads,
      carried: carried,
    }),
  );
}
function conversionFileReferrers(
  plan: Storage.ConversionPlan,
): Map<string, string[]> {
  let referrers = new Map<string, Set<string>>(),
    addReference = (referencedPath: string | null, referringPath: string): void => {
      if (referencedPath === null || referencedPath === "") {
        return;
      }
      referrers.set(referencedPath, (referrers.get(referencedPath) ?? new Set()).add(referringPath));
    },
    readmes: [string, string][] = [];
  for (let [, value] of plan.docs) {
    let path = stringOrUndefined(value.path),
      content = stringOrUndefined(value.data);
    if (path === undefined || content === undefined) {
      continue;
    }
    if (
      classifyDesignSystemFile(path) === "preview" ||
      classifyDesignSystemFile(path) === "componentReadme"
    ) {
      for (let reference of componentFileReferences(
        path,
        content,
      )) {
        addReference(
          resolveLocalFileReference(path, reference),
          path,
        );
      }
    }
    if (
      path === DESIGN_SYSTEM_PATHS.readme ||
      (classifyDesignSystemFile(path) === "doc" &&
        !isGeneratedApiPath(path)) ||
      (path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir) &&
        fileExtension(path) === "md")
    ) {
      readmes.push([
        path,
        path === DESIGN_SYSTEM_PATHS.readme
          ? stripGeneratedReadmeTail(content)
          : content,
      ]);
    }
  }
  for (let value of plan.uploads) {
    if (fileExtension(value.path) === "css") {
      for (let match of new TextDecoder()
        .decode(value.bytes)
        .matchAll(CSS_FILE_REFERENCE_PATTERN)) {
        addReference(
          resolveLocalFileReference(
            value.path,
            match[1] ?? match[2] ?? match[3] ?? "",
          ),
          value.path,
        );
      }
    }
  }
  let tokensRecord = plan.docs.get(SYSTEM_TOKENS_DOCUMENT_PATH);
  if (tokensRecord !== undefined) {
    for (let value of parseTokens(tokensRecord).type.fonts) {
      addReference(value.file, DESIGN_SYSTEM_PATHS.tokens);
    }
  }
  if (readmes.length > 0) {
    for (let value of new Set([
      ...[...plan.docs.values()].map(
        (record) => stringOrUndefined(record.path) ?? "",
      ),
      ...plan.uploads.flatMap((upload) => upload.paths),
    ])) {
      if (!value.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
        continue;
      }
      for (let [readmePath, readmeText] of readmes) {
        if (
          readmeText.includes(value) ||
          readmeText.includes(storedPathBasename(value))
        ) {
          addReference(value, readmePath);
        }
      }
    }
  }
  return new Map(
    [...referrers]
      .sort(([leftPath], [rightPath]): number => (leftPath < rightPath ? -1 : 1))
      .map(([path, pathsReferencingFile]) => [path, [...pathsReferencingFile].sort()]),
  );
}
function conversionFilePriority(
  plan: Storage.ConversionPlan,
  referrers: ReadonlyMap<string, string[]> = conversionFileReferrers(plan),
): Map<string, number> {
  let metadata = parseStoredSystemMetadata(
      plan.docs.get(SYSTEM_META_DOCUMENT_PATH),
    ),
    groupOrder = (metadata?.assetGroups ?? []).map(
      (group) => (group as Storage.StoredPriorityGroup).name,
    ),
    paths = [
      ...new Set([
        ...[...plan.docs.values()].map(
          (record) => stringOrUndefined(record.path) ?? "",
        ),
        ...plan.uploads.flatMap((upload) => upload.paths),
      ]),
    ].filter((path): boolean => path !== ""),
    priority = (path: string) => {
      if (!path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
        return [0];
      }
      let value = path
          .slice(DESIGN_SYSTEM_PATHS.assetsDir.length)
          .split("/"),
        groupIndex = value.length > 1 ? groupOrder.indexOf(value[0]) : -1,
        groupFiles =
          groupIndex < 0
            ? []
            : ((
                metadata?.assetGroups?.[groupIndex] as
                  | Storage.StoredPriorityGroup
                  | undefined
              )?.order ?? []),
        fileIndex = groupFiles.indexOf(value.slice(1).join("/"));
      return [
        referrers.has(path) ? 1 : 2,
        groupIndex < 0 ? groupOrder.length : groupIndex,
        fileIndex < 0 ? groupFiles.length : fileIndex,
      ];
    },
    ranked = paths.map((path) => ({
      p: path,
      r: priority(path),
    }));
  ranked.sort((left, right) => {
    for (let index: number = 0; index < 3; index++) {
      let value = (left.r[index] ?? 0) - (right.r[index] ?? 0);
      if (value !== 0) {
        return value;
      }
    }
    if (left.p < right.p) {
      return -1;
    } else {
      if (left.p > right.p) {
        return 1;
      } else {
        return 0;
      }
    }
  });
  return new Map(ranked.map((entry, rank) => [entry.p, rank]));
}
function enforceConversionBudgets(
  plan: Storage.ConversionPlan,
  hashBytes?: (bytes: Uint8Array) => string,
): Storage.ConversionPlan {
  let documents = new Map(plan.docs),
    uploads = plan.uploads.map((upload) => ({
      ...upload,
      paths: [...upload.paths],
    })),
    carried: Storage.CarriedFile[] = [],
    carry = (file: Storage.CarriedFile): void => {
      let value = carried.findIndex(
        (existing): boolean => existing.path === file.path,
      );
      if (value >= 0) {
        carried.splice(value, 1);
      }
      carried.push(file);
    };
  for (let value of plan.carried) {
    carry({
      path: value.path,
      reason: value.reason,
      form: value.form,
      ...(value.referrers !== undefined
        ? {
            referrers: [...value.referrers],
          }
        : {}),
    });
  }
  let referrers: Map<string, string[]> | undefined,
    priority: Map<string, number> | undefined,
    filePriority = () => {
      referrers ??= conversionFileReferrers(plan);
      priority ??= conversionFilePriority(plan, referrers);
      return priority;
    },
    comparePriority = (leftPath: string, rightPath: string) =>
      (filePriority().get(leftPath) ?? 0) - (filePriority().get(rightPath) ?? 0) ||
      (leftPath < rightPath ? -1 : 1),
    uploadForPath = (path: string) =>
      uploads.find((upload) => upload.paths.includes(path)),
    pathsInCollection = (collection: string) =>
      [
        ...new Set([
          ...[...documents]
            .filter(
              ([documentPath]): boolean => documentCollectionPath(documentPath) === collection,
            )
            .map(
              ([, document]) =>
                stringOrUndefined(document.path) ??
                (collection === SYSTEM_COLLECTION ? "" : ""),
            ),
          ...uploads
            .flatMap((upload) => upload.paths)
            .filter(
              (path): boolean =>
                documentCollectionPath(
                  rawDocumentPathForFile(path),
                ) === collection,
            ),
        ]),
      ].filter((path): boolean => path !== ""),
    documentBytes = (path: string) =>
      documents.has(rawDocumentPathForFile(path))
        ? estimateEmbeddedJsonBytes(
            documents.get(rawDocumentPathForFile(path)),
          )
        : 512,
    omitPath = (path: string, reason: string): void => {
      documents.delete(rawDocumentPathForFile(path));
      let upload = uploadForPath(path);
      if (upload !== undefined) {
        if (
          ((upload.paths = upload.paths.filter(
            (otherPath): boolean => otherPath !== path,
          )),
          upload.paths.length === 0)
        ) {
          uploads.splice(uploads.indexOf(upload), 1);
        } else {
          upload.path = upload.paths[0];
          upload.docPath = rawDocumentPathForFile(upload.path);
        }
      }
      carry({
        path: path,
        reason: reason,
        form: "omitted",
      });
    };
  for (let collection of DESIGN_SYSTEM_COLLECTIONS) {
    if (collection === SYSTEM_COLLECTION) {
      continue;
    }
    let collectionPaths = pathsInCollection(collection),
      inlineDataUriPaths = collectionPaths
        .filter((path) =>
          carried.some(
            (file) => file.path === path && file.form === "data-uri",
          ),
        )
        .sort(
          (leftPath, rightPath) =>
            documentBytes(rightPath) - documentBytes(leftPath) ||
            (leftPath < rightPath ? -1 : 1),
        ),
      inlineDataUriBytes = inlineDataUriPaths.reduce(
        (bytes, path) => bytes + documentBytes(path),
        0,
      );
    for (let path of inlineDataUriPaths) {
      if (
        inlineDataUriBytes <=
        MAX_INLINE_DATA_URI_BUDGET_FRACTION *
          MAX_SYNC_COLLECTION_BYTES
      ) {
        break;
      }
      inlineDataUriBytes -= documentBytes(path);
      omitPath(
        path,
        "the store takes no " +
          fileKindDescription(path) +
          " and " +
          collection +
          "/ already holds its " +
          formatStoredFileKilobytes(
            MAX_INLINE_DATA_URI_BUDGET_FRACTION *
              MAX_SYNC_COLLECTION_BYTES,
          ) +
          " of such files inline, so it was left out",
      );
    }
    collectionPaths = pathsInCollection(collection);
    let collectionBytes = collectionPaths.reduce(
      (bytes, path) => bytes + documentBytes(path),
      0,
    );
    if (collectionBytes > MAX_SYNC_COLLECTION_BYTES) {
      let textPathsToExternalize = collectionPaths
        .filter((path) => {
          let entry = documents.get(
            rawDocumentPathForFile(path),
          );
          return (
            entry !== undefined &&
            typeof entry.data === "string" &&
            isTextFilePath(path) &&
            storedContentType(path) !== null
          );
        })
        .sort(
          (leftPath, rightPath) =>
            documentBytes(rightPath) - documentBytes(leftPath) ||
            (leftPath < rightPath ? -1 : 1),
        );
      for (let path of textPathsToExternalize) {
        if (collectionBytes <= MAX_SYNC_COLLECTION_BYTES) {
          break;
        }
        let entry = documents.get(
          rawDocumentPathForFile(path),
        );
        collectionBytes -= estimateEmbeddedJsonBytes(entry) - 512;
        documents.delete(rawDocumentPathForFile(path));
        let textBytes = storedFileEncoder.encode(entry!.data as string);
        addConversionUpload(
          uploads,
          path,
          storedContentType(path)!,
          textBytes,
          hashBytes?.(textBytes),
        );
        carry({
          path: path,
          reason: collectionOverflowConversionMessage(collection),
          form: "blob",
        });
      }
      collectionPaths = pathsInCollection(collection);
    }
    if (collectionPaths.length > MAX_FILES_PER_COLLECTION) {
      let rankedPaths = collectionPaths.sort(comparePriority);
      while (rankedPaths.length > MAX_FILES_PER_COLLECTION) {
        omitPath(rankedPaths.pop()!, collectionFileOverflowMessage(collection));
      }
    }
  }
  let storageIdentity = (path: string): string | null => {
      let entry = documents.get(rawDocumentPathForFile(path)),
        blobId =
          entry !== undefined
            ? blobIdFromReference(
                stringOrUndefined(entry.dataRef) ?? "",
              )
            : null;
      if (blobId !== null) {
        return "id:" + blobId;
      }
      let upload = uploadForPath(path);
      if (upload === undefined) {
        return null;
      } else {
        if (upload.sha256 !== undefined) {
          return "sha:" + upload.sha256 + "|" + upload.contentType;
        } else {
          return "path:" + upload.path;
        }
      }
    },
    storageIdentityByPath = new Map<string, string>();
  for (let value of new Set([
    ...[...documents.values()].map(
      (document) => stringOrUndefined(document.path) ?? "",
    ),
    ...uploads.flatMap((upload) => upload.paths),
  ])) {
    let identity = value === "" ? null : storageIdentity(value);
    if (identity !== null) {
      storageIdentityByPath.set(value, identity);
    }
  }
  let referenceCounts = new Map<string, number>();
  for (let value of storageIdentityByPath.values()) {
    referenceCounts.set(value, (referenceCounts.get(value) ?? 0) + 1);
  }
  let storedFileCount = referenceCounts.size;
  if (storedFileCount > BLOB_STORAGE_LIMITS.files) {
    let value = [...storageIdentityByPath.keys()].sort(comparePriority);
    while (
      storedFileCount > BLOB_STORAGE_LIMITS.files &&
      value.length > 0
    ) {
      let path = value.pop()!;
      if (
        classifyDesignSystemFile(path) !== "asset" &&
        classifyDesignSystemFile(path) !== "componentOther"
      ) {
        continue;
      }
      let entry = storageIdentityByPath.get(path)!;
      omitPath(path, BLOB_FILE_COUNT_OVERFLOW_MESSAGE);
      let remainingReferences: number = referenceCounts.get(entry)! - 1;
      referenceCounts.set(entry, remainingReferences);
      if (remainingReferences === 0) {
        storedFileCount--;
      }
    }
  }
  if (carried.length > 0) {
    referrers ??= conversionFileReferrers(plan);
  }
  for (let value of carried) {
    let additionalReferrers = referrers?.get(value.path);
    if (additionalReferrers !== undefined) {
      value.referrers = [
        ...new Set([...(value.referrers ?? []), ...additionalReferrers]),
      ].sort();
    }
  }
  let metadata = documents.get(SYSTEM_META_DOCUMENT_PATH);
  if (metadata !== undefined) {
    documents.set(
      SYSTEM_META_DOCUMENT_PATH,
      metadataWithCarriedFiles(metadata, carried),
    );
  }
  return {
    title: plan.title,
    docs: documents,
    uploads: uploads,
    carried: carried,
  };
}
function metadataWithCarriedFiles(
  metadata: Storage.DatabaseRecord,
  carried: readonly Storage.CarriedFile[],
): Storage.DatabaseRecord {
  let {
      carried: previousCarried,
      carriedMore: previousMore,
      ...base
    } = metadata,
    records = carried.map((file) => ({
      path: file.path,
      reason: file.reason,
      form: file.form,
      ...(file.referrers !== undefined
        ? {
            referrers: file.referrers.slice(0, MAX_CARRIED_FILE_REFERRERS),
            ...(file.referrers.length > MAX_CARRIED_FILE_REFERRERS
              ? {
                  referrerCount: file.referrers.length,
                }
              : {}),
          }
        : {}),
    })),
    build = (baseMetadata: Storage.DatabaseRecord, recordLimit: number) =>
      carried.length === 0
        ? {
            ...baseMetadata,
          }
        : {
            ...baseMetadata,
            carried: records.slice(0, recordLimit),
            ...(carried.length > recordLimit
              ? {
                  carriedMore: carried.length - recordLimit,
                }
              : {}),
          },
    maxCount: number = Math.min(
      carried.length,
      MAX_CARRIED_FILES_METADATA,
    ),
    compactBase = base,
    withCarried = build(compactBase, maxCount);
  if (
    estimateEmbeddedJsonBytes(withCarried) >
    MAX_SYNC_DOCUMENT_BYTES
  ) {
    let { sections: _omittedSections, ...baseWithoutSections } = base;
    compactBase = {
      ...baseWithoutSections,
      ...(base.assetGroups !== undefined
        ? {
            assetGroups: (
              base.assetGroups as Storage.StoredPriorityGroup[]
            ).map((group) => ({
              name: group.name,
              ...(group.tile !== undefined
                ? {
                    tile: group.tile,
                  }
                : {}),
            })),
          }
        : {}),
    };
    withCarried = build(compactBase, maxCount);
  }
  for (
    let value: number = maxCount;
    estimateEmbeddedJsonBytes(withCarried) >
      MAX_SYNC_DOCUMENT_BYTES && value > 0;

  ) {
    value = Math.floor(value / 2);
    withCarried = build(compactBase, value);
  }
  return withCarried;
}
function documentCollectionPath(documentPath: string): string {
  return documentPath.slice(0, documentPath.lastIndexOf("/"));
}
export {
  applyKnownConversionUploads,
  BLOB_FILE_COUNT_OVERFLOW_MESSAGE,
  collectionFileOverflowMessage,
  collectionOverflowConversionMessage,
  conversionFilePriority,
  conversionFileReferrers,
  documentCollectionPath,
  enforceConversionBudgets,
  MAX_CARRIED_FILE_REFERRERS,
  metadataWithCarriedFiles,
  planSystemStoreConversion,
};
export function installModelStoreConversion(): () => void {
  return () => {
    collectionOverflowConversionMessage = (collection): string =>
      collection +
      "/ holds more than " +
      formatStoredFileKilobytes(
        MAX_SYNC_COLLECTION_BYTES,
      ) +
      " of text, so it is stored as a file";
    collectionFileOverflowMessage = (collection): string =>
      collection +
      "/ is past the " +
      String(MAX_FILES_PER_COLLECTION) +
      " files one area holds, so it was left out of the store";
    BLOB_FILE_COUNT_OVERFLOW_MESSAGE =
      "the design system is past the " +
      String(BLOB_STORAGE_LIMITS.files) +
      " stored files it can hold, so it was left out of the store";
    MAX_CARRIED_FILE_REFERRERS = 5;
  };
}
