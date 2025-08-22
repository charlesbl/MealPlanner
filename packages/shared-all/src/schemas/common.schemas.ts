export type APIResponsePayload<T> =
    | {
          status: "success";
          data: T;
      }
    | {
          status: "error";
          error: string;
      };
