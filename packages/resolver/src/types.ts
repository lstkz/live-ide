export interface ResolvedPackage {
  name: string;
  sourceName: string;
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
