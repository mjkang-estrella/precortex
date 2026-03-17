/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as debug from "../debug.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_domain from "../lib/domain.js";
import type * as lib_projectCopilot from "../lib/projectCopilot.js";
import type * as lib_transcription from "../lib/transcription.js";
import type * as projectCopilot from "../projectCopilot.js";
import type * as projects from "../projects.js";
import type * as tasks from "../tasks.js";
import type * as transcription from "../transcription.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  debug: typeof debug;
  "lib/auth": typeof lib_auth;
  "lib/domain": typeof lib_domain;
  "lib/projectCopilot": typeof lib_projectCopilot;
  "lib/transcription": typeof lib_transcription;
  projectCopilot: typeof projectCopilot;
  projects: typeof projects;
  tasks: typeof tasks;
  transcription: typeof transcription;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
