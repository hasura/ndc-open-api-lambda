/**
 *
 * @param headersString The list of headers in the format: `key1=value1&key2=value2&key3=value3`
 * @returns map of header keys to header values
 */
export function parseHeaders(
  headersString: string | undefined,
): Map<string, string> {
  const headerMap = new Map<string, string>();
  if (!headersString) {
    return headerMap;
  }
  for (let h of headersString.split("&")) {
    const splitStr = h.split("=");
    const key = `${splitStr[0]}`;
    const value = splitStr.slice(1, splitStr.length).join("=");
    headerMap.set(key, value);
  }
  return headerMap;
}
