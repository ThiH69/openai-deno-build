// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Errors from "./error.ts";
import * as Uploads from "./uploads.ts";

import { type Agent, type RequestInit } from "./_shims/mod.ts";
import { qs } from "https://deno.land/x/deno_qs@0.0.1/mod.ts";

import * as Core from "./core.ts";
import * as Pagination from "./pagination.ts";
import * as API from "./resources/mod.ts";

export interface ClientOptions {
  /**
   * Defaults to process.env['OPENAI_API_KEY'].
   */
  apiKey?: string | undefined;

  /**
   * Defaults to process.env['OPENAI_ORG_ID'].
   */
  organization?: string | null | undefined;

  /**
   * Defaults to process.env['OPENAI_PROJECT_ID'].
   */
  project?: string | null | undefined;

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   *
   * Defaults to process.env['OPENAI_BASE_URL'].
   */
  baseURL?: string | null | undefined;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number;

  /**
   * An HTTP agent used to manage HTTP(S) connections.
   *
   * If not provided, an agent will be constructed by default in the Node.js environment,
   * otherwise no agent is used.
   */
  httpAgent?: Agent;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we use `node-fetch` on Node.js and otherwise expect that `fetch` is
   * defined globally.
   */
  fetch?: Core.Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: Core.Headers;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Core.DefaultQuery;

  /**
   * By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   * Only set this option to `true` if you understand the risks and have appropriate mitigations in place.
   */
  dangerouslyAllowBrowser?: boolean;
}

/**
 * API Client for interfacing with the OpenAI API.
 */
export class OpenAI extends Core.APIClient {
  apiKey: string;
  organization: string | null;
  project: string | null;

  private _options: ClientOptions;

  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({
    baseURL = Core.readEnv("OPENAI_BASE_URL"),
    apiKey = Core.readEnv("OPENAI_API_KEY"),
    organization = Core.readEnv("OPENAI_ORG_ID") ?? null,
    project = Core.readEnv("OPENAI_PROJECT_ID") ?? null,
    ...opts
  }: ClientOptions = {}) {
    if (apiKey === undefined) {
      throw new Errors.OpenAIError(
        "The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).",
      );
    }

    const options: ClientOptions = {
      apiKey,
      organization,
      project,
      ...opts,
      baseURL: baseURL || `https://api.openai.com/v1`,
    };

    if (!options.dangerouslyAllowBrowser && Core.isRunningInBrowser()) {
      throw new Errors.OpenAIError(
        "It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n",
      );
    }

    super({
      baseURL: options.baseURL!,
      timeout: options.timeout ?? 600000, /* 10 minutes */
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch,
    });

    this._options = options;

    this.apiKey = apiKey;
    this.organization = organization;
    this.project = project;
  }

  completions: API.Completions = new API.Completions(this);
  chat: API.Chat = new API.Chat(this);
  embeddings: API.Embeddings = new API.Embeddings(this);
  files: API.Files = new API.Files(this);
  images: API.Images = new API.Images(this);
  audio: API.Audio = new API.Audio(this);
  moderations: API.Moderations = new API.Moderations(this);
  models: API.Models = new API.Models(this);
  fineTuning: API.FineTuning = new API.FineTuning(this);
  beta: API.Beta = new API.Beta(this);
  batches: API.Batches = new API.Batches(this);
  uploads: API.Uploads = new API.Uploads(this);

  protected override defaultQuery(): Core.DefaultQuery | undefined {
    return this._options.defaultQuery;
  }

  protected override defaultHeaders(
    opts: Core.FinalRequestOptions,
  ): Core.Headers {
    return {
      ...super.defaultHeaders(opts),
      "OpenAI-Organization": this.organization,
      "OpenAI-Project": this.project,
      ...this._options.defaultHeaders,
    };
  }

