// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from "../../../core.ts";
import { APIResource } from "../../../resource.ts";
import { isRequestOptions } from "../../../core.ts";
import { sleep } from "../../../core.ts";
import { Uploadable } from "../../../core.ts";
import { allSettledWithThrow } from "../../../lib/Util.ts";
import * as FileBatchesAPI from "./file-batches.ts";
import * as FilesAPI from "./files.ts";
import { VectorStoreFilesPage } from "./files.ts";
import { type CursorPageParams } from "../../../pagination.ts";

export class FileBatches extends APIResource {
  /**
   * Create a vector store file batch.
   */
  create(
    vectorStoreId: string,
    body: FileBatchCreateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<VectorStoreFileBatch> {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
    });
  }

  /**
   * Retrieves a vector store file batch.
   */
  retrieve(
    vectorStoreId: string,
    batchId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<VectorStoreFileBatch> {
    return this._client.get(
      `/vector_stores/${vectorStoreId}/file_batches/${batchId}`,
      {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      },
    );
  }

  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(
    vectorStoreId: string,
    batchId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<VectorStoreFileBatch> {
    return this._client.post(
      `/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`,
      {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      },
    );
  }

  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(
    vectorStoreId: string,
    body: FileBatchCreateParams,
    options?: Core.RequestOptions & { pollIntervalMs?: number },
  ): Promise<VectorStoreFileBatch> {
    const batch = await this.create(vectorStoreId, body);
    return await this.poll(vectorStoreId, batch.id, options);
  }

  /**
   * Returns a list of vector store files in a batch.
   */
  listFiles(
    vectorStoreId: string,
    batchId: string,
    query?: FileBatchListFilesParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<VectorStoreFilesPage, FilesAPI.VectorStoreFile>;
  listFiles(
    vectorStoreId: string,
    batchId: string,
    options?: Core.RequestOptions,
  ): Core.PagePromise<VectorStoreFilesPage, FilesAPI.VectorStoreFile>;
  listFiles(
    vectorStoreId: string,
    batchId: string,
    query: FileBatchListFilesParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<VectorStoreFilesPage, FilesAPI.VectorStoreFile> {
    if (isRequestOptions(query)) {
      return this.listFiles(vectorStoreId, batchId, {}, query);
    }
    return this._client.getAPIList(
      `/vector_stores/${vectorStoreId}/file_batches/${batchId}/files`,
      VectorStoreFilesPage,
      {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      },
    );
  }

  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(
    vectorStoreId: string,
    batchId: string,
    options?: Core.RequestOptions & { pollIntervalMs?: number },
  ): Promise<VectorStoreFileBatch> {
    const headers: { [key: string]: string } = {
      ...options?.headers,
      "X-Stainless-Poll-Helper": "true",
    };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs
        .toString();
    }

    while (true) {
      const { data: batch, response } = await this.retrieve(
        vectorStoreId,
        batchId,
        {
          ...options,
          headers,
        },
      ).withResponse();

      switch (batch.status) {
        case "in_progress":
          let sleepInterval = 5000;

          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return batch;
      }
    }
  }

  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(
    vectorStoreId: string,
    { files, fileIds = [] }: { files: Uploadable[]; fileIds?: string[] },
    options?: Core.RequestOptions & {
      pollIntervalMs?: number;
      maxConcurrency?: number;
    },
  ): Promise<VectorStoreFileBatch> {
    if (files === null || files.length == 0) {
      throw new Error("No files provided to process.");
    }

    const configuredConcurrency = options?.maxConcurrency ?? 5;
    //We cap the number of workers at the number of files (so we don't start any unnecessary workers)
    const concurrencyLimit = Math.min(configuredConcurrency, files.length);

    const client = this._client;
    const fileIterator = files.values();
    const allFileIds: string[] = [...fileIds];

    //This code is based on this design. The libraries don't accommodate our environment limits.
    // https://stackoverflow.com/questions/40639432/what-is-the-best-way-to-limit-concurrency-when-using-es6s-promise-all
    async function processFiles(iterator: IterableIterator<Uploadable>) {
      for (let item of iterator) {
        const fileObj = await client.files.create({
          file: item,
          purpose: "assistants",
        }, options);
        allFileIds.push(fileObj.id);
      }
    }

    //Start workers to process results
    const workers = Array(concurrencyLimit).fill(fileIterator).map(
      processFiles,
    );

    //Wait for all processing to complete.
    await allSettledWithThrow(workers);

    return await this.createAndPoll(vectorStoreId, {
      file_ids: allFileIds,
    });
  }
}

/**
 * A batch of files attached to a vector store.
 */
export interface VectorStoreFileBatch {
  /**
   * The identifier, which can be referenced in API endpoints.
   */
  id: string;

  /**
   * The Unix timestamp (in seconds) for when the vector store files batch was
   * created.
   */
  created_at: number;

  file_counts: VectorStoreFileBatch.FileCounts;

  /**
   * The object type, which is always `vector_store.file_batch`.
   */
  object: "vector_store.files_batch";

  /**
   * The status of the vector store files batch, which can be either `in_progress`,
   * `completed`, `cancelled` or `failed`.
   */
  status: "in_progress" | "completed" | "cancelled" | "failed";

  /**
   * The ID of the
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object)
   * that the [File](https://platform.openai.com/docs/api-reference/files) is
   * attached to.
   */
  vector_store_id: string;
}

export namespace VectorStoreFileBatch {
  export interface FileCounts {
    /**
     * The number of files that where cancelled.
     */
    cancelled: number;

    /**
     * The number of files that have been processed.
     */
    completed: number;

    /**
     * The number of files that have failed to process.
     */
    failed: number;

    /**
     * The number of files that are currently being processed.
     */
    in_progress: number;

    /**
     * The total number of files.
     */
    total: number;
  }
}

export interface FileBatchCreateParams {
  /**
   * A list of [File](https://platform.openai.com/docs/api-reference/files) IDs that
   * the vector store should use. Useful for tools like `file_search` that can access
   * files.
   */
  file_ids: Array<string>;
}

export interface FileBatchListFilesParams extends CursorPageParams {
  /**
   * A cursor for use in pagination. `before` is an object ID that defines your place
   * in the list. For instance, if you make a list request and receive 100 objects,
   * ending with obj_foo, your subsequent call can include before=obj_foo in order to
   * fetch the previous page of the list.
   */
  before?: string;

  /**
   * Filter by file status. One of `in_progress`, `completed`, `failed`, `cancelled`.
   */
  filter?: "in_progress" | "completed" | "failed" | "cancelled";

  /**
   * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
   * order and `desc` for descending order.
   */
  order?: "asc" | "desc";
}

export namespace FileBatches {
  export type VectorStoreFileBatch = FileBatchesAPI.VectorStoreFileBatch;
  export type FileBatchCreateParams = FileBatchesAPI.FileBatchCreateParams;
  export type FileBatchListFilesParams =
    FileBatchesAPI.FileBatchListFilesParams;
}

export { VectorStoreFilesPage };
