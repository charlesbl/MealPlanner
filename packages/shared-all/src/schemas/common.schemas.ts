export type APIResponse<T> =
    | {
          status: "success";
          data: T;
      }
    | {
          status: "error";
          error: string;
      };
