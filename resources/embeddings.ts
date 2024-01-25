// File generated from our OpenAPI spec by Stainless.

import * as Core from "../core.ts";
import { APIResource } from "../resource.ts";
import * as EmbeddingsAPI from "./embeddings.ts";

export class Embeddings extends APIResource {
  /**
   * Creates an embedding vector representing the input text.
   */
  create(
    body: EmbeddingCreateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<CreateEmbeddingResponse> {
    return this._client.post("/embeddings", { body, ...options });
  }
}

export interface CreateEmbeddingResponse {
  /**
   * The list of embeddings generated by the model.
   */
  data: Array<Embedding>;

  /**
   * The name of the model used to generate the embedding.
   */
  model: string;

  /**
   * The object type, which is always "list".
   */
  object: "list";

  /**
   * The usage information for the request.
   */
  usage: CreateEmbeddingResponse.Usage;
}

export namespace CreateEmbeddingResponse {
  /**
   * The usage information for the request.
   */
  export interface Usage {
    /**
     * The number of tokens used by the prompt.
     */
    prompt_tokens: number;

    /**
     * The total number of tokens used by the request.
     */
    total_tokens: number;
  }
}

/**
 * Represents an embedding vector returned by embedding endpoint.
 */
export interface Embedding {
  /**
   * The embedding vector, which is a list of floats. The length of vector depends on
   * the model as listed in the
   * [embedding guide](https://platform.openai.com/docs/guides/embeddings).
   */
  embedding: Array<number>;

  /**
   * The index of the embedding in the list of embeddings.
   */
  index: number;

  /**
   * The object type, which is always "embedding".
   */
  object: "embedding";
}

export interface EmbeddingCreateParams {
  /**
   * Input text to embed, encoded as a string or array of tokens. To embed multiple
   * inputs in a single request, pass an array of strings or array of token arrays.
   * The input must not exceed the max input tokens for the model (8192 tokens for
   * `text-embedding-ada-002`), cannot be an empty string, and any array must be 2048
   * dimensions or less.
   * [Example Python code](https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken)
   * for counting tokens.
   */
  input: string | Array<string> | Array<number> | Array<Array<number>>;

  /**
   * ID of the model to use. You can use the
   * [List models](https://platform.openai.com/docs/api-reference/models/list) API to
   * see all of your available models, or see our
   * [Model overview](https://platform.openai.com/docs/models/overview) for
   * descriptions of them.
   */
  model:
    | (string & {})
    | "text-embedding-ada-002"
    | "text-embedding-3-small"
    | "text-embedding-3-large";

  /**
   * The number of dimensions the resulting output embeddings should have. Only
   * supported in `text-embedding-3` and later models.
   */
  dimensions?: number;

  /**
   * The format to return the embeddings in. Can be either `float` or
   * [`base64`](https://pypi.org/project/pybase64/).
   */
  encoding_format?: "float" | "base64";

  /**
   * A unique identifier representing your end-user, which can help OpenAI to monitor
   * and detect abuse.
   * [Learn more](https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids).
   */
  user?: string;
}

export namespace Embeddings {
  export type CreateEmbeddingResponse = EmbeddingsAPI.CreateEmbeddingResponse;
  export type Embedding = EmbeddingsAPI.Embedding;
  export type EmbeddingCreateParams = EmbeddingsAPI.EmbeddingCreateParams;
}