  protected override authHeaders(opts: Core.FinalRequestOptions): Core.Headers {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  protected override stringifyQuery(query: Record<string, unknown>): string {
    return qs.stringify(query, { arrayFormat: "brackets" });
  }

  static OpenAI = this;
  static DEFAULT_TIMEOUT = 600000; // 10 minutes

  static OpenAIError = Errors.OpenAIError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static RateLimitError = Errors.RateLimitError;
  static BadRequestError = Errors.BadRequestError;
  static AuthenticationError = Errors.AuthenticationError;
  static InternalServerError = Errors.InternalServerError;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;

  static toFile = Uploads.toFile;
  static fileFromPath = Uploads.fileFromPath;
}

export const {
  OpenAIError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
} = Errors;

export import toFile = Uploads.toFile;
export import fileFromPath = Uploads.fileFromPath;

export namespace OpenAI {
  export type RequestOptions = Core.RequestOptions;

  export import Page = Pagination.Page;
  export type PageResponse<Item> = Pagination.PageResponse<Item>;

  export import CursorPage = Pagination.CursorPage;
  export type CursorPageParams = Pagination.CursorPageParams;
  export type CursorPageResponse<Item> = Pagination.CursorPageResponse<Item>;

  export import Completions = API.Completions;
  export type Completion = API.Completion;
  export type CompletionChoice = API.CompletionChoice;
  export type CompletionUsage = API.CompletionUsage;
  export type CompletionCreateParams = API.CompletionCreateParams;
  export type CompletionCreateParamsNonStreaming =
    API.CompletionCreateParamsNonStreaming;
  export type CompletionCreateParamsStreaming =
    API.CompletionCreateParamsStreaming;

  export import Chat = API.Chat;
  export type ChatModel = API.ChatModel;
  export type ChatCompletion = API.ChatCompletion;
  export type ChatCompletionAssistantMessageParam =
    API.ChatCompletionAssistantMessageParam;
  export type ChatCompletionChunk = API.ChatCompletionChunk;
  export type ChatCompletionContentPart = API.ChatCompletionContentPart;
  export type ChatCompletionContentPartImage =
    API.ChatCompletionContentPartImage;
  export type ChatCompletionContentPartRefusal =
    API.ChatCompletionContentPartRefusal;
  export type ChatCompletionContentPartText = API.ChatCompletionContentPartText;
  export type ChatCompletionFunctionCallOption =
    API.ChatCompletionFunctionCallOption;
  export type ChatCompletionFunctionMessageParam =
    API.ChatCompletionFunctionMessageParam;
  export type ChatCompletionMessage = API.ChatCompletionMessage;
  export type ChatCompletionMessageParam = API.ChatCompletionMessageParam;
  export type ChatCompletionMessageToolCall = API.ChatCompletionMessageToolCall;
  export type ChatCompletionNamedToolChoice = API.ChatCompletionNamedToolChoice;
  export type ChatCompletionRole = API.ChatCompletionRole;
  export type ChatCompletionStreamOptions = API.ChatCompletionStreamOptions;
  export type ChatCompletionSystemMessageParam =
    API.ChatCompletionSystemMessageParam;
  export type ChatCompletionTokenLogprob = API.ChatCompletionTokenLogprob;
  export type ChatCompletionTool = API.ChatCompletionTool;
  export type ChatCompletionToolChoiceOption =
    API.ChatCompletionToolChoiceOption;
  export type ChatCompletionToolMessageParam =
    API.ChatCompletionToolMessageParam;
  export type ChatCompletionUserMessageParam =
    API.ChatCompletionUserMessageParam;
  export type ChatCompletionCreateParams = API.ChatCompletionCreateParams;
  export type ChatCompletionCreateParamsNonStreaming =
    API.ChatCompletionCreateParamsNonStreaming;
  export type ChatCompletionCreateParamsStreaming =
    API.ChatCompletionCreateParamsStreaming;

  export import Embeddings = API.Embeddings;
  export type CreateEmbeddingResponse = API.CreateEmbeddingResponse;
  export type Embedding = API.Embedding;
  export type EmbeddingCreateParams = API.EmbeddingCreateParams;

  export import Files = API.Files;
  export type FileContent = API.FileContent;
  export type FileDeleted = API.FileDeleted;
  export type FileObject = API.FileObject;
  export type FilePurpose = API.FilePurpose;
  export import FileObjectsPage = API.FileObjectsPage;
  export type FileCreateParams = API.FileCreateParams;
  export type FileListParams = API.FileListParams;

