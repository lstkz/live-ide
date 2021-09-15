export interface ResolvedPackage {
  name: string;
  version: string;
  requestedVersion: string;
}

export interface LibraryInfo {
  name: string;
  sourceName: string;
  version: string;
  requestedVersion: string;
  typesBundleUrl: string;
  sourceUrl: string;
}

export interface BaseLibraryInfo {
  name: string;
  version: string;
}

export interface ExtractedBundle {
  name: string;
  bundle: string;
}
