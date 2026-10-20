// Shared request helper for the pages. The browser sends the account cookie.
export async function sendCampusApiRequest(path: string, body?: unknown) {
  const response = await fetch('/api/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new Error('The server did not respond. Please try again.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'Something went wrong. Please try again.');
  }

  return result;
}
