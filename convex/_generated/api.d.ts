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
import type * as lib_taskAgent from "../lib/taskAgent.js";
import type * as lib_transcription from "../lib/transcription.js";
import type * as lib_workspaceAssistant from "../lib/workspaceAssistant.js";
import type * as projectCopilot from "../projectCopilot.js";
import type * as projects from "../projects.js";
import type * as taskAgent from "../taskAgent.js";
import type * as tasks from "../tasks.js";
import type * as tasksInternal from "../tasksInternal.js";
import type * as transcription from "../transcription.js";
import type * as workspaceAssistant from "../workspaceAssistant.js";

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
  "lib/taskAgent": typeof lib_taskAgent;
  "lib/transcription": typeof lib_transcription;
  "lib/workspaceAssistant": typeof lib_workspaceAssistant;
  projectCopilot: typeof projectCopilot;
  projects: typeof projects;
  taskAgent: typeof taskAgent;
  tasks: typeof tasks;
  tasksInternal: typeof tasksInternal;
  transcription: typeof transcription;
  workspaceAssistant: typeof workspaceAssistant;
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
