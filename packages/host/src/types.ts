/**
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/
// Pure type definitions without DOM dependencies
// This module can be safely imported by VS Code extensions

export interface ListenOptions {
  clipboard?: boolean;
  dragDrop?: boolean;
  fileUpload?: boolean;
  postMessage?: boolean;
  postMessageTarget?: any; // Using any to avoid Window DOM dependency in VS Code extensions
  url?: boolean;
  urlParamName?: string;
}
