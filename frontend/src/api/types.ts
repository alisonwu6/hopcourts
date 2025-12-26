// Placeholder for shared API types. When OpenAPI types are available,
// re-export them here to keep imports consistent.
export type ApiResponse<T> = {
  ok: boolean
  data: T
}
