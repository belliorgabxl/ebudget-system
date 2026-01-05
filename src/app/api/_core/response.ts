export type ApiResponse<T> = {
  responseCode: string;
  responseMessage: string;
  data: T[];
};

export function ok<T>(data: T[] = [], message = "OK"): ApiResponse<T> {
  return { responseCode: "0000", responseMessage: message, data };
}

export function fail<T>(message: string, code = "9999"): ApiResponse<T> {
  return { responseCode: code, responseMessage: message, data: [] };
}
