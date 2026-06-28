// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export interface SchemaBundleManifest {
  readonly environment: "production" | "public-test" | "historical";
  readonly declaredVersion: string;
  readonly retrievedAt: string;
  readonly sourceUrls: readonly string[];
  readonly files: readonly {
    readonly path: string;
    readonly sha256: string;
    readonly contentType?: string;
    readonly etag?: string;
    readonly lastModified?: string;
  }[];
  readonly manuals: readonly {
    readonly title: string;
    readonly version?: string;
    readonly sha256: string;
    readonly sourceUrl?: string;
  }[];
}

export interface OperationCoverageManifest {
  readonly generatedAt: string | null;
  readonly source: string;
  readonly operationsDiscovered: number;
  readonly rawMethodsGenerated: number;
  readonly highLevelWrappersComplete: number;
  readonly contractFixtures: number;
  readonly coveragePercent: number;
  readonly operations: readonly unknown[];
}