  export import Images = API.Images;
  export type Image = API.Image;
  export type ImageModel = API.ImageModel;
  export type ImagesResponse = API.ImagesResponse;
  export type ImageCreateVariationParams = API.ImageCreateVariationParams;
  export type ImageEditParams = API.ImageEditParams;
  export type ImageGenerateParams = API.ImageGenerateParams;

  export import Audio = API.Audio;
  export type AudioModel = API.AudioModel;

  export import Moderations = API.Moderations;
  export type Moderation = API.Moderation;
  export type ModerationModel = API.ModerationModel;
  export type ModerationCreateResponse = API.ModerationCreateResponse;
  export type ModerationCreateParams = API.ModerationCreateParams;

  export import Models = API.Models;
  export type Model = API.Model;
  export type ModelDeleted = API.ModelDeleted;
  export import ModelsPage = API.ModelsPage;

  export import FineTuning = API.FineTuning;

  export import Beta = API.Beta;

  export import Batches = API.Batches;
  export type Batch = API.Batch;
  export type BatchError = API.BatchError;
  export type BatchRequestCounts = API.BatchRequestCounts;
  export import BatchesPage = API.BatchesPage;
  export type BatchCreateParams = API.BatchCreateParams;
  export type BatchListParams = API.BatchListParams;

  export import Uploads = API.Uploads;
  export type Upload = API.Upload;
  export type UploadCreateParams = API.UploadCreateParams;
  export type UploadCompleteParams = API.UploadCompleteParams;

  export type ErrorObject = API.ErrorObject;
  export type FunctionDefinition = API.FunctionDefinition;
  export type FunctionParameters = API.FunctionParameters;
  export type ResponseFormatJSONObject = API.ResponseFormatJSONObject;
  export type ResponseFormatJSONSchema = API.ResponseFormatJSONSchema;
  export type ResponseFormatText = API.ResponseFormatText;
}

// ---------------------- Azure ----------------------

/** API Client for interfacing with the Azure OpenAI API. */
export interface AzureClientOptions extends ClientOptions {
  /**
   * Defaults to process.env['OPENAI_API_VERSION'].
   */
  apiVersion?: string | undefined;

  /**
   * Your Azure endpoint, including the resource, e.g. `https://example-resource.azure.openai.com/`
   */
  endpoint?: string | undefined;

  /**
   * A model deployment, if given, sets the base client URL to include `/deployments/{deployment}`.
   * Note: this means you won't be able to use non-deployment endpoints. Not supported with Assistants APIs.
   */
  deployment?: string | undefined;

  /**
   * Defaults to process.env['AZURE_OPENAI_API_KEY'].
   */
  apiKey?: string | undefined;

  /**
   * A function that returns an access token for Microsoft Entra (formerly known as Azure Active Directory),
   * which will be invoked on every request.
   */
  azureADTokenProvider?: (() => Promise<string>) | undefined;
}

/** API Client for interfacing with the Azure OpenAI API. */
export class AzureOpenAI extends OpenAI {
  private _azureADTokenProvider: (() => Promise<string>) | undefined;
  private _deployment: string | undefined;
  apiVersion: string = "";
  /**
   * API Client for interfacing with the Azure OpenAI API.
   *
   * @param {string | undefined} [opts.apiVersion=process.env['OPENAI_API_VERSION'] ?? undefined]
   * @param {string | undefined} [opts.endpoint=process.env['AZURE_OPENAI_ENDPOINT'] ?? undefined] - Your Azure endpoint, including the resource, e.g. `https://example-resource.azure.openai.com/`
   * @param {string | undefined} [opts.apiKey=process.env['AZURE_OPENAI_API_KEY'] ?? undefined]
   * @param {string | undefined} opts.deployment - A model deployment, if given, sets the base client URL to include `/deployments/{deployment}`.
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL']] - Sets the base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({
    baseURL = Core.readEnv("OPENAI_BASE_URL"),
    apiKey = Core.readEnv("AZURE_OPENAI_API_KEY"),
    apiVersion = Core.readEnv("OPENAI_API_VERSION"),
    endpoint,
    deployment,
    azureADTokenProvider,
    dangerouslyAllowBrowser,
    ...opts
  }: AzureClientOptions = {}) {
    if (!apiVersion) {
      throw new Errors.OpenAIError(
        "The OPENAI_API_VERSION environment variable is missing or empty; either provide it, or instantiate the AzureOpenAI client with an apiVersion option, like new AzureOpenAI({ apiVersion: 'My API Version' }).",
      );
    }

    if (typeof azureADTokenProvider === "function") {
      dangerouslyAllowBrowser = true;
    }

    if (!azureADTokenProvider && !apiKey) {
      throw new Errors.OpenAIError(
        "Missing credentials. Please pass one of `apiKey` and `azureADTokenProvider`, or set the `AZURE_OPENAI_API_KEY` environment variable.",
      );
    }

    if (azureADTokenProvider && apiKey) {
      throw new Errors.OpenAIError(
        "The `apiKey` and `azureADTokenProvider` arguments are mutually exclusive; only one can be passed at a time.",
      );
    }

    // define a sentinel value to avoid any typing issues
    apiKey ??= API_KEY_SENTINEL;

    opts.defaultQuery = { ...opts.defaultQuery, "api-version": apiVersion };

    if (!baseURL) {
      if (!endpoint) {
        endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
      }

      if (!endpoint) {
        throw new Errors.OpenAIError(
          "Must provide one of the `baseURL` or `endpoint` arguments, or the `AZURE_OPENAI_ENDPOINT` environment variable",
        );
      }

      baseURL = `${endpoint}/openai`;
    } else {
      if (endpoint) {
        throw new Errors.OpenAIError(
          "baseURL and endpoint are mutually exclusive",
        );
      }
    }

    super({
      apiKey,
      baseURL,
      ...opts,
      ...(dangerouslyAllowBrowser !== undefined
        ? { dangerouslyAllowBrowser }
        : {}),
    });

    this._azureADTokenProvider = azureADTokenProvider;
    this.apiVersion = apiVersion;
    this._deployment = deployment;
  }

  override buildRequest(options: Core.FinalRequestOptions<unknown>): {
    req: RequestInit;
    url: string;
    timeout: number;
  } {
    if (
      _deployments_endpoints.has(options.path) && options.method === "post" &&
      options.body !== undefined
    ) {
      if (!Core.isObj(options.body)) {
        throw new Error("Expected request body to be an object");
      }
      const model = this._deployment || options.body["model"];
      if (model !== undefined && !this.baseURL.includes("/deployments")) {
        options.path = `/deployments/${model}${options.path}`;
      }
    }
    return super.buildRequest(options);
  }

  private async _getAzureADToken(): Promise<string | undefined> {
    if (typeof this._azureADTokenProvider === "function") {
      const token = await this._azureADTokenProvider();
      if (!token || typeof token !== "string") {
        throw new Errors.OpenAIError(
          `Expected 'azureADTokenProvider' argument to return a string but it returned ${token}`,
        );
      }
      return token;
    }
    return undefined;
  }

  protected override authHeaders(opts: Core.FinalRequestOptions): Core.Headers {
    return {};
  }

  protected override async prepareOptions(
    opts: Core.FinalRequestOptions<unknown>,
  ): Promise<void> {
    /**
     * The user should provide a bearer token provider if they want
     * to use Azure AD authentication. The user shouldn't set the
     * Authorization header manually because the header is overwritten
     * with the Azure AD token if a bearer token provider is provided.
     */
    if (opts.headers?.["api-key"]) {
      return super.prepareOptions(opts);
    }
    const token = await this._getAzureADToken();
    opts.headers ??= {};
    if (token) {
      opts.headers["Authorization"] = `Bearer ${token}`;
    } else if (this.apiKey !== API_KEY_SENTINEL) {
      opts.headers["api-key"] = this.apiKey;
    } else {
      throw new Errors.OpenAIError("Unable to handle auth");
    }
    return super.prepareOptions(opts);
  }
}

const _deployments_endpoints = new Set([
  "/completions",
  "/chat/completions",
  "/embeddings",
  "/audio/transcriptions",
  "/audio/translations",
  "/audio/speech",
  "/images/generations",
]);

const API_KEY_SENTINEL = "<Missing Key>";

// ---------------------- End Azure ----------------------

export default OpenAI;

declare let process: any;
